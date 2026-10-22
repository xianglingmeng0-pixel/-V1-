import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, QueryResultRow } from "pg";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>("DATABASE_URL");
    if (!connectionString) {
      throw new Error("DATABASE_URL is required");
    }
    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  async query<T extends QueryResultRow>(
    sql: string,
    values: readonly unknown[] = [],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(sql, [...values]);
    return result.rows;
  }

  async ping(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
