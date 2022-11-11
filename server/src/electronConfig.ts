
import * as fs from "fs";
import * as path from "path";
import { DBSchemaGenerated } from "../../commonTypes/DBoGenerated";
export const ROOT_DIR = path.join(__dirname, "/../../.." ); 

export type Connections = Required<DBSchemaGenerated["connections"]["columns"]>;
export type DBSConnectionInfo = Pick<Required<Connections>, "type" | "db_conn" | "db_name" | "db_user" | "db_pass" | "db_host" | "db_port" | "db_ssl" | "type">;
export type OnServerReadyCallback = (portNumber: number) => void;

interface SafeStorage extends NodeJS.EventEmitter {

  decryptString(encrypted: Buffer): string;
  encryptString(plainText: string): Buffer;
  isEncryptionAvailable(): boolean;
}

let isElectron = false;// process.env.PRGL_IS_ELECTRON;
let safeStorage: SafeStorage | undefined;
let port: number | undefined;

let sidConfig = {
  electronSid: "",
  onSidWasSet: () => {}
};

export const getElectronConfig = () => {
  if(!isElectron) return undefined;

  if(!safeStorage || ![safeStorage.encryptString, safeStorage.decryptString].every(v => typeof v === "function")){
    throw "Invalid safeStorage provided. encryptString or decryptString is not a function"
  } 

  const electronConfigPath = path.resolve(`${ROOT_DIR}/../../.electron-auth.json`);

  const getCredentials = (): DBSConnectionInfo | undefined => {

    try {
      const file = !fs.existsSync(electronConfigPath)? undefined : fs.readFileSync(electronConfigPath);//, { encoding: "utf-8" });
      if(file){
        return JSON.parse(safeStorage!.decryptString(file));
      }
    } catch(e){
      console.error(e);
    }

    return undefined;
  }
  
  return {
    isElectron: true,
    port,
    sidConfig,
    hasCredentials: () => !!getCredentials(),
    getCredentials,
    setCredentials: (connection?: DBSConnectionInfo) => {
      if(!connection){
        if(fs.existsSync(electronConfigPath)){
          fs.unlinkSync(electronConfigPath);
        }
      } else {
        fs.writeFileSync(electronConfigPath, safeStorage!.encryptString(JSON.stringify(connection)));
      }
    }
  }
}

export const start = async (sStorage: SafeStorage, args: { port: number; electronSid: string; onSidWasSet: ()=>void }, onReady: OnServerReadyCallback) => {
  isElectron = true;
  port = args.port;
  if(!args.electronSid || typeof args.electronSid !== "string" || typeof args.onSidWasSet !== "function"){
    throw "Must provide a valid electronSid: string and onSidWasSet: ()=>void"
  }
  sidConfig = {
    electronSid: args.electronSid,
    onSidWasSet: args.onSidWasSet
  }
  safeStorage = sStorage;
  const { onServerReady } = require("./index");
  onServerReady(onReady)
}