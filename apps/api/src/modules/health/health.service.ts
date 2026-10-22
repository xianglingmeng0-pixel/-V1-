import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  async check(): Promise<{
    status: "ok";
    database: "ok";
    timestamp: string;
  }> {
    await this.database.ping();
    return {
      status: "ok",
      database: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
