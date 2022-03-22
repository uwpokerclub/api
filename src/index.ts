/* eslint-disable no-console */
import { ConnectionPool } from "postgres-driver-service";

import EnvironmentChecker from "./lib/environment/EnvironmentChecker";
import Server from "./lib/server/Server";

import * as environmentConfig from "../config/environment.json";

import * as fs from "fs";

// Initialize an environment checker and verify all variables are present
const ec = new EnvironmentChecker(environmentConfig);
try {
  ec.verify();
} catch (err) {
  console.error(`Error verifying environment variables: ${err.message}`);
  process.exit(1);
}

const clientOptions = process.env.NODE_ENV?.toLowerCase() === "production" ? {
  ssl: {
    rejectUnauthorized: false,
    ca: fs.readFileSync("/usr/api/server-ca.pem").toString()
  }
} : {};

// Initalize new Postgres pool.
const dbs = new ConnectionPool(
  (process.env.DATABASE_URL as string) +
    (process.env.NODE_ENV?.toLowerCase() === "production" ? "?sslmode=require" : ""),
    clientOptions
);

// Initalize server
const server = new Server(dbs);
server.run();
