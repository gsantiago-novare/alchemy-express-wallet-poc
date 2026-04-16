import { Pool } from "pg";
import credentials from "../config/db-config";
import ServerError from "../errors/ServerError";

const pool = new Pool({
  host: credentials.HOST,
  user: credentials.USER,
  password: credentials.PASSWORD,
  port: credentials.PORT,
  database: credentials.DATABASE,
});

const connect = async () => {
  try {
    const dbClient = await pool.connect();
    console.info("Database connection successful");
    return dbClient;
  } catch (error) {
    console.error("Database connection failed");
    throw new ServerError("Database connection failed", 500);
  }
};

export const DatabaseConnection = {
  connect,
  pool,
};
