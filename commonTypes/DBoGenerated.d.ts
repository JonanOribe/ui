/* This file was generated by Prostgles 
*/ 

 /* SCHEMA DEFINITON. Table names have been altered to work with Typescript */
/* DBO Definition */

export type DBSchemaGenerated = {
  access_control: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      created?: null | string;
      database_id?: null | number;
      dbPermissions: 
       |  {  type: 'Run SQL';  allowSQL?: boolean; }
       |  {  type: 'All views/tables';  allowAllTables: ("select" | "insert" | "update" | "delete")[]; }
       |  {  type: 'Custom';  customTables: (  {  tableName: string;  select?: | boolean |  {  fields: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>;  forcedFilterDetailed?: any;  subscribe?: {  throttle?: number; };  filterFields?: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>;  orderByFields?: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>; };  update?: | boolean |  {  fields: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>;  forcedFilterDetailed?: any;  checkFilterDetailed?: any;  filterFields?: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>;  orderByFields?: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>;  forcedDataDetail?: any[];  dynamicFields?: (  {  filterDetailed: any;  fields: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>; } )[]; };  insert?: | boolean |  {  fields: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>;  forcedDataDetail?: any[];  checkFilterDetailed?: any; };  delete?: | boolean |  {  filterFields: | string[] | '*' | '' |  Record<string, 1 | true> |  Record<string, 0 | false>;  forcedFilterDetailed?: any; };  sync?: {  id_fields: string[];  synced_field: string;  throttle?: number;  allow_delete?: boolean; }; } )[]; }
      dbsPermissions?: null | {    createWorkspaces?: boolean;   viewPublishedWorkspaces?: {  workspaceIds: string[]; };  };
      id?: number;
      name?: null | string;
    };
  };
  access_control_methods: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      access_control_id: number;
      published_method_id: number;
    };
  };
  access_control_user_types: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      access_control_id: number;
      user_type: string;
    };
  };
  alert_viewed_by: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      alert_id?: null | string;
      id?: string;
      user_id?: null | string;
      viewed?: null | string;
    };
  };
  alerts: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      connection_id?: null | string;
      created?: null | string;
      data?: null | any;
      database_config_id?: null | number;
      id?: string;
      message?: null | string;
      section?: null | "access_control" | "backups" | "table_config" | "details" | "status" | "methods" | "file_storage" | "API"
      severity: "info" | "warning" | "error"
      title?: null | string;
    };
  };
  backups: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      connection_details?: string;
      connection_id?: null | string;
      content_type?: string;
      created?: string;
      credential_id?: null | number;
      dbSizeInBytes: string;
      destination: "Local" | "Cloud" | "None (temp stream)"
      details?: null | any;
      dump_command: string;
      dump_logs?: null | string;
      id?: string;
      initiator?: null | string;
      last_updated?: string;
      local_filepath?: null | string;
      options: 
       |  {  command: 'pg_dumpall';  clean: boolean;  dataOnly?: boolean;  globalsOnly?: boolean;  rolesOnly?: boolean;  schemaOnly?: boolean;  ifExists?: boolean;  encoding?: string;  keepLogs?: boolean; }
       |  {  command: 'pg_dump';  format: 'p' | 't' | 'c';  dataOnly?: boolean;  clean?: boolean;  create?: boolean;  encoding?: string;  numberOfJobs?: number;  noOwner?: boolean;  compressionLevel?: number;  ifExists?: boolean;  keepLogs?: boolean; }
      restore_command?: null | string;
      restore_end?: null | string;
      restore_logs?: null | string;
      restore_options?: {    command: 'pg_restore' | 'psql';   format: 'p' | 't' | 'c';   clean: boolean;   excludeSchema?: string;   newDbName?: string;   create?: boolean;   dataOnly?: boolean;   noOwner?: boolean;   numberOfJobs?: number;   ifExists?: boolean;   keepLogs?: boolean;  };
      restore_start?: null | string;
      restore_status?: 
       | null
       |  {  ok: string; }
       |  {  err: string; }
       |  {  loading: {  loaded: number;  total: number; }; }
      sizeInBytes?: null | string;
      status: 
       |  {  ok: string; }
       |  {  err: string; }
       |  {  loading?: {  loaded: number;  total?: number; }; }
      uploaded?: null | string;
    };
  };
  connections: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      created?: null | string;
      db_conn?: null | string;
      db_connection_timeout?: null | number;
      db_host?: string;
      db_name: string;
      db_pass?: null | string;
      db_port?: number;
      db_schema_filter?: 
       | null
       |  Record<string, 1>
       |  Record<string, 0>
      db_ssl?: "disable" | "allow" | "prefer" | "require" | "verify-ca" | "verify-full"
      db_user?: string;
      db_watch_shema?: null | boolean;
      disable_realtime?: null | boolean;
      id?: string;
      info?: null | {    canCreateDb?: boolean;  };
      is_state_db?: null | boolean;
      last_updated?: string;
      name: string;
      on_mount_ts?: null | string;
      on_mount_ts_disabled?: null | boolean;
      prgl_params?: null | any;
      prgl_url?: null | string;
      ssl_certificate?: null | string;
      ssl_client_certificate?: null | string;
      ssl_client_certificate_key?: null | string;
      ssl_reject_unauthorized?: null | boolean;
      table_options?: null | Partial<Record<string,  {  icon?: string; }>>
      type: "Standard" | "Connection URI" | "Prostgles"
      user_id?: null | string;
    };
  };
  credential_types: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id: string;
    };
  };
  credentials: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      bucket?: null | string;
      id?: number;
      key_id: string;
      key_secret: string;
      name?: string;
      region?: null | string;
      type?: string;
      user_id?: null | string;
    };
  };
  database_config_logs: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id?: number;
      on_mount_logs?: null | string;
      on_run_logs?: null | string;
      table_config_logs?: null | string;
    };
  };
  database_configs: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      backups_config?: null | {    enabled?: boolean;   cloudConfig: null |  {  credential_id?: null | number; };   frequency: 'daily' | 'monthly' | 'weekly' | 'hourly';   hour?: number;   dayOfWeek?: number;   dayOfMonth?: number;   keepLast?: number;   err?: null | string;   dump_options: |  {  command: 'pg_dumpall';  clean: boolean;  dataOnly?: boolean;  globalsOnly?: boolean;  rolesOnly?: boolean;  schemaOnly?: boolean;  ifExists?: boolean;  encoding?: string;  keepLogs?: boolean; }
 |  {  command: 'pg_dump';  format: 'p' | 't' | 'c';  dataOnly?: boolean;  clean?: boolean;  create?: boolean;  encoding?: string;  numberOfJobs?: number;  noOwner?: boolean;  compressionLevel?: number;  ifExists?: boolean;  keepLogs?: boolean; };  };
      db_host: string;
      db_name: string;
      db_port: number;
      file_table_config?: null | {    fileTable?: string;   storageType: |  {  type: 'local'; }
 |  {  type: 'S3';  credential_id: number; };   referencedTables?: any;   delayedDelete?: {  deleteAfterNDays: number;  checkIntervalHours?: number; };  };
      id?: number;
      rest_api_enabled?: null | boolean;
      sync_users?: null | boolean;
      table_config?: null | Record<string, 
 |  {  isLookupTable: {  values: Record<string, string>; }; }
 |  {  columns: Record<string,  | string |  {  hint?: string;  nullable?: boolean;  isText?: boolean;  trimmed?: boolean;  defaultValue?: any; } |  {  jsonbSchema: |  {  type: 'string' | 'number' | 'boolean' | 'Date' | 'time' | 'timestamp' | 'string[]' | 'number[]' | 'boolean[]' | 'Date[]' | 'time[]' | 'timestamp[]';  optional?: boolean;  description?: string; } |  {  type: 'Lookup' | 'Lookup[]';  optional?: boolean;  description?: string; } |  {  type: 'object';  optional?: boolean;  description?: string; }; }>; }>
      table_config_ts?: null | string;
      table_config_ts_disabled?: null | boolean;
    };
  };
  database_stats: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      database_config_id?: null | number;
    };
  };
  global_settings: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      allowed_ips?: string[];
      allowed_ips_enabled?: boolean;
      allowed_origin?: null | string;
      enable_logs?: boolean;
      id?: number;
      login_rate_limit?: {    maxAttemptsPerHour: number;   groupBy: 'x-real-ip' | 'remote_ip' | 'ip';  };
      login_rate_limit_enabled?: boolean;
      magic_link_validity_days?: number;
      session_max_age_days?: number;
      tableConfig?: null | any;
      trust_proxy?: boolean;
      updated_by?: "user" | "app"
    };
  };
  links: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      closed?: null | boolean;
      created?: null | string;
      deleted?: null | boolean;
      disabled?: null | boolean;
      id?: string;
      last_updated: string;
      options: 
       |  {  type: 'table';  colorArr?: number[];  tablePath: (  {  table: string;  on: (  Record<string, any> )[]; } )[]; }
       |  {  type: 'map';  colorArr?: number[];  smartGroupFilter?: |  {  $and: any[]; } |  {  $or: any[]; };  joinPath?: (  {  table: string;  on: (  Record<string, any> )[]; } )[];  localTableName?: string;  osmLayerQuery?: string;  groupByColumn?: string;  fromSelected?: boolean;  sql?: string;  columns: (  {  name: string;  colorArr: number[]; } )[]; }
       |  {  type: 'timechart';  colorArr?: number[];  smartGroupFilter?: |  {  $and: any[]; } |  {  $or: any[]; };  joinPath?: (  {  table: string;  on: (  Record<string, any> )[]; } )[];  localTableName?: string;  osmLayerQuery?: string;  groupByColumn?: string;  fromSelected?: boolean;  sql?: string;  columns: (  {  name: string;  colorArr: number[];  statType?: {  funcName: '$min' | '$max' | '$countAll' | '$avg' | '$sum';  numericColumn: string; }; } )[]; }
      user_id: string;
      w1_id: string;
      w2_id: string;
      workspace_id?: null | string;
    };
  };
  login_attempts: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      auth_type: "session-id" | "magic-link" | "login"
      created?: null | string;
      failed?: null | boolean;
      id?: string;
      info?: null | string;
      ip_address: string;
      ip_address_remote?: null | string;
      magic_link_id?: null | string;
      sid?: null | string;
      type?: "web" | "api_token" | "mobile"
      user_agent?: null | string;
      username?: null | string;
      x_real_ip?: null | string;
    };
  };
  logs: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      command?: null | string;
      connection_id?: null | string;
      created?: null | string;
      data?: null | any;
      duration?: null | string;
      error?: null | any;
      has_error?: null | boolean;
      id?: string;
      sid?: null | string;
      socket_id?: null | string;
      table_name?: null | string;
      tx_info?: null | any;
      type?: null | string;
    };
  };
  magic_links: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      expires: string;
      id?: string;
      magic_link?: null | string;
      magic_link_used?: null | string;
      user_id: string;
    };
  };
  published_methods: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      arguments?:  ( 
 |  {  name: string;  type: 'string' | 'number' | 'boolean' | 'Date' | 'time' | 'timestamp' | 'string[]' | 'number[]' | 'boolean[]' | 'Date[]' | 'time[]' | 'timestamp[]';  defaultValue?: string;  optional?: boolean;  allowedValues?: string[]; }
 |  {  name: string;  type: 'Lookup' | 'Lookup[]';  defaultValue?: any;  optional?: boolean;  lookup:  {    table: string;   column: string;   filter?: Record<string, any>;   isArray?: boolean;   searchColumns?: string[];   isFullRow?: {  displayColumns?: string[]; };   showInRowCard?: Record<string, any>;  }; } )[]
      connection_id?: null | string;
      description?: string;
      id?: number;
      name?: string;
      outputTable?: null | string;
      run?: string;
    };
  };
  schema_version: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id: string;
      table_config: any;
    };
  };
  session_types: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id: string;
    };
  };
  sessions: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      active?: null | boolean;
      created?: null | string;
      expires: string;
      id: string;
      id_num?: number;
      ip_address: string;
      is_connected?: null | boolean;
      is_mobile?: null | boolean;
      last_used?: null | string;
      name?: null | string;
      project_id?: null | string;
      socket_id?: null | string;
      type: string;
      user_agent?: null | string;
      user_id: string;
      user_type: string;
    };
  };
  stats: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      application_name: string;
      backend_start?: null | string;
      backend_type?: null | string;
      backend_xid?: null | string;
      backend_xmin?: null | string;
      blocked_by?: null | number[];
      blocked_by_num?: number;
      client_addr?: null | string;
      client_hostname?: null | string;
      client_port?: null | number;
      cmd?: null | string;
      connection_id: string;
      cpu?: null | string;
      datid?: null | number;
      datname?: null | string;
      id_query_hash?: null | string;
      mem?: null | string;
      memPretty?: null | string;
      mhz?: null | string;
      pid: number;
      query: string;
      query_start?: null | string;
      state?: null | string;
      state_change?: null | string;
      usename?: null | string;
      usesysid?: null | number;
      wait_event?: null | string;
      wait_event_type?: null | string;
      xact_start?: null | string;
    };
  };
  user_statuses: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id: string;
    };
  };
  user_types: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id: string;
    };
  };
  users: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      "2fa"?: null | {    secret: string;   recoveryCode: string;   enabled: boolean;  };
      created?: null | string;
      has_2fa_enabled?: null | boolean;
      id?: string;
      last_updated?: null | string;
      options?: null | {    showStateDB?: boolean;   hideNonSSLWarning?: boolean;   viewedSQLTips?: boolean;   viewedAccessInfo?: boolean;   theme?: 'dark' | 'light' | 'from-system';  };
      password?: string;
      passwordless_admin?: null | boolean;
      status?: string;
      type?: string;
      username: string;
    };
  };
  windows: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      closed?: null | boolean;
      columns?: null | any;
      created?: null | string;
      deleted?: null | boolean;
      filter?: any;
      fullscreen?: null | boolean;
      having?: any;
      id?: string;
      last_updated: string;
      limit?: null | number;
      method_name?: null | string;
      name?: null | string;
      nested_tables?: null | any;
      options?: any;
      parent_window_id?: null | string;
      selected_sql?: string;
      show_menu?: null | boolean;
      sort?: null | any;
      sql?: string;
      sql_options?: {    executeOptions?: 'full' | 'block' | 'smallest-block';   errorMessageDisplay?: 'tooltip' | 'bottom' | 'both';   tabSize?: number;   lineNumbers?: 'on' | 'off';   renderMode?: 'table' | 'csv' | 'JSON';   minimap?: {  enabled: boolean; };   acceptSuggestionOnEnter?: 'on' | 'smart' | 'off';   expandSuggestionDocs?: boolean;   maxCharsPerCell?: number;   theme?: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';   showRunningQueryStats?: boolean;  };
      table_name?: null | string;
      table_oid?: null | number;
      type?: null | string;
      user_id: string;
      workspace_id?: null | string;
    };
  };
  workspaces: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      active_row?: null | any;
      connection_id: string;
      created?: null | string;
      deleted?: boolean;
      icon?: null | string;
      id?: string;
      last_updated: string;
      last_used?: string;
      layout?: null | any;
      name?: string;
      options?: {    hideCounts?: boolean;   tableListEndInfo?: 'none' | 'count' | 'size';   tableListSortBy?: 'name' | 'extraInfo';   showAllMyQueries?: boolean;   defaultLayoutType?: 'row' | 'tab' | 'col';   pinnedMenu?: boolean;   pinnedMenuWidth?: number;  };
      published?: boolean;
      url_path?: null | string;
      user_id: string;
    };
  };
  
}
