import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./common/database/database.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    DatabaseModule,
    HealthModule,
    DashboardModule,
  ],
})
export class AppModule {}
