import log from "@/utils/logger";
import { Dialect, Sequelize } from "sequelize"


const config = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: "postgres",
}


const db = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect as Dialect,
    logging: log.debug.bind(log),
})

try {
    await db.authenticate();
    log.info("Connection has been established successfully.");
} catch (error) {
    await db.close();
    log.fatal("Unable to connect to the database:", error);
    process.exit(1);
}

export default db;