import { Client, Pool, TLSOptions } from "../../deps.ts";

export interface DbSecureType extends TLSOptions {
    secureAccess?: boolean;
    secureCert?: string;
    secureKey?: string;
    sslMode?: "require" | "prefer" | "disable";
}

export interface DbConnectionOptionsType {
    checkAccess?: boolean;
    poolSize?: number;
    reconnectTries?: number;
    reconnectInterval?: number;
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}

export interface DbConfigType {
    dbType?: string;
    hostname?: string;
    username?: string;
    password?: string;
    database?: string;
    filename?: string;
    location?: string;      // => URI
    port?: number | string;
    poolSize?: number;
    options?: DbConnectionOptionsType;
    secureOption?: DbSecureType;
    url?: string;
    timezone?: string
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    applicationName?: string;
    hostType?: "tcp" | "socket",
}

export type DbConnectionType = Pool | Client
