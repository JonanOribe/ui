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
      connection_id: string;
      created?: null | Date;
      id?: number;
      name?: null | string;
      rule:       { 
        userGroupNames: string[];
        dbsPermissions?: {  createWorkspaces?: boolean; viewPublishedWorkspaces?: {  workspaceIds: string[]; }; };
        dbPermissions: 
        | {  type: 'Run SQL'; allowSQL?: boolean; }
        | {  type: 'All views/tables'; allowAllTables:  ("select" | "insert" | "update" | "delete")[]; }
        | {  type: 'Custom'; customTables: any[]; }; 
      };
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
      created?: Date;
      credential_id?: null | number;
      dbSizeInBytes: number;
      destination: string;
      details?: null | any;
      dump_command: string;
      dump_logs?: null | string;
      id?: string;
      initiator?: null | string;
      last_updated?: Date;
      local_filepath?: null | string;
      options?: 
        | {  command: 'pg_dumpall'; clean: boolean; dataOnly?: boolean; globalsOnly?: boolean; rolesOnly?: boolean; schemaOnly?: boolean; ifExists?: boolean; encoding?: string; keepLogs?: boolean; }
        | {  command: 'pg_dump'; format: 'p' | 't' | 'c'; dataOnly?: boolean; clean?: boolean; create?: boolean; encoding?: string; numberOfJobs?: number; noOwner?: boolean; compressionLevel?: number; ifExists?: boolean; keepLogs?: boolean; }
      restore_command?: null | string;
      restore_end?: null | Date;
      restore_logs?: null | string;
      restore_options?:       { 
        command: 'pg_restore' | 'psql';
        format: 'p' | 't' | 'c';
        clean: boolean;
        newDbName?: string;
        create?: boolean;
        dataOnly?: boolean;
        noOwner?: boolean;
        numberOfJobs?: number;
        ifExists?: boolean;
        keepLogs?: boolean; 
      };
      restore_start?: null | Date;
      restore_status?: 
        | null
        | {  ok: string; }
        | {  err: string; }
        | {  loading: {  loaded: number; total: number; }; }
      sizeInBytes?: null | number;
      status?: 
        | {  ok: string; }
        | {  err: string; }
        | {  loading?: {  loaded: number; total: number; }; }
      uploaded?: null | Date;
    };
  };
  connections: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      access_control?: null | any;
      backups_config?: null |       { 
        enabled?: boolean;
        cloudConfig: null | {  credential_id?: null | number; };
        frequency: 'daily' | 'monthly' | 'weekly' | 'hourly';
        hour?: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
        keepLast?: number;
        err?: null | string;
        dump_options: 
        | {  command: 'pg_dumpall'; clean: boolean; dataOnly?: boolean; globalsOnly?: boolean; rolesOnly?: boolean; schemaOnly?: boolean; ifExists?: boolean; encoding?: string; keepLogs?: boolean; }
        | {  command: 'pg_dump'; format: 'p' | 't' | 'c'; dataOnly?: boolean; clean?: boolean; create?: boolean; encoding?: string; numberOfJobs?: number; noOwner?: boolean; compressionLevel?: number; ifExists?: boolean; keepLogs?: boolean; }; 
      };
      created?: null | Date;
      db_conn?: null | string;
      db_host?: null | string;
      db_name?: null | string;
      db_pass?: null | string;
      db_port?: null | number;
      db_ssl?: "disable" | "allow" | "prefer" | "require" | "verify-ca" | "verify-full"
      db_user?: null | string;
      db_watch_shema?: null | boolean;
      id?: string;
      is_state_db?: null | boolean;
      last_updated?: number;
      name?: null | string;
      prgl_params?: null | any;
      prgl_url?: null | string;
      ssl_certificate?: null | string;
      ssl_client_certificate?: null | string;
      ssl_client_certificate_key?: null | string;
      ssl_reject_unauthorized?: null | boolean;
      table_config?: null |       { 
        fileTable?: string;
        storageType: 
        | {  type: 'local'; }
        | {  type: 'S3'; credential_id: number; };
        referencedTables?: {  };
        delayedDelete?: {  deleteAfterNDays: number; checkIntervalHours?: number; }; 
      };
      type?: "Standard" | "Connection URI" | "Prostgles"
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
      bucket: string;
      id?: number;
      key_id: string;
      key_secret: string;
      name: string;
      region?: null | string;
      type?: string;
      user_id?: null | string;
    };
  };
  dwadwa: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id?: string;
    };
  };
  failed_login_attempts: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      created?: null | Date;
      id?: number;
      info?: null | string;
      ip_address: string;
      magic_link_id?: null | string;
      type?: "web" | "api_token" | "desktop" | "mobile"
      user_agent?: null | string;
      username?: null | string;
    };
  };
  files: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      content_length?: number;
      content_type: string;
      deleted?: null | number;
      deleted_from_storage?: null | number;
      description?: null | string;
      etag?: null | string;
      extension: string;
      id?: string;
      name: string;
      original_name: string;
      s3_url?: null | string;
      signed_url?: null | string;
      signed_url_expires?: null | number;
      url: string;
    };
  };
  geography_columns: {
    is_view: true;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      coord_dimension?: null | number;
      f_geography_column?: null | string;
      f_table_catalog?: null | string;
      f_table_name?: null | string;
      f_table_schema?: null | string;
      srid?: null | number;
      type?: null | string;
    };
  };
  geometry_columns: {
    is_view: true;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      coord_dimension?: null | number;
      f_geometry_column?: null | string;
      f_table_catalog?: null | string;
      f_table_name?: null | string;
      f_table_schema?: null | string;
      srid?: null | number;
      type?: null | string;
    };
  };
  global_settings: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      allowed_ips?: Array<string>;
      allowed_ips_enabled?: boolean;
      allowed_origin?: null | string;
      id?: number;
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
      created?: null | Date;
      deleted?: null | boolean;
      id?: string;
      last_updated: number;
      options?: any;
      user_id: string;
      w1_id: string;
      w2_id: string;
      workspace_id: string;
    };
  };
  login_attempts: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      created?: null | Date;
      id?: number;
      info?: null | string;
      ip_address: string;
      session_id?: null | string;
      type?: string;
      user_id?: null | string;
    };
  };
  magic_links: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      expires: number;
      id?: string;
      magic_link?: null | string;
      magic_link_used?: null | Date;
      user_id: string;
    };
  };
  mytbl: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      id?: number;
      line?: null | any;
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
      created?: null | Date;
      expires: number;
      id?: string;
      ip_address: string;
      is_connected?: null | boolean;
      is_mobile?: null | boolean;
      last_used?: null | Date;
      name?: null | string;
      project_id?: null | string;
      type?: "web" | "api_token" | "desktop" | "mobile"
      user_agent?: null | string;
      user_id: string;
      user_type: string;
      usname?: null | string;
    };
  };
  spatial_ref_sys: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      auth_name?: null | string;
      auth_srid?: null | number;
      proj4text?: null | string;
      srid: number;
      srtext?: null | string;
    };
  };
  user_groups: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      filter?: null | any;
      id: string;
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
      "2fa"?: null |       { 
        secret: string;
        recoveryCode: string;
        enabled: boolean; 
      };
      created?: null | Date;
      id?: string;
      last_updated?: null | number;
      options?: null |       { 
        showStateDB?: boolean;
        hideNonSSLWarning?: boolean;
        viewedSQLTips?: boolean;
        viewedAccessInfo?: boolean; 
      };
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
      created?: null | Date;
      deleted?: null | boolean;
      filter?: null | any;
      fullscreen?: null | boolean;
      id?: string;
      last_updated: number;
      layout?: null | any;
      limit?: null | number;
      name?: null | string;
      nested_tables?: null | any;
      options?: null | any;
      selected_sql?: string;
      show_menu?: null | boolean;
      sort?: null | any;
      sql?: string;
      sql_options?:       { 
        executeOptions?: 'full' | 'block';
        errorMessageDisplay?: 'tooltip' | 'bottom' | 'both';
        tabSize?: number;
        lineNumbers?: 'on' | 'off';
        minimap?: {  enabled: boolean; };
        acceptSuggestionOnEnter?: 'on' | 'smart' | 'off';
        expandSuggestionDocs?: boolean; 
      };
      table_name?: null | string;
      table_oid?: null | number;
      type?: null | string;
      user_id: string;
      workspace_id: string;
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
      created?: null | Date;
      deleted?: boolean;
      id?: string;
      last_updated: number;
      layout?: null | any;
      name?: string;
      options?:       { 
        hideCounts?: boolean;
        showAllMyQueries?: boolean;
        defaultLayoutType?: 'row' | 'tab' | 'col';
        pinnedMenu?: boolean; 
      };
      published?: boolean;
      url_path?: null | string;
      user_id: string;
    };
  };
  
}
