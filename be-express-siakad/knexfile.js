import { config } from "dotenv";

config();

const knexConfig = {
  development: {
    client: process.env.DB_CLIENT || "mysql2", // Disarankan menggunakan mysql2 untuk TiDB
    connection: {
      host: process.env.DB_HOST, // gateway01.eu-central-1.prod.aws.tidbcloud.com
      port: Number(process.env.DB_PORT) || 4000, // Port default TiDB adalah 4000
      user: process.env.DB_USERNAME, // 3b5qLv3hxzSxKMv.root
      password: process.env.DB_PASSWORD, // GJ4AIp2JVyscRzgR
      database: process.env.DB_NAME || "test", //
      // WAJIB: TiDB Cloud menggunakan koneksi publik yang membutuhkan SSL
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false // Set false agar lebih mudah tanpa file .pem fisik
      }
    },
    migrations: {
      directory: "./src/migrations",
      extension: "js",
      loadExtensions: [".js"],
    },
  },
  production: {
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 4000,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true, // Di production sebaiknya true dengan CA cert
      }
    },
    migrations: {
      directory: "./src/migrations",
      extension: "js",
    },
  },
};

export default knexConfig;