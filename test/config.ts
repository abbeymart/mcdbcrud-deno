import {DbConfigType} from "../src"

export const MyDb: DbConfigType = {
    dbType  : "postgres",
    host    : "localhost",
    username: "postgres",
    password: "ab12trust",
    database: "mctest",
    port    : 5433,
    filename: "testdb.db",
    poolSize: 20,
    url     : "localhost:5433",
    location: "postgres://localhost:5433/mctest",
}

export const AuditDb: DbConfigType = {
    dbType  : "postgres",
    host    : "localhost",
    username: "postgres",
    password: "ab12trust",
    database: "testdb",
    port    : 5433,
    filename: "testdb.db",
    poolSize: 20,
    url     : "localhost:5433",
    location: "postgres://localhost:5433/testdb",
}