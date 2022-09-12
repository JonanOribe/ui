"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuth = void 0;
const BackupManager_1 = require("./BackupManager");
const index_1 = require("./index");
const PubSubManager_1 = require("prostgles-server/dist/PubSubManager");
const otplib_1 = require("otplib");
const path_1 = __importDefault(require("path"));
let authCookieOpts = (process.env.PROSTGLES_STRICT_COOKIE || index_1.PROSTGLES_STRICT_COOKIE) ? {} : {
    secure: false,
    sameSite: "lax" //  "none"
};
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
const getAuth = (app) => {
    const auth = {
        sidKeyName: "sid_token",
        getUser: async (sid, db, _db) => {
            (0, index_1.log)("getUser", sid);
            const s = await db.sessions.findOne({ id: sid });
            let user;
            if (s) {
                user = await db.users.findOne({ id: s.user_id });
                if (user) {
                    const state_db = await db.connections.findOne({ is_state_db: true });
                    return {
                        user,
                        clientUser: {
                            sid: s.id,
                            uid: user.id,
                            state_db_id: state_db?.id,
                            has_2fa: !!user["2fa"]?.enabled,
                            ...(0, PubSubManager_1.omitKeys)(user, ["password", "2fa"])
                        }
                    };
                }
            }
            // console.trace("getUser", { user, s })
            return undefined;
        },
        login: async ({ username = null, password = null, totp_token = null, totp_recovery_code = null } = {}, db, _db) => {
            let u;
            (0, index_1.log)("login", username);
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
            if (u["2fa"]?.enabled) {
                if (totp_recovery_code && typeof totp_recovery_code === "string") {
                    const areMatching = await _db.any("SELECT * FROM users WHERE id = ${id} AND \"2fa\"->>'recoveryCode' = crypt(${code}, id::text) ", { id: u.id, code: totp_recovery_code.trim() });
                    if (!areMatching.length) {
                        throw "Invalid token";
                    }
                }
                else if (totp_token && typeof totp_token === "string") {
                    if (!otplib_1.authenticator.verify({ secret: u["2fa"].secret, token: totp_token })) {
                        throw "Invalid token";
                    }
                }
                else {
                    throw "Token missing";
                }
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
                    return { sid: s.id, ...s };
                // throw "dwada"
                return undefined;
            }
        },
        expressConfig: {
            app,
            // userRoutes: ["/", "/connection", "/connections", "/profile", "/jobs", "/chats", "/chat", "/account", "/dashboard", "/registrations"],
            publicRoutes: ["/manifest.json", "/favicon.ico", index_1.API_PATH],
            onGetRequestOK: async (req, res, { getUser, db, dbo: dbs }) => {
                console.log("onGetRequestOK", req.path);
                const BKP_PREFFIX = "/" + BackupManager_1.BACKUP_FOLDERNAME;
                if (req.path.startsWith(BKP_PREFFIX)) {
                    const userData = await getUser();
                    if (userData?.user?.type !== "admin") {
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
                                    const presignedURL = await fileMgr.getFileS3URL(bkp.id, (bkp.sizeInBytes ?? 1e6) / 50);
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
                                        res.sendFile(path_1.default.join(index_1.ROOT_DIR + BKP_PREFFIX + "/" + bkp.id));
                                    }
                                    catch (err) {
                                        res.sendStatus(404);
                                    }
                                }
                            }
                        }
                    }
                }
                else if (req.path.startsWith(index_1.MEDIA_ROUTE_PREFIX)) {
                    req.next?.();
                    /* Must be socket io reconnecting */
                }
                else if (req.query.transport === "polling") {
                    req.next?.();
                }
                else {
                    res.sendFile(path_1.default.join(index_1.ROOT_DIR + '/../client/build/index.html'));
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
    return auth;
};
exports.getAuth = getAuth;
//# sourceMappingURL=authConfig.js.map