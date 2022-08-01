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
      id?: string;
      rule?: null | any;
    };
  };
  access_control_user_types: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      access_control_id: string;
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
      connection_id: string;
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
      options?:       { 
        clean: boolean;
        format: 'p' | 't' | 'c';
        dumpAll?: boolean;
        ifExists?: boolean;
        keepLogs?: boolean; 
      };
      restore_command?: null | string;
      restore_end?: null | Date;
      restore_logs?: null | string;
      restore_options?:       { 
        clean: boolean;
        create?: boolean;
        dataOnly?: boolean;
        noOwner?: boolean;
        newDbName?: string;
        command: 'pg_restore' | 'psql';
        format: 'p' | 't' | 'c';
        ifExists?: boolean;
        keepLogs?: boolean; 
      };
      restore_start?: null | Date;
      restore_status?: 
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
      backups_config?: null | any;
      created?: null | Date;
      db_conn?: null | string;
      db_host?: null | string;
      db_name?: null | string;
      db_pass?: null | string;
      db_port?: null | number;
      db_ssl?: string;
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
      table_config?: null | any;
      type?: string;
      user_id: string;
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
      type: string;
      user_id?: null | string;
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
  globals: {
    is_view: false;
    select: true;
    insert: true;
    update: true;
    delete: true;
    columns: {
      onerow_id?: boolean;
      user_groups?: null | any;
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
      is_mobile?: null | boolean;
      project_id?: null | string;
      type?: null | string;
      user_id: string;
      user_type: string;
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
      created?: null | Date;
      id?: string;
      last_updated?: null | number;
      options?: null |       { 
        showStateDB?: boolean; 
      };
      password?: string;
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
      options?: null | any;
      url_path?: null | string;
      user_id: string;
    };
  };
  
}
