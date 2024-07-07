"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAY = exports.insertUser = exports.ADMIN_ACCESS_WITHOUT_PASSWORD = exports.EMPTY_PASSWORD = exports.PASSWORDLESS_ADMIN_USERNAME = exports.ConnectionChecker = void 0;
const index_1 = require("./index");
const prostgles_types_1 = require("prostgles-types");
const cors_1 = __importDefault(require("cors"));
const AuthHandler_1 = require("prostgles-server/dist/AuthHandler");
const authConfig_1 = require("./authConfig/authConfig");
const electronConfig_1 = require("./electronConfig");
const tableConfig_1 = require("./tableConfig");
const envVars_1 = require("./envVars");
const authUtils_1 = require("./authConfig/authUtils");
class ConnectionChecker {
    app;
    constructor(app) {
        this.app = app;
        app.use((0, cors_1.default)(this.withOrigin));
    }
    onSocketConnected = async ({ sid, getUser }) => {
        /** Ensure that only 1 session is allowed for the passwordless admin */
        await this.withConfig();
        if (this.noPasswordAdmin) {
            // const mySession = await this.db?.sessions.findOne({ id: sid });
            // const me = await getUser();
            // console.log(me)
            const pwdLessSession = await this.db?.sessions.findOne({ user_id: this.noPasswordAdmin.id, active: true });
            if (pwdLessSession && pwdLessSession.id !== sid) {
                throw "Only 1 session is allowed for the passwordless admin. If you're seeing this then the passwordless admin session has already been assigned to a different device/browser";
            }
        }
    };
    initialised = {
        users: false,
        config: false
    };
    withConfig = async () => {
        if (!this.db)
            throw "dbs missing";
        if (this.config.loaded)
            return this.config;
        return new Promise(async (resolve, reject) => {
            if (!this.db)
                throw "dbs missing";
            let resolved = false;
            const initialise = (what) => {
                if (what === "users")
                    this.initialised.users = true;
                if (what === "config")
                    this.initialised.config = true;
                const { users, config } = this.initialised;
                if (users && config && !resolved) {
                    resolved = true;
                    resolve(this.config);
                }
            };
            await this.usersSub?.unsubscribe();
            const setNoPasswordAdmin = async () => {
                this.noPasswordAdmin = await (0, exports.ADMIN_ACCESS_WITHOUT_PASSWORD)(this.db);
                initialise("users");
            };
            await setNoPasswordAdmin();
            let skippedFirst = false;
            this.usersSub = await this.db.users.subscribe({}, { limit: 1 }, async () => {
                if (skippedFirst) {
                    await setNoPasswordAdmin();
                }
                else {
                    skippedFirst = true;
                }
            });
            await this.configSub?.unsubscribe();
            this.configSub = await this.db.global_settings.subscribeOne({}, {}, async (gconfigs) => {
                this.config.global_setting = gconfigs;
                this.config.loaded = true;
                this.app.set("trust proxy", this.config.global_setting?.trust_proxy ?? false);
                // const cidrRequests = (gconfigs.allowed_ips ?? []).map(cidr => 
                //   db.sql!(
                //     getCIDRRangesQuery({ cidr, returns: ["from", "to"]  }),
                //     { cidr },
                //     { returnType: "row" }
                //   )
                // ) as any
                // this.ipRanges = await Promise.all(cidrRequests);
                initialise("config");
            });
        });
    };
    onUse = async ({ req, res, next, getUser }) => {
        if (!this.config.loaded || !this.db) {
            console.warn("Delaying user request until server is ready. originalUrl: " + req.originalUrl);
            await (0, index_1.tout)(3000);
            res.redirect(req.originalUrl);
            return;
        }
        const electronConfig = (0, electronConfig_1.getElectronConfig)();
        const sid = req.cookies[authConfig_1.sidKeyName];
        if (electronConfig?.isElectron && electronConfig.sidConfig.electronSid !== sid) {
            res.json({ error: "Not authorized" });
            return;
        }
        if (!electronConfig?.isElectron) {
            /** Add cors config if missing */
            if (!this.config.global_setting) {
                await this.db.global_settings.insert({
                    /** Origin "*" is required to enable API access */
                    allowed_origin: this.noPasswordAdmin ? null : "*",
                    // allowed_ips_enabled: this.noPasswordAdmin? true : false,
                    allowed_ips_enabled: false,
                    allowed_ips: Array.from(new Set([req.ip, "::ffff:127.0.0.1"])).filter(prostgles_types_1.isDefined),
                    tableConfig: tableConfig_1.tableConfig,
                });
                const magicLinkPaswordless = await getPasswordlessMacigLink(this.db, req);
                if (magicLinkPaswordless) {
                    res.redirect(magicLinkPaswordless);
                    return;
                }
            }
            if (this.noPasswordAdmin) {
                // need to ensure that only 1 session is allowed for the passwordless admin
            }
            if (this.config.global_setting?.allowed_ips_enabled) {
                const c = await this.checkClientIP({ req });
                if (!c.isAllowed) {
                    res.status(403).json({ error: "Your IP is not allowed" });
                    return;
                }
            }
            const publicConnections = index_1.connMgr.getConnectionsWithPublicAccess();
            if ((0, electronConfig_1.isDemoMode)() || publicConnections.length) {
                const isLoggingIn = req.originalUrl.startsWith("/magic-link/") || req.originalUrl.startsWith("/login");
                const client = (0, AuthHandler_1.getLoginClientInfo)({ httpReq: req });
                const hasNoActiveSession = !sid || !(await (0, authConfig_1.getActiveSession)(this.db, { type: "session-id", client, filter: { id: sid } }));
                /** If test mode and no sid then create a random account and redirect to magic login link */
                if (this._db && hasNoActiveSession && !isLoggingIn) {
                    const newRandomUser = await (0, exports.insertUser)(this.db, this._db, {
                        username: `user-${(new Date).toISOString()}_${Math.round(Math.random() * 1e8)}`,
                        password: "",
                        type: "public",
                    });
                    if (newRandomUser) {
                        const mlink = await makeMagicLink(newRandomUser, this.db, "/", Date.now() + exports.DAY * 2);
                        res.redirect(mlink.magic_login_link_redirect);
                        return;
                    }
                }
            }
        }
        next();
    };
    noPasswordAdmin;
    // ipRanges: IPRange[] = [];
    db;
    _db;
    config = {
        loaded: false
    };
    usersSub;
    configSub;
    init = async (db, _db) => {
        this.db = db;
        this._db = _db;
        await initUsers(db, _db);
        await this.withConfig();
    };
    /**
     * This is mainly used to ensure that when there is passwordless admin access external IPs cannot connect
     */
    checkClientIP = async (args) => {
        const ip = "req" in args ? args.req.ip : args.socket?.conn?.remoteAddress;
        const isAllowed = await (args.dbsTX || this.db)?.sql("SELECT inet ${ip} <<= any (allowed_ips::inet[]) FROM global_settings ", { ip }, { returnType: "value" });
        return {
            ip,
            isAllowed //: (args.byPassedRanges || this.ipRanges).some(({ from, to }) => ip && ip >= from && ip <= to )
        };
    };
    withOrigin = {
        origin: (origin, cb) => {
            cb(null, this.config.global_setting?.allowed_origin ?? undefined);
        }
    };
}
exports.ConnectionChecker = ConnectionChecker;
exports.PASSWORDLESS_ADMIN_USERNAME = "passwordless_admin";
exports.EMPTY_PASSWORD = "";
const NoInitialAdminPasswordProvided = Boolean(!envVars_1.PRGL_USERNAME || !envVars_1.PRGL_PASSWORD);
const ADMIN_ACCESS_WITHOUT_PASSWORD = async (db) => {
    if (NoInitialAdminPasswordProvided) {
        return await db.users.findOne({ username: exports.PASSWORDLESS_ADMIN_USERNAME, status: "active", passwordless_admin: true });
    }
    return undefined;
};
exports.ADMIN_ACCESS_WITHOUT_PASSWORD = ADMIN_ACCESS_WITHOUT_PASSWORD;
/**
 * If PRGL_USERNAME and PRGL_PASSWORD are specified then create an admin user with these credentials AND allow any IP to connect
 * Otherwise:
 * Create a passwordless admin (PASSWORDLESS_ADMIN_USERNAME, EMPTY_PASSWORD) and allow the first IP to connect
 *  then, the first user to connect must select between these options:
 *    1) Add an account with password (recommended)
 *    2) Continue to allow only the current IP
 *    3) Allow any IP to connect (not recommended)
 *
 */
