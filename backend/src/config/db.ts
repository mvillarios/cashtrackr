import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enableSSL = process.env.DB_SSL === "true";

export const db = new Sequelize(process.env.DATABASE_URL, {
  models: [__dirname + "/../models/**/*"],
  logging: false,
  define: {
    timestamps: true,
  },
  ...(enableSSL
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}),
});
