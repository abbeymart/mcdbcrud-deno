import { Client, ClientConfiguration, Pool } from "../../deps.ts";
import { DbConfigType, DbConnectionOptionsType } from "./types.ts";

// TODO: review startup with Deno environment variables
// PGUSER=user PGPASSWORD=admin PGDATABASE=test deno run --allow-net --allow-env database.js

export class DbPg {
    private readonly hostname: string;
    private readonly username: string;
    private readonly password: string;
    private readonly database: string;
    private readonly location: string;
    private readonly port: number;
    private readonly poolSize: number;
    private readonly checkAccess: boolean;
    private readonly connectionString: string;
    private readonly config: ClientConfiguration;
    private dbPool: Pool;
    private dbClient: Client;
    private readonly encodedUsername: string;
    private readonly encodedPassword: string;

    constructor(dbConfig: DbConfigType, options?: DbConnectionOptionsType) {
        this.hostname = dbConfig?.hostname || "";
        this.username = dbConfig?.username || "";
        this.password = dbConfig?.password || "";
        this.database = dbConfig?.database || "";
        this.location = dbConfig?.location || "";
        this.port = Number(dbConfig?.port) || 5432;
        this.poolSize = dbConfig?.poolSize || 20;
        this.checkAccess = options?.checkAccess !== false;
        // Encode username and password for the connection string
        this.encodedUsername = encodeURIComponent(this.username);
        this.encodedPassword = encodeURIComponent(this.password);
        this.connectionString =
            `postgres://${this.encodedUsername}:${this.encodedPassword}@${this.hostname}:${this.port}/${this.database}`;
        if (dbConfig.applicationName) {
            this.connectionString += `?application_name=${dbConfig.applicationName}`;
        }
        if (dbConfig.secureOption && dbConfig.secureOption.sslMode) {
            this.connectionString += `&sslmode=${dbConfig.secureOption.sslMode}`;
        }
        //  TODO: review caCertificates value, from client/requester
        const appEnv = Deno.env.get("MCAPP_ENV") || "development";
        this.config = {
            applicationName: dbConfig.applicationName || "mc-app",
            connection     : {
                attempts: 3,
                interval: 500,
            },
            database       : this.database,
            hostname       : this.hostname,
            host_type      : dbConfig.hostType || "tcp",
            password       : this.password,
            // PostgresError: parameter "max_index_keys" cannot be changed
            options: {
                // "max_index_keys": "32",
            },
            port   : this.port,
            user   : this.username,
            tls    : {
                enforce       : dbConfig.secureOption?.enforce !== undefined ? dbConfig.secureOption?.enforce :
                    appEnv !== "development",
                enabled       : dbConfig.secureOption?.enabled !== undefined ? dbConfig.secureOption?.enabled :
                    appEnv !== "development",
                caCertificates: dbConfig.secureOption?.caCertificates || [],
            },
        };
        this.dbPool = this.pgPool();
        this.dbClient = this.pgClient();
    }

    // connection pools - with lazy connections activation
    pgPool() {
        this.dbPool = new Pool(this.config, this.poolSize, true);
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
                console.log(
                    `PostgresDB connected[CLIENT]: ${this.hostname}:${this.port}/${this.database}`,
                );
                const res = await dbClient.queryObject("SELECT NOW() as now");
                console.log("pgSQL-test-pgPoolClient-query-result: ", res.rows[0]);
            } finally {
                await dbClient?.end();
                console.log("pgSQL-test-pgPoolClient-query connection end");
            }
        })().catch((error) => {
            // catches all errors within the async function, client and try-block
            console.error("Postgres-DB connect/query[CLIENT] error:" + error.stack);
        });
    }

    pgPoolTest() {
        (async () => {
            const dbPool = this.pgPool();
            const poolClient = await dbPool.connect();
            try {
                console.log(
                    `PostgresDB connected[POOL-CLIENT]: ${this.hostname}:${this.port}/${this.database}`,
                );
                const res = await poolClient.queryObject("SELECT NOW() as now");
                console.log("pgSQL-test-pgPool-query(1)-result: ", res.rows[0]);
            } finally {
                await poolClient.release();
                console.log("pgSQL-test-pgPool-query(1) connection released");
            }
        })().catch((error) => {
            // catches all errors within the async function, client and try-block
            console.error(
                "Postgres-DB, pgPool, connect/query[POOL] error:" + error.stack,
            );
        });
    }

    async closePgPool() {
        return await this.pgPool().end();
    }

    async closePgClient() {
        return await this.pgClient().end();
    }
}

export function newDbPg(
    dbConfig: DbConfigType,
    options?: DbConnectionOptionsType,
) {
    return new DbPg(dbConfig, options);
}
