export type ProstglesInitState = ({
  isElectron: boolean;
  electronCredsProvided?: boolean;
  electronIssue?: {
    type: "Older schema";
  };
  initError?: any;
  connectionError?: any;
  ok: boolean;
  canTryStartProstgles: boolean;
  canDumpAndRestore: {
    psql: string;
    pg_dump: string;
    pg_restore: string;
  } | undefined;
  isDemoMode: boolean;
}) 

export type ServerState = Omit<ProstglesInitState, "canTryStartProstgles">