
import { DBSchemaGenerated } from "../../../commonTypes/DBoGenerated";
export type Connections = Required<DBSchemaGenerated["connections"]["columns"]>;
import { ConnectionString } from 'connection-string';
import pg from "pg-promise/typescript/pg-subset";

export const getConnectionDetails = (c: Connections): pg.IConnectionParameters<pg.IClient> => {
  /**
   * Cannot use connection uri without having ssl issues
   * https://github.com/brianc/node-postgres/issues/2281
   */
  const getSSLOpts = (sslmode: Connections["db_ssl"]): pg.IConnectionParameters<pg.IClient>["ssl"] => sslmode && sslmode !== "disable"? ({
    ca: c.ssl_certificate ?? undefined,
    cert: c.ssl_client_certificate ?? undefined,
    key: c.ssl_client_certificate_key ?? undefined,
    rejectUnauthorized: c.ssl_reject_unauthorized ?? (sslmode === "require" && !!c.ssl_certificate || sslmode === "verify-ca" || sslmode === "verify-full")
  }) : undefined;

  if(c.type === "Connection URI"){
    const cs = new ConnectionString(c.db_conn);
    const params = cs.params ?? {};
    const { sslmode, application_name = "prostgles" } = params;
    return {
      // connectionString: c.db_conn,
      application_name,
      host: cs.hosts![0].name,
      port: cs.hosts![0].port,
      user: cs.user,
      password: cs.password,
      database: cs.path![0],
      ssl: getSSLOpts(sslmode),
    }
  }
  return {
    database: c.db_name!, 
    user: c.db_user!, 
    password: c.db_pass!, 
    host: c.db_host!,
    port: c.db_port!,
    ssl: getSSLOpts(c.db_ssl)
  };
}