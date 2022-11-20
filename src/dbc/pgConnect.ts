import { Pool, Client, ClientConfiguration } from "../../deps.ts";
import { DbConnectionOptionsType, DbConfigType } from "./types.ts";

export class DbPg {
    private readonly hostname: string;
    private readonly username: string;
    private readonly password: string;
    private readonly database: string;
    private readonly location: string;
    private readonly port: number;
    private readonly poolSize: number;
    private readonly checkAccess: boolean;
    private readonly dbUrl: string;
    private readonly config: ClientConfiguration;
    private dbPool: Pool;
    private dbClient: Client;


    constructor(dbConfig: DbConfigType, options?: DbConnectionOptionsType) {
        this.hostname = dbConfig?.hostname || "";
        this.username = dbConfig?.username || "";
        this.password = dbConfig?.password || "";
        this.database = dbConfig?.database || "";
        this.location = dbConfig?.location || "";
        this.port = Number(dbConfig?.port) || 5432;
        this.poolSize = dbConfig?.poolSize || 20;
        this.checkAccess = options?.checkAccess !== false;
        this.dbUrl = `postgresql://${this.username}:${this.password}@${this.hostname}:${this.port}/${this.database}`;
        this.config = {
            applicationName: dbConfig.applicationName || "mc-app",
            connection     : {
                attempts: 1,
                interval: 500,
            },
            database       : this.database,
            hostname       : this.hostname,
            host_type      : dbConfig.hostType || "tcp",
            password       : this.password,
            options        : {
                "max_index_keys": "32",
            },
            port           : this.port,
            user           : this.username,
            tls            : {
                enforce       : dbConfig.secureOption?.enforce || Deno.env.get("APP_ENV") !== "development",
                enabled       : dbConfig.secureOption?.enabled || Deno.env.get("APP_ENV") !== "development",
                caCertificates: dbConfig.secureOption?.caCertificates || [],
            },
        };
        this.dbPool = this.pgPool();
        this.dbClient = this.pgClient();
    }

    // connection pools
    pgPool() {
        this.dbPool = new Pool(this.config, this.poolSize);
        return this.dbPool;
    }

    // client-db connection
    pgClient() {
        this.dbClient = new Client(this.config);
        return this.dbClient;
    }

    pgClientTest() {
        (async () => {
            const dbClient = this.pgClient();
            await dbClient.connect();
            try {
                console.log(`PostgresDB connected[CLIENT]: ${this.hostname}:${this.port}/${this.database}`);
                const res = await dbClient.queryObject('SELECT NOW() as now');
                console.log('pgSQL-test-pgPoolClient-query-result: ', res.rows[0]);
            } finally {
                await dbClient?.end();
                console.log('pgSQL-test-pgPoolClient-query connection end');
            }
        })().catch(error => {
            // catches all errors within the async function, client and try-block
            console.error('Postgres-DB connect/query[CLIENT] error:' + error.stack);
        });
    }

    pgPoolTest() {
        (async () => {
            const dbPool = this.pgPool();
            const poolClient = await dbPool.connect();
            try {
                console.log(`PostgresDB connected[POOL-CLIENT]: ${this.hostname}:${this.port}/${this.database}`);
                const res = await poolClient.queryObject('SELECT NOW() as now');
                console.log('pgSQL-test-pgPool-query(1)-result: ', res.rows[0]);
            } finally {
                await poolClient.release();
                console.log('pgSQL-test-pgPool-query(1) connection released');
            }
        })().catch(error => {
            // catches all errors within the async function, client and try-block
            console.error('Postgres-DB, pgPool, connect/query[POOL] error:' + error.stack);
        });
    }

    async closePgPool() {
        return await this.pgPool().end();
    }

    async closePgClient() {
        return await this.pgClient().end();
    }

}

export function newDbPg(dbConfig: DbConfigType, options?: DbConnectionOptionsType) {
    return new DbPg(dbConfig, options);
}
