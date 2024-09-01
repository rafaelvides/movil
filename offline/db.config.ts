import * as SQLite from 'expo-sqlite/legacy';
import { DataSource, DataSourceOptions } from "typeorm/browser";
import { Entity } from "./entity"
export const config: DataSourceOptions = {
  database: "billing_app.db",
  type: "expo",
  driver: SQLite,
  entities: Entity,
  synchronize: true,
  logging: true
};
export const connection = new DataSource(config);
