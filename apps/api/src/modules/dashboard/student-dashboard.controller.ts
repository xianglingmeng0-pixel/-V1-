import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StudentDashboardResponse } from "@yanji/contracts";
import { randomUUID } from "node:crypto";
import { StudentDashboardService } from "./student-dashboard.service";

@Controller("dashboards/student")
export class StudentDashboardController {
  constructor(
    private readonly config: ConfigService,
    private readonly dashboardService: StudentDashboardService,
  ) {}

  @Get()
  async getDashboard(
    @Headers("x-demo-user-id") demoUserId?: string,
  ): Promise<StudentDashboardResponse> {
    if (this.config.get<string>("DEMO_AUTH_ENABLED", "false") !== "true") {
      throw new UnauthorizedException(
        "真实身份认证尚未接入，生产环境禁止使用演示身份。",
      );
    }

    const configuredId = this.config.get<string>("DEMO_STUDENT_ID", "1");
    const userId = Number.parseInt(demoUserId ?? configuredId, 10);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new UnauthorizedException("演示用户ID无效。");
    }

    return {
      data: await this.dashboardService.getDashboard(userId),
      meta: { request_id: randomUUID() },
    };
  }
}
