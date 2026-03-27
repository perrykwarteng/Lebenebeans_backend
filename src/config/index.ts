import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import "dotenv/config";

const host = process.env.DB_HOST as string;
const user = process.env.DB_USER as string;
const password = process.env.DB_PASSWORD as string;
const database = process.env.DB_NAME as string;
const port = parseInt((process.env.DB_PORT as string) || "3306");

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
});

export const db = drizzle(pool);
