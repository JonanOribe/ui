"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertConnection = exports.restartProc = exports.get = exports.connMgr = exports.auth = exports.MEDIA_ROUTE_PREFIX = exports.HAS_EMPTY_USERNAME = exports.EMPTY_PASSWORD = exports.EMPTY_USERNAME = exports.testDBConnection = exports.getConnectionDetails = exports.validateConnection = void 0;
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const prostgles_server_1 = __importDefault(require("prostgles-server"));
const tableConfig_1 = require("./tableConfig");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
const publishMethods_1 = require("./publishMethods");
// console.log("Connecting to state database" , process.env)
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});
const http_1 = __importDefault(require("http"));
const http = http_1.default.createServer(app);
const ioPath = process.env.PRGL_IOPATH || "/iosckt";
const socket_io_1 = require("socket.io");
const io = new socket_io_1.Server(http, { path: ioPath, maxHttpBufferSize: 100e100 });
const pg_promise_1 = __importDefault(require("pg-promise"));
const pgp = (0, pg_promise_1.default)();
const connection_string_1 = require("connection-string");
const publish_1 = require("./publish");
// const dns = require('dns');
const validateConnection = (c) => {
    var _a, _b, _d, _e, _f, _g, _h, _j;
    let result = Object.assign({}, c);
    if (c.type === "Connection URI") {
        if (!c.db_conn) {
            result.db_conn = (0, exports.validateConnection)(Object.assign(Object.assign({}, result), { type: "Standard" })).db_conn;
        }
        const cs = new connection_string_1.ConnectionString(result.db_conn);
        const params = (_a = cs.params) !== null && _a !== void 0 ? _a : {};
        const { sslmode, host, port, dbname, user, password, } = params;
        result.db_host = (_b = cs.hosts[0].name) !== null && _b !== void 0 ? _b : host;
        result.db_port = (_d = cs.hosts[0].port) !== null && _d !== void 0 ? _d : +port;
        result.db_user = (_e = cs.user) !== null && _e !== void 0 ? _e : user;
        result.db_pass = (_f = cs.password) !== null && _f !== void 0 ? _f : password;
        result.db_name = (_g = cs.path[0]) !== null && _g !== void 0 ? _g : dbname;
        result.db_ssl = sslmode;
        // result.type = "Standard"
    }
    else if (c.type === "Standard" || c.db_host) {
        const cs = new connection_string_1.ConnectionString(null, { protocol: "postgres" });
        cs.hosts = [{ name: c.db_host, port: c.db_port }];
        cs.password = c.db_pass;
        cs.user = c.db_user;
        cs.path = [c.db_name];
        cs.params = { sslmode: (_h = c.db_ssl) !== null && _h !== void 0 ? _h : "prefer" };
        result.db_conn = cs.toString();
    }
    else
        throw "Not supported";
    result.db_user = result.db_user || "postgres";
    result.db_host = result.db_host || "localhost";
    result.db_ssl = result.db_ssl || "prefer";
    result.db_port = (_j = result.db_port) !== null && _j !== void 0 ? _j : 5432;
    return result;
};
exports.validateConnection = validateConnection;
const getConnectionDetails = (c) => {
    var _a;
    /**
     * Cannot use connection uri without having ssl issues
     * https://github.com/brianc/node-postgres/issues/2281
     */
    const getSSLOpts = (sslmode, rejectUnauthorized) => {
        var _a, _b, _d, _e;
        return ({
            ca: (_a = c.ssl_certificate) !== null && _a !== void 0 ? _a : undefined,
            cert: (_b = c.ssl_client_certificate) !== null && _b !== void 0 ? _b : undefined,
            key: (_d = c.ssl_client_certificate_key) !== null && _d !== void 0 ? _d : undefined,
            rejectUnauthorized: (_e = c.ssl_reject_unauthorized) !== null && _e !== void 0 ? _e : (sslmode === "require" && !!c.ssl_certificate || sslmode === "verify-ca" || sslmode === "verify-full")
        });
    };
    if (c.type === "Connection URI") {
        const cs = new connection_string_1.ConnectionString(c.db_conn);
        const params = (_a = cs.params) !== null && _a !== void 0 ? _a : {};
        const { sslmode, application_name = "prostgles" } = params;
        return {
            // connectionString: c.db_conn,
            application_name,
            host: cs.hosts[0].name,
            port: cs.hosts[0].port,
            user: cs.user,
            password: cs.password,
            database: cs.path[0],
            ssl: getSSLOpts(sslmode)
        };
    }
    return {
        database: c.db_name,
        user: c.db_user,
        password: c.db_pass,
        host: c.db_host,
        port: c.db_port,
        ssl: getSSLOpts(c.db_ssl)
    };
};
exports.getConnectionDetails = getConnectionDetails;
const testDBConnection = (_c, expectSuperUser = false) => {
    const con = (0, exports.validateConnection)(_c);
    if (typeof con !== "object" || !("db_host" in con) && !("db_conn" in con)) {
        throw "Incorrect database connection info provided. " +
            "\nExpecting: \
      db_conn: string; \
      OR \
      db_user: string; db_pass: string; db_host: string; db_port: number; db_name: string, db_ssl: string";
    }
    // console.log(db_conn)
    return new Promise(async (resolve, reject) => {
        let connOpts = (0, exports.getConnectionDetails)(con);
        const db = pgp(Object.assign(Object.assign({}, connOpts), { connectionTimeoutMillis: 1000 }));
        db.connect()
            .then(async function (c) {
            // console.log(connOpts, "success, release connectio ", await db.any("SELECT current_database(), current_user, (select usesuper from pg_user where usename = CURRENT_USER)"))
            if (expectSuperUser) {
                const yes = await c.oneOrNone(`select usesuper from pg_user where usename = CURRENT_USER;`);
                if (!(yes === null || yes === void 0 ? void 0 : yes.usesuper)) {
                    reject("Provided user must be a superuser");
                    return;
                }
            }
            c.done(); // success, release connection;
            resolve(true);
        }).catch(err => {
            console.error("testDBConnection fail", { err });
            reject(err instanceof Error ? err.message : JSON.stringify(err));
        });
        /**
         * Used to prevent connecting to localhost or internal networks
         */
        // dns.lookup(host, function(err, result) {
        //   if(err) return reject(err);
        //   else if(["127.0.0.1"].includes(result)){
        //     return reject("localhost not allowed");
        //   } else {
        //     resolve(pgp({ user: username, password, host, port, databse, ssl }).connect());
        //   }
        // });
    });
};
exports.testDBConnection = testDBConnection;
const dotenv = require('dotenv');
exports.EMPTY_USERNAME = "prostgles-no-auth-user", exports.EMPTY_PASSWORD = "prostgles";
const HAS_EMPTY_USERNAME = async (db) => {
    if (!PRGL_USERNAME || !PRGL_PASSWORD) {
        if (await db.users.count({ username: exports.EMPTY_USERNAME, status: "active" })) {
            return true;
        }
    }
    return false;
};
exports.HAS_EMPTY_USERNAME = HAS_EMPTY_USERNAME;
const result = dotenv.config({ path: path_1.default.join(__dirname + '/../../.env') });
const { PRGL_USERNAME, PRGL_PASSWORD, POSTGRES_URL, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER, POSTGRES_SSL, PROSTGLES_STRICT_COOKIE, } = (result === null || result === void 0 ? void 0 : result.parsed) || {};
const PORT = +((_a = process.env.PRGL_PORT) !== null && _a !== void 0 ? _a : 3004);
http.listen(PORT);
const log = (msg, extra) => {
    console.log(...[`(server): ${(new Date()).toISOString()} ` + msg, extra].filter(v => v));
};
app.use(express_1.default.static(path_1.default.join(__dirname, "../../client/build"), { index: false }));
app.use(express_1.default.static(path_1.default.join(__dirname, "../../client/static"), { index: false }));
const makeSession = async (user, dbo, expires = 0) => {
    if (user) {
        const session = await dbo.sessions.insert({
            user_id: user.id,
            user_type: user.type,
            expires,
        }, { returning: "*" });
        return { sid: session.id, expires: +session.expires }; //60*60*60 }; 
    }
    else {
        throw "Invalid user";
    }
};
/* AUTH */
const cookie_parser_1 = __importDefault(require("cookie-parser"));
app.use((0, cookie_parser_1.default)());
let authCookieOpts = (process.env.PROSTGLES_STRICT_COOKIE || PROSTGLES_STRICT_COOKIE) ? {} : {
    secure: false,
    sameSite: "lax" //  "none"
};
exports.MEDIA_ROUTE_PREFIX = `/prostgles_media`;
const BackupManager_1 = require("./BackupManager");
exports.auth = {
    sidKeyName: "sid_token",
    getUser: async (sid, db, _db) => {
        log("getUser", sid);
        const s = await db.sessions.findOne({ id: sid });
        let user;
        if (s) {
            user = await db.users.findOne({ id: s.user_id });
            if (user) {
                const state_db = await db.connections.findOne({ is_state_db: true });
                return {
                    user,
                    clientUser: Object.assign({ sid: s.id, uid: user.id, state_db_id: state_db === null || state_db === void 0 ? void 0 : state_db.id }, (0, PubSubManager_1.omitKeys)(user, ["password"]))
                };
            }
        }
        // console.trace("getUser", { user, s })
        return undefined;
    },
    login: async ({ username = null, password = null } = {}, db, _db) => {
        let u;
        log("login", username);
        /**
         * If no login config provided then login automatically
         */
        // if(!PRGL_USERNAME){
        //   username = EMPTY_USERNAME; 
        //   password = EMPTY_PASSWORD;
        // }
        try {
            u = await _db.one("SELECT * FROM users WHERE username = ${username} AND password = crypt(${password}, id::text) AND status = 'active';", { username, password });
        }
        catch (e) {
            throw "User and password not matching anything";
        }
        if (!u) {
            // console.log( await db.users.find())
            throw "something went wrong: " + JSON.stringify({ username, password });
        }
        let s = await db.sessions.findOne({ user_id: u.id });
        if (!s || (+s.expires || 0) < Date.now()) {
            return makeSession(u, db, Date.now() + 1000 * 60 * 60 * 24);
            // would expire after 24 hours,
        }
        return { sid: s.id, expires: +s.expires };
    },
    logout: async (sid, db, _db) => {
        if (!sid)
            throw "err";
        const s = await db.sessions.findOne({ id: sid });
        if (!s)
            throw "err";
        await db.sessions.delete({ id: sid });
        return true;
    },
    cacheSession: {
        getSession: async (sid, db) => {
            let s = await db.sessions.findOne({ id: sid });
            if (s)
                return Object.assign({ sid: s.id }, s);
            // throw "dwada"
            return undefined;
        }
    },
    expressConfig: {
        app,
        // userRoutes: ["/", "/connection", "/connections", "/profile", "/jobs", "/chats", "/chat", "/account", "/dashboard", "/registrations"],
        publicRoutes: ["/manifest.json", "/favicon.ico", "/prj"],
        onGetRequestOK: async (req, res, { getUser, db, dbo: dbs }) => {
            var _a, _b, _d, _e;
            console.log("onGetRequestOK", req.path);
            const BKP_PREFFIX = "/" + BackupManager_1.BACKUP_FOLDERNAME;
            if (req.path.startsWith(BKP_PREFFIX)) {
                const userData = await getUser();
                if (((_a = userData === null || userData === void 0 ? void 0 : userData.user) === null || _a === void 0 ? void 0 : _a.type) !== "admin") {
                    res.sendStatus(401);
                }
                else {
                    const bkpId = req.path.slice(BKP_PREFFIX.length + 1);
                    if (!bkpId) {
                        res.sendStatus(404);
                    }
                    else {
                        const bkp = await dbs.backups.findOne({ id: bkpId });
                        if (!bkp) {
                            res.sendStatus(404);
                        }
                        else {
                            const { fileMgr } = await (0, BackupManager_1.getFileMgr)(dbs, bkp.credential_id);
                            if (bkp.credential_id) {
                                /* Allow access at a download rate of 50KBps */
                                const presignedURL = await fileMgr.getFileS3URL(bkp.id, ((_b = bkp.sizeInBytes) !== null && _b !== void 0 ? _b : 1e6) / 50);
                                if (!presignedURL) {
                                    res.sendStatus(404);
                                }
                                else {
                                    res.redirect(presignedURL);
                                }
                            }
                            else {
                                try {
                                    res.type("text/plain");
                                    res.sendFile(path_1.default.join(__dirname + '/../../server' + BKP_PREFFIX + "/" + bkp.id));
                                }
                                catch (err) {
                                    res.sendStatus(404);
                                }
                            }
                        }
                    }
                }
            }
            else if (req.path.startsWith(exports.MEDIA_ROUTE_PREFIX)) {
                (_d = req.next) === null || _d === void 0 ? void 0 : _d.call(req);
                /* Must be socket io reconnecting */
            }
            else if (req.query.transport === "polling") {
                (_e = req.next) === null || _e === void 0 ? void 0 : _e.call(req);
            }
            else {
                res.sendFile(path_1.default.join(__dirname + '/../../client/build/index.html'));
            }
        },
        cookieOptions: authCookieOpts,
        magicLinks: {
            check: async (id, dbo, db) => {
                const mlink = await dbo.magic_links.findOne({ id });
                if (mlink) {
                    if (mlink.expires < Date.now())
                        throw "Expired magic link";
                }
                else
                    throw new Error("Magic link not found");
                const user = await dbo.users.findOne({ id: mlink.user_id });
                if (!user)
                    throw new Error("User from Magic link not found");
                return makeSession(user, dbo, mlink.expires);
            }
        }
    }
};
const DBS_CONNECTION_INFO = {
    type: !(process.env.POSTGRES_URL || POSTGRES_URL) ? "Standard" : "Connection URI",
    db_conn: process.env.POSTGRES_URL || POSTGRES_URL,
    db_name: process.env.POSTGRES_DB || POSTGRES_DB,
    db_user: process.env.POSTGRES_USER || POSTGRES_USER,
    db_pass: process.env.POSTGRES_PASSWORD || POSTGRES_PASSWORD,
    db_host: process.env.POSTGRES_HOST || POSTGRES_HOST,
    db_port: process.env.POSTGRES_PORT || POSTGRES_PORT,
    db_ssl: process.env.POSTGRES_SSL || POSTGRES_SSL,
};
const ConnectionManager_1 = require("./ConnectionManager");
const PubSubManager_1 = require("prostgles-server/dist/PubSubManager");
exports.connMgr = new ConnectionManager_1.ConnectionManager(http, app);
let conSub;
const getDBS = async () => {
    try {
        const con = DBS_CONNECTION_INFO;
        // console.log("Connecting to state database" , con, { POSTGRES_DB, POSTGRES_USER, POSTGRES_HOST }, process.env)
        if (!con.db_conn && !con.db_user && !con.db_name) {
            console.trace(con);
            throw `
        Make sure .env file contains superuser postgres credentials:
          POSTGRES_URL
          or
          POSTGRES_DB
          POSTGRES_USER

        Example:
          POSTGRES_USER=myusername 
          POSTGRES_PASSWORD=exampleText 
          POSTGRES_DB=mydatabase 
          POSTGRES_HOST=exampleText 
          POSTGRES_PORT=exampleText

        To create a superuser and database on linux:
          sudo -su postgres createuser -P --superuser myusername
          sudo -su postgres createdb mydatabase -O myusername

      `;
        }
        await (0, exports.testDBConnection)(con, true);
        (0, prostgles_server_1.default)({
            dbConnection: {
                host: con.db_host,
                port: +con.db_port || 5432,
                database: con.db_name,
                user: con.db_user,
                password: con.db_pass,
            },
            sqlFilePath: path_1.default.join(__dirname + '/../init.sql'),
            io,
            tsGeneratedTypesDir: path_1.default.join(__dirname + '/../'),
            transactions: true,
            onSocketConnect: async (_, dbo, db) => {
                var _a;
                log("onSocketConnect", (_a = _ === null || _ === void 0 ? void 0 : _.conn) === null || _a === void 0 ? void 0 : _a.remoteAddress);
                // await db.any("ALTER TABLE workspaces ADD COLUMN deleted boolean DEFAULT FALSE")
                const wrkids = await dbo.workspaces.find({ deleted: true }, { select: { id: 1 }, returnType: "values" });
                const wkspsFilter = wrkids.length ? { workspace_id: { $in: wrkids } } : {};
                const wids = await dbo.windows.find({ $or: [
                        { deleted: true },
                        { closed: true },
                        wkspsFilter
                    ] }, { select: { id: 1 }, returnType: "values" });
                if (wids.length) {
                    await dbo.links.delete({ $or: [
                            { w1_id: { $in: wids } },
                            { w2_id: { $in: wids } },
                            { deleted: true }
                        ] });
                    await dbo.windows.delete({ $or: [{ deleted: true }, wkspsFilter] });
                    await dbo.workspaces.delete({ deleted: true });
                }
                return true;
            },
            onSocketDisconnect: (_, dbo) => {
                // dbo.windows.delete({ deleted: true })
            },
            // DEBUG_MODE: true,
            tableConfig: tableConfig_1.tableConfig,
            publishRawSQL: async (params) => {
                const { user } = params;
                return Boolean(user && user.type === "admin");
            },
            auth: exports.auth,
            publishMethods: publishMethods_1.publishMethods,
            publish: params => (0, publish_1.publish)(params, con),
            joins: "inferred",
            onReady: async (db, _db) => {
                // db.backups.update({}, {restore_options: { "clean": true }});
                await (conSub === null || conSub === void 0 ? void 0 : conSub.unsubscribe());
                conSub = await db.connections.subscribe({}, {}, connections => {
                    exports.connMgr.saveCertificates(connections);
                });
                let username = PRGL_USERNAME, password = PRGL_PASSWORD;
                if (!PRGL_USERNAME || !PRGL_PASSWORD) {
                    username = exports.EMPTY_USERNAME;
                    password = exports.EMPTY_PASSWORD;
                }
                // await db.users.delete(); 
                if (!(await db.users.count({ username }))) {
                    if (await (0, exports.HAS_EMPTY_USERNAME)(db)) {
                        console.warn(`PRGL_USERNAME or PRGL_PASSWORD missing. Creating default user: ${username} with default password: ${password}`);
                    }
                    console.log((await db.users.count({ username })));
                    try {
                        const u = await db.users.insert({ username, password, type: "admin" }, { returning: "*" });
                        await _db.any("UPDATE users SET password = crypt(password, id::text), status = 'active' WHERE status IS NULL AND id = ${id};", u);
                    }
                    catch (e) {
                        console.error(e);
                    }
                    console.log("Added users: ", await db.users.find({ username }));
                }
                console.log("Prostgles UI is running on port ", PORT);
            },
        });
    }
    catch (err) {
        throw err;
    }
};
(async () => {
    let error, tries = 0;
    let interval = setInterval(async () => {
        try {
            await getDBS();
            tries = 6;
            error = null;
            // clearInterval(interval)
        }
        catch (err) {
            console.log("getDBS", err);
            error = err;
            tries++;
        }
        if (tries > 5) {
            clearInterval(interval);
            app.get("/dbs", (req, res) => {
                if (error) {
                    res.json({ err: error });
                }
                else {
                    res.json({ ok: true });
                }
            });
            if (error) {
                app.get("*", (req, res) => {
                    console.log(req.originalUrl);
                    res.sendFile(path_1.default.join(__dirname + '/../../client/build/index.html'));
                });
            }
            return;
        }
    }, 2000);
})();
app.post("/testupload", (req, res) => {
    console.log(req.body);
});
app.post("/dbs", async (req, res) => {
    const { db_conn, db_user, db_pass, db_host, db_port, db_name, db_ssl } = req.body;
    if (!db_conn || !db_host) {
        res.json({ ok: false });
    }
    try {
        await (0, exports.testDBConnection)({ db_conn, db_user, db_pass, db_host, db_port, db_name, db_ssl });
        res.json({ msg: "DBS changed. Restart system" });
    }
    catch (err) {
        res.json({ err });
    }
});
/* Get nested property from an object */
function get(obj, propertyPath) {
    let p = propertyPath, o = obj;
    if (!obj)
        return obj;
    if (typeof p === "string")
        p = p.split(".");
    return p.reduce((xs, x) => {
        if (xs && xs[x]) {
            return xs[x];
        }
        else {
            return undefined;
        }
    }, o);
}
exports.get = get;
function logProcess(proc) {
    const p = `PID ${proc.pid}`;
    proc.stdout.on('data', function (data) {
        console.log(p + ' stdout: ' + data);
    });
    proc.stderr.on('data', function (data) {
        console.log(p + ' stderr: ' + data);
    });
    proc.on('close', function (code) {
        console.log(p + ' child process exited with code ' + code);
    });
}
const spawn = require('child_process').spawn;
function restartProc(cb) {
    console.warn("Restarting process");
    if (process.env.process_restarting) {
        delete process.env.process_restarting;
        // Give old process one second to shut down before continuing ...
        setTimeout(() => {
            cb === null || cb === void 0 ? void 0 : cb();
            restartProc();
        }, 1000);
        return;
    }
    // ...
    // Restart process ...
    spawn(process.argv[0], process.argv.slice(1), {
        env: { process_restarting: 1 },
        stdio: 'ignore'
    }).unref();
}
exports.restartProc = restartProc;
const upsertConnection = async (con, user, dbs) => {
    if ((user === null || user === void 0 ? void 0 : user.type) !== "admin" || !user.id) {
        throw "User missing or not admin";
    }
    const c = (0, exports.validateConnection)(Object.assign(Object.assign({}, con), { user_id: user.id, last_updated: Date.now() }));
    await (0, exports.testDBConnection)(con);
    try {
        let res;
        if (con.id) {
            if (!(await dbs.connections.findOne({ id: con.id }))) {
                throw "Connection not found: " + con.id;
            }
            res = await dbs.connections.update({ id: con.id }, (0, PubSubManager_1.omitKeys)(c, ["id"]), { returning: "*" });
        }
        else {
            res = await dbs.connections.insert(c, { returning: "*" });
        }
        return res;
    }
    catch (e) {
        console.error(e);
        if (e && e.code === "23502") {
            throw { err_msg: ` ${e.column} cannot be empty` };
        }
        throw e;
    }
};
exports.upsertConnection = upsertConnection;
//# sourceMappingURL=index.js.map