import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.DB_HOST as string;
const user = process.env.DB_USER as string;
const password = process.env.DB_PASSWORD as string;
const database = process.env.DB_NAME as string;
const port = parseInt((process.env.DB_PORT as string) || "3306");

export default defineConfig({
  dialect: "mysql",
  out: "./src/config/db/migration",
  schema: "./src/config/db/schema.ts",
  dbCredentials: {
    host: host,
    user: user,
    password: password,
    database: database,
    port: port,
  },
  verbose: true,
});