const initUsers = async (db, _db) => {
    let username = envVars_1.PRGL_USERNAME, password = envVars_1.PRGL_PASSWORD;
    if (NoInitialAdminPasswordProvided) {
        username = exports.PASSWORDLESS_ADMIN_USERNAME;
        password = exports.EMPTY_PASSWORD;
    }
    /**
     * No user. Must create
     */
    if (!(await db.users.count({ username }))) {
        if (NoInitialAdminPasswordProvided) {
            console.warn(`PRGL_USERNAME or PRGL_PASSWORD missing. Creating a passwordless admin user: ${username}`);
        }
        try {
            const u = await db.users.insert({ username, password, type: "admin", passwordless_admin: Boolean(NoInitialAdminPasswordProvided) }, { returning: "*" });
            if (!u)
                throw "User not inserted";
            await _db.any("UPDATE users SET password = ${hashedPassword}, status = 'active' WHERE status IS NULL AND id = ${id};", { id: u.id, hashedPassword: (0, authUtils_1.getPasswordHash)(u, "") });
        }
        catch (e) {
            console.error(e);
        }
        console.log("Added users: ", await db.users.find({ username }));
    }
    const electron = await (0, electronConfig_1.getElectronConfig)();
    if (electron?.isElectron) {
        const user = await (0, exports.ADMIN_ACCESS_WITHOUT_PASSWORD)(db);
        if (!user)
            throw `Unexpected: Electron passwordless_admin misssing`;
        await db.sessions.delete({});
        await (0, authConfig_1.makeSession)(user, { ip_address: "::1", user_agent: "electron", type: "desktop", sid: electron.sidConfig.electronSid }, db, Date.now() + 10 * authConfig_1.YEAR);
        electron.sidConfig.onSidWasSet();
    }
};
const insertUser = async (db, _db, u) => {
    const user = await db.users.insert(u, { returning: "*" });
    if (!user.id)
        throw "User id missing";
    if (typeof user.password !== "string")
        throw "Password missing";
    const hashedPassword = (0, authUtils_1.getPasswordHash)(user, user.password);
    // await _db.any("UPDATE users SET password = crypt(password, id::text) WHERE id = ${id};", user);
    await _db.any("UPDATE users SET password = ${hashedPassword} WHERE id = ${id};", { id: user.id, hashedPassword });
    return db.users.findOne({ id: user.id });
};
exports.insertUser = insertUser;
exports.DAY = 24 * 3600 * 1000;
const makeMagicLink = async (user, dbo, returnURL, expires) => {
    const maxDays = (await dbo.global_settings.findOne())?.magic_link_validity_days ?? 2;
    const mlink = await dbo.magic_links.insert({
        expires: expires ?? Date.now() + exports.DAY * maxDays,
        user_id: user.id,
    }, { returning: "*" });
    return {
        id: user.id,
        magic_login_link_redirect: `/magic-link/${mlink.id}?returnURL=${returnURL}`
    };
};
// 10 years
// /magic-link/9a755390-3b3b-4869-805a-59c04ee4d4d9
// 12 months
// /magic-link/60d9a450-0e08-4970-9c25-065ddcc14e86
// 1984853878528
const getPasswordlessMacigLink = async (dbs, req) => {
    /** Create session for passwordless admin */
    const u = await (0, exports.ADMIN_ACCESS_WITHOUT_PASSWORD)(dbs);
    if (u) {
        const existingLink = await dbs.magic_links.findOne({ user_id: u.id, "magic_link_used.<>": null });
        if (existingLink)
            throw "Only one magic links allowed for passwordless admin";
        const mlink = await makeMagicLink(u, dbs, "/", Date.now() + 10 * authConfig_1.YEAR);
        // socket.emit("redirect", mlink.magic_login_link_redirect);
        return mlink.magic_login_link_redirect;
    }
    return undefined;
};
//# sourceMappingURL=ConnectionChecker.js.map