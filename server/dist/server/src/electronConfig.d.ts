/// <reference types="node" />
/// <reference types="node" />
import { DBSchemaGenerated } from "../../commonTypes/DBoGenerated";
export declare const ROOT_DIR: string;
export type Connections = Required<DBSchemaGenerated["connections"]["columns"]>;
export type DBSConnectionInfo = Pick<Required<Connections>, "type" | "db_conn" | "db_name" | "db_user" | "db_pass" | "db_host" | "db_port" | "db_ssl" | "type">;
export type OnServerReadyCallback = (portNumber: number) => void;
interface SafeStorage extends NodeJS.EventEmitter {
    decryptString(encrypted: Buffer): string;
    encryptString(plainText: string): Buffer;
    isEncryptionAvailable(): boolean;
}
declare let port: number | undefined;
export declare const getElectronConfig: () => {
    isElectron: boolean;
    port: number | undefined;
    sidConfig: {
        electronSid: string;
        onSidWasSet: () => void;
    };
    hasCredentials: () => boolean;
    getCredentials: () => DBSConnectionInfo | undefined;
    setCredentials: (connection?: DBSConnectionInfo) => void;
} | undefined;
export declare const start: (sStorage: SafeStorage, args: {
    port: number;
    electronSid: string;
    onSidWasSet: () => void;
}, onReady: OnServerReadyCallback) => Promise<void>;
export {};
//# sourceMappingURL=electronConfig.d.ts.map