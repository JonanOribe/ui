import path from 'path';
import express from 'express';
import prostgles from "prostgles-server";
import { tableConfig } from "./tableConfig";
const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
import fs from "fs";

// console.log("Connecting to state database" , process.env)

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

import _http from "http";
const http = _http.createServer(app);
// const exec = require('child_process').exec; 

const ioPath = process.env.PRGL_IOPATH || "/iosckt";

import { Server }  from "socket.io";
const io = new Server(http, { path: ioPath, maxHttpBufferSize: 100e100 });

import pgPromise from 'pg-promise';
const pgp = pgPromise();

import { publish } from "./publish"
// const dns = require('dns');

export const getConnectionDetails = (c: BareConnectionDetails): pg.IConnectionParameters<pg.IClient> => {
  return (c.type === "Connection URI")? {
    connectionString: c.db_conn
  } : {
    database: c.db_name, 
    user: c.db_user, 
    password: c.db_pass, 
    host: c.db_host,
    port: c.db_port,
    ssl: !(c.db_ssl && c.db_ssl !== "disable")? undefined : {
      rejectUnauthorized: false 
    },
  };
}

type BareConnectionDetails = Pick<Connections, "type" | "db_conn" | "db_host" | "db_name" | "db_pass" | "db_port" | "db_user" | "db_ssl">

export const testDBConnection = (opts: BareConnectionDetails, isSuperUser = false) => {
  
  if(typeof opts !== "object" || !("db_host" in opts) && !("db_conn" in opts)) {
    throw "Incorrect database connection info provided. " + 
    "\nExpecting: \
      db_conn: string; \
      OR \
      db_user: string; db_pass: string; db_host: string; db_port: number; db_name: string, db_ssl: string";
  }
  
  // console.log(db_conn)

  return new Promise((resolve, reject) => {
    const connOpts = getConnectionDetails(opts);
      
      const db = pgp(connOpts);
      db.connect()
        .then(async function (c) {
          // console.log(connOpts, "success, release connectio ", await db.any("SELECT current_database(), current_user, (select usesuper from pg_user where usename = CURRENT_USER)"))
          
          if(isSuperUser){
            const yes = await c.oneOrNone(`select usesuper from pg_user where usename = CURRENT_USER;`);
            if(!yes?.usesuper){
              reject("Provided user must be a superuser");
              return
            }
          }
          c.done(); // success, release connection;
          
          resolve(true);
        }).catch(err => {
          console.error("testDBConnection fail", {connOpts, err})
          reject(err)
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
  })
}

const dotenv = require('dotenv')

const EMPTY_USERNAME = "prostgles-no-auth-user",
  EMPTY_PASSWORD = "prostgles";
const HAS_EMPTY_USERNAME = async (db: DBOFullyTyped<DBSchemaGenerated>) => {
  if(
    !PRGL_USERNAME || !PRGL_PASSWORD
  ){
    if(await db.users.count({ username: EMPTY_USERNAME, status: "active" })){
      return true
    }
  }
  return false
};


const result = dotenv.config({ path: path.join(__dirname+'/../../.env') })
const {
  PRGL_USERNAME,
  PRGL_PASSWORD,

  POSTGRES_URL,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_SSL,
  PROSTGLES_STRICT_COOKIE,
} = result?.parsed || {};

const PORT = +process.env.PRGL_PORT ?? 3004
http.listen(PORT);

import { DBSchemaGenerated } from "./DBoGenerated";
// type DBObj = any;
export type Users = DBSchemaGenerated["users"]["columns"]; 
export type Connections = DBSchemaGenerated["connections"]["columns"]
import { DB, PGP } from 'prostgles-server/dist/Prostgles';

const log = (msg: string, extra?: any) => {
  console.log(...[`(server): ${(new Date()).toISOString()} ` + msg, extra].filter(v => v));
}

app.use(express.static(path.join(__dirname, "../../client/build"), { index: false }));
app.use(express.static(path.join(__dirname, "../../client/static"), { index: false }));

const makeSession = async (user: Users, dbo: DBOFullyTyped<DBSchemaGenerated> , expires: number) => {

  if(user){
    const session = await dbo.sessions.insert({ 
      user_id: user.id, 
      user_type: user.type, 
      expires, 
    }, { returning: "*" }) as any;
    
    return { sid: session.id, expires: +session.expires }; //60*60*60 }; 
  } else {
    throw "Invalid user";
  }
}
 
/* AUTH */ 
import cookieParser from 'cookie-parser';
import { Auth, BasicSession } from 'prostgles-server/dist/AuthHandler';
import { DBOFullyTyped } from "prostgles-server/dist/DBSchemaBuilder";
import pg from "pg-promise/typescript/pg-subset";

app.use(cookieParser());

let authCookieOpts = (process.env.PROSTGLES_STRICT_COOKIE || PROSTGLES_STRICT_COOKIE)? {} : {
  secure: false,
  sameSite: "lax"    //  "none"
};

export const MEDIA_ROUTE_PREFIX = `/prostgles_media`
 
export const auth: Auth<DBSchemaGenerated> = {
	sidKeyName: "sid_token",
	getUser: async (sid, db, _db: DB) => {
    log("getUser", sid);
		const s = await db.sessions.findOne({ id: sid });
    let user;
		if(s) {
      user = await db.users.findOne({ id: s.user_id });
      if(user){
        const state_db = await db.connections.findOne({ is_state_db: true });
        return {
          user,
          clientUser: { sid: s.id, uid: user.id, type: user.type, state_db_id: state_db?.id }
        }
      }
      // if(s.project_id && (await db.connections.count({ user_id: s.user_id, id: s.project_id }))){
      //   user = { ...user, project_id: s.project_id }
      // }
    }
    // console.trace("getUser", { user, s })
		return undefined;
	},
	login: async ({ username = null, password = null } = {}, db, _db: DB) => {
		let u;
    log("login", username)
    /**
     * If no login config provided then login automatically
     */
    // if(!PRGL_USERNAME){
    //   username = EMPTY_USERNAME; 
    //   password = EMPTY_PASSWORD;
    // }
    try {
      u = await _db.one("SELECT * FROM users WHERE username = ${username} AND password = crypt(${password}, id::text) AND status = 'active';", { username, password });
    } catch(e){
      throw "User and password not matching anything";
    }
		if(!u) {
			// console.log( await db.users.find())
			throw "something went wrong: " + JSON.stringify({ username, password });
		}
		let s = await db.sessions.findOne({ user_id: u.id })
		if(!s || (+s.expires || 0) < Date.now()){
			return makeSession(u, db, Date.now() + 1000 * 60 * 60 * 24)
     // would expire after 24 hours,
		}
    
		return { sid: s.id, expires: +s.expires }
	},
	logout: async (sid = null, db, _db: DB) => {
		const s = await db.sessions.findOne({ id: sid });
		if(!s) throw "err";
		await db.sessions.delete({ id: sid })
		return true; 
	},
  cacheSession: {
    getSession: async (sid, db) => {
      let s = await db.sessions.findOne({ id: sid });
      if(s) return { sid: s.id, ...s } as BasicSession;
      return undefined;
    }
  },
  expressConfig: {
    app,
    // userRoutes: ["/", "/connection", "/connections", "/profile", "/jobs", "/chats", "/chat", "/account", "/dashboard", "/registrations"],
    publicRoutes: ["/manifest.json", "/favicon.ico"], // ["/"],
    onGetRequestOK: (req, res) => {
      console.log("onGetRequestOK", req.path);

      if(req.path.startsWith(MEDIA_ROUTE_PREFIX)){
        (req as any).next();
      } else {
        res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
      }
    },
    cookieOptions: authCookieOpts,
    magicLinks: {
      check: async (id, dbo, db) => {
        const mlink = await dbo.magic_links.findOne({ id });
        
        if(mlink){
          if(mlink.expires < Date.now()) throw "Expired magic link";
        }
        const user = await dbo.users.findOne({ id: mlink.user_id });
  
        return makeSession(user, dbo , mlink.expires);
      }
    }
  }
};


const DBS_CONNECTION_INFO = {
  db_conn: process.env.POSTGRES_URL || POSTGRES_URL, 
  db_name: process.env.POSTGRES_DB || POSTGRES_DB, 
  db_user: process.env.POSTGRES_USER || POSTGRES_USER, 
  db_pass: process.env.POSTGRES_PASSWORD || POSTGRES_PASSWORD, 
  db_host: process.env.POSTGRES_HOST || POSTGRES_HOST, 
  db_port: process.env.POSTGRES_PORT || POSTGRES_PORT, 
  db_ssl:  process.env.POSTGRES_SSL || POSTGRES_SSL,
};

import { ConnectionManager } from "./ConnectionManager";
const connMgr = new ConnectionManager(http, app);

const getDBS = async () => {
  try {

    const con = DBS_CONNECTION_INFO;
    // console.log("Connecting to state database" , con, { POSTGRES_DB, POSTGRES_USER, POSTGRES_HOST }, process.env)

    if(!con.db_conn && !con.db_user && !con.db_name){
      console.trace(con)
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
    await testDBConnection(con, true);

    prostgles<DBSchemaGenerated>({
      dbConnection: {
        host: con.db_host,
        port: +con.db_port || 5432,
        database: con.db_name,
        user: con.db_user,
        password:  con.db_pass,
      },
      sqlFilePath: path.join(__dirname+'/../init.sql'),
      io,
      tsGeneratedTypesDir: path.join(__dirname + '/../'),
      transactions: true,
      onSocketConnect: async (_, dbo, db) => {
        log("onSocketConnect", (_ as any)?.conn?.remoteAddress);

        // await db.any("ALTER TABLE workspaces ADD COLUMN deleted boolean DEFAULT FALSE")
        const wrkids =  await dbo.workspaces.find({ deleted: true }, { select: { id: 1 }, returnType: "values" });
        const wkspsFilter: Parameters<typeof dbo.windows.find>[0] = wrkids.length? { workspace_id: { $in: wrkids } } : {};
        const wids = await dbo.windows.find({ $or: [
          { deleted: true }, 
          { closed: true },
          wkspsFilter
        ] }, { select: { id: 1 }, returnType: "values" });
        if(wids.length){
          await dbo.links.delete({ $or: [
            { w1_id: { $in: wids } }, 
            { w2_id: { $in: wids } },
            { deleted: true }
          ] })
          await dbo.windows.delete({ $or: [ { deleted: true }, wkspsFilter] });
          await dbo.workspaces.delete({ deleted: true });
  
        }
        return true; 
      },
      onSocketDisconnect: (_, dbo) => {
        // dbo.windows.delete({ deleted: true })
      },
      // DEBUG_MODE: true,
      tableConfig,
      publishRawSQL: async (params) => {
        const { user } = params
        return Boolean(user && user.type === "admin")
      },
      auth,
      publishMethods: async (params) => { //  socket, db: DBObj, _db, user: Users
        const { user, dbo: db, socket, db: _db } = params;

        if(!user || !user.id) {

          const makeMagicLink = async (user: Users, dbo, returnURL: string) => {
            const mlink = await dbo.magic_links.insert({ 
              expires: Number.MAX_SAFE_INTEGER, // Date.now() + 24 * 3600 * 1000, 
              user_id: user.id,
          
            }, {returning: "*"});
                    
            return {
              id: user.id,
              magic_login_link_redirect: `/magic-link/${mlink.id}?returnURL=${returnURL}`
            };
          }
          /** If no user exists then make */
          if(await HAS_EMPTY_USERNAME(db)){
            const u = await db.users.findOne({ username: EMPTY_USERNAME });
            const mlink = await makeMagicLink(u, db, "/")
            socket.emit("redirect", mlink.magic_login_link_redirect);
          }

          return null;
        }

        const adminMethods = {
          getFileFolderSizeInBytes: (conId?: string) => {
            const dirSize = async (directory: string) => {
              const files = fs.readdirSync( directory );
              const stats = files.map( file => fs.statSync( path.join( directory, file ) ) );
            
              return stats.reduce( ( accumulator, { size } ) => accumulator + size, 0 );
            }
            
            if(conId && (typeof conId !== "string" || !connMgr.getConnection(conId))){
              throw "Invalid/Inexisting connection id provided"
            }
            const dir = connMgr.getFileFolderPath(conId);
            return dirSize(dir);
          },
          testDBConnection: async (opts) => testDBConnection(opts),
          createConnection: async (con: Connections) => {
            const row = { 
                ...con, 
                user_id: user.id,
              }
            delete row.type;
            // console.log("createConnection", row)
            try {
              await testDBConnection(con as any);
              let res;
              if(con.id){
                delete row.id;
                res = await db.connections.update({ id: con.id }, row, { returning: "*" });
              } else {
                res = await db.connections.insert(row, { returning: "*" });
              }
              return res;
            } catch(e){
              console.error(e);
              if(e && e.code === "23502"){
                throw { err_msg: ` ${e.column} cannot be empty` }
              } else if(e && e.code === "23505"){
                throw { err_msg: `Connection ${JSON.stringify(con.name)} already exists` }
              }
              throw e;
            }
          },
          deleteConnection: async (id) => {
            return db.connections.delete({ id, user_id: user.id }, { returning: "*" });
          },
          reStartConnection: async (con_id) => {
            return connMgr.startConnection(con_id, socket, db, _db, true);
          }
        }
        
        return {
          ...(user.type === "admin"? adminMethods : undefined),
          startConnection: async (con_id) => {
            return connMgr.startConnection(con_id, socket, db, _db);
          }
        }
      },
      publish: params => publish(params, con) as any,
      joins: "inferred",
      onReady: async (db, _db: DB) => {
        
        let username = PRGL_USERNAME,
          password = PRGL_PASSWORD;
        if(
          !PRGL_USERNAME || !PRGL_PASSWORD
        ){
          username = EMPTY_USERNAME;
          password = EMPTY_PASSWORD;
        }

        // await db.users.delete(); 
        
        if(!(await db.users.count({ username }))){
          if(await HAS_EMPTY_USERNAME(db)){
            console.warn(`PRGL_USERNAME or PRGL_PASSWORD missing. Creating default user: ${username} with default password: ${password}`);
          }
          console.log((await db.users.count({ username })))
          try {
            const u = await db.users.insert({ username, password, type: "admin" }, { returning: "*" }) as Users;
            await _db.any("UPDATE users SET password = crypt(password, id::text), status = 'active' WHERE status IS NULL AND id = ${id};", u);

          } catch(e){
            console.error(e)
          }
          
          console.log("Added users: ", await db.users.find({ username }))
        }

        console.log("Prostgles UI is running on port ", PORT)
      },  
    });
  } catch(err){
    throw err;
  }
}


(async () => {
  let error, tries = 0
  let interval = setInterval(async () => {
    
    try {
      await getDBS();
      tries = 6;
      error = null;
      // clearInterval(interval)
    } catch(err){
      console.log("getDBS", err)
      error = err;
      tries++;
    }

    if(tries > 5){
      clearInterval(interval);
      
      app.get("/dbs", (req, res) => {    
        if(error){
          res.json({ err: error })
        } else {
          res.json({ ok: true })
        }
      })
    
      if(error) {
        app.get("*", (req, res) => {
          console.log(req.originalUrl ,req)
          res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
        })
      }
      return
    }

  }, 2000);
  
})()

app.post("/dbs", async (req, res) => {
  const { db_conn, db_user, db_pass, db_host, db_port, db_name, db_ssl } = req.body;
  if(!db_conn || !db_host){
    res.json({ ok: false })
  }

  try {
    await testDBConnection({ db_conn, db_user, db_pass, db_host, db_port, db_name, db_ssl });

    res.json({ msg: "DBS changed. Restart system" })
  } catch(err){
    res.json({ err })
  }
})


 

 
/* Get nested property from an object */
export function get(obj: any, propertyPath: string | string[]): any{

  let p = propertyPath,
      o = obj;

  if(!obj) return obj;
  if(typeof p === "string") p = p.split(".");
  return p.reduce((xs, x) =>{ 
    if(xs && xs[x]) { 
      return xs[x] 
    } else {
      return undefined; 
    } 
  }, o);
}


function logProcess(proc){

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
export function restartProc(cb?: Function){
  console.warn("Restarting process")
  if (process.env.process_restarting) {
    delete process.env.process_restarting;
    // Give old process one second to shut down before continuing ...
    setTimeout(() => {
      cb?.()
      restartProc()
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