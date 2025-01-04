import pg from "pg"
const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "film",
    password: "patimah098765", // ganti dengan password PostgreSQL Anda
    port: 5432,
});
console.log("database connected");

export default pool;