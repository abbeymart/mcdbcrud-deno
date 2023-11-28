import { assertEquals, mcTest, postTestResult } from "../test_deps.ts";
import { newDbPg } from "../src/index.ts";
import { auditDb } from "./config/dbConfig.ts";

/**
 * RUN command
 * ```shell
 * $ deno run --allow-net --allow-env test/dbc.test.ts
 * ```
 */

// test-data: db-configuration settings
const myDb = auditDb;
myDb.options = {};

const dbc = newDbPg(myDb, myDb.options);

(async () => {
    await mcTest({
        name    : "should successfully connect to the PostgresDB - Client",
        testFunc: async () => {
            let pResult = false;
            try {
                await dbc.pgClient().connect();
                console.log("dbc-client-connected: ");
                pResult = true;
            } catch (e) {
                console.log("dbc-client-connection-error: ", e);
                pResult = false;
            } finally {
                await dbc.closePgClient();
            }
            assertEquals(pResult, true, `client-result-connected should be: true`);
        },
    });

    await mcTest({
        name    : "should successfully connect to the PostgresDB - Pool-Client",
        testFunc: async () => {
            let pResult = false;
            try {
                const client = await dbc.pgPool().connect();
                console.log("dbc-pool-client-connected: ");
                client.release();
                console.log("dbc-pool-client-connection-released: ");
                pResult = true;
            } catch (e) {
                console.log("dbc-pool-client-connection-error: ", e);
                pResult = false;
            } finally {
                await dbc.closePgPool();
            }
            assertEquals(pResult, true, `pool-client-result-connected should be: true`);
        },
    });

    await mcTest({
        name    : "should successfully connect to the PostgresDB - Pool",
        testFunc: async () => {
            let pResult = false;
            try {
                await dbc.pgPool().connect();
                console.log("db-pool-connected: ");
                pResult = true;
            } catch (e) {
                console.log("db-pool-connect-error: ", e);
                pResult = false;
            } finally {
                await dbc.closePgPool();
            }
            assertEquals(pResult, true, `db-pool-result-connected should be: true`);
        },
    });

    postTestResult();
})();
