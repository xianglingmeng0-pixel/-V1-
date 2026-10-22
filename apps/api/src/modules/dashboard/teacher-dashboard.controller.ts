import {
  Controller,
  Get,
  Headers,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { TeacherDashboardService } from "./teacher-dashboard.service";

@Controller("dashboards")
export class TeacherDashboardController {
  constructor(
    private readonly config: ConfigService,
    private readonly dashboardService: TeacherDashboardService,
  ) {}

  @Get("teacher")
  async getDashboard(
    @Headers("x-demo-user-id") userIdHeader?: string,
    @Query("role") roleQuery?: string,
    @Query("year") yearQuery?: string,
    @Query("month") monthQuery?: string,
  ) {
    const { userId, role, year, month } = this.parseDemoRequest(
      userIdHeader,
      roleQuery,
      yearQuery,
      monthQuery,
    );
    return {
      data: await this.dashboardService.getDashboard(userId, role, year, month),
      meta: { request_id: randomUUID() },
    };
  }

  @Get("teacher/annual")
  async getAnnualProgress(
    @Headers("x-demo-user-id") userIdHeader?: string,
    @Query("role") roleQuery?: string,
    @Query("year") yearQuery?: string,
  ) {
    const { userId, role, year } = this.parseDemoRequest(
      userIdHeader,
      roleQuery,
      yearQuery,
    );
    return {
      data: await this.dashboardService.getAnnualProgress(userId, role, year),
      meta: { request_id: randomUUID() },
    };
  }

  private parseDemoRequest(
    userIdHeader?: string,
    roleQuery?: string,
    yearQuery?: string,
    monthQuery?: string,
  ) {
    if (this.config.get<string>("DEMO_AUTH_ENABLED", "false") !== "true") {
      throw new UnauthorizedException("生产环境禁止使用演示身份。");
    }
    const role = roleQuery === "DEAN" ? "DEAN" : "MENTOR";
    const defaultId = role === "DEAN" ? "4" : "2";
    const userId = Number.parseInt(userIdHeader ?? defaultId, 10);
    const now = new Date();
    const year = Number.parseInt(yearQuery ?? String(now.getFullYear()), 10);
    const month = Number.parseInt(monthQuery ?? String(now.getMonth() + 1), 10);
    if (
      !Number.isSafeInteger(userId) ||
      userId <= 0 ||
      year < 2000 ||
      year > 2200 ||
      month < 1 ||
      month > 12
    ) {
      throw new UnauthorizedException("演示请求参数无效。");
    }
    return { userId, role, year, month } as const;
  }
}
