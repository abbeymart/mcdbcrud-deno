import { assertEquals, mcTest, postTestResult } from "../test_deps.ts";
import { DbConfigType, newDbPg } from "../src/index.ts";
// import { MyDb } from "../../config/dbConfig.ts";
import { decryptEncodedFile, ObjectType } from "./config/config.ts";

// test-data: db-configuration settings
let configOptions: ObjectType = {};
try {
    configOptions = decryptEncodedFile();
    console.log("config-options: ", configOptions);
} catch (e) {
    console.error("\nConfiguration error: ", e);
    Deno.exit(1);
}
if (!configOptions) {

}
const myDb = configOptions.appDb as DbConfigType;
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
            assertEquals(pResult, true, `client-result-connected: true`);
        },
    });

    await mcTest({
        name    : "should successfully connect to the PostgresDB - Pool-Client",
        testFunc: async () => {
            let pResult = false;
            try {
                console.log("dbc-client-connected: ");
                const client = await dbc.pgPool().connect();
                client.release();
                pResult = true;
            } catch (e) {
                console.log("dbc-client-connection-error: ", e);
                pResult = false;
            } finally {
                await dbc.closePgPool();
            }
            assertEquals(pResult, true, `client-result-connected: true`);
        },
    });

    await mcTest({
        name    : "should successfully connect to the PostgresDB - Pool",
        testFunc: async () => {
            let pResult = false;
            try {
                await dbc.pgPool().connect();
                console.log("pool-client-connected: ");
                pResult = true;
            } catch (e) {
                console.log("pool-client-connect-error: ", e);
                pResult = false;
            } finally {
                await dbc.closePgPool();
            }
            assertEquals(pResult, true, `pool-result-connected: true`);
        },
    });

    await postTestResult();
})();
