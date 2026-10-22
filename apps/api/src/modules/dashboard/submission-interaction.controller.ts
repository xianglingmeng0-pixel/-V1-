import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createSubmissionCommentSchema } from "@yanji/contracts";
import { TeacherDashboardService } from "./teacher-dashboard.service";

@Controller("submissions")
export class SubmissionInteractionController {
  constructor(
    private readonly config: ConfigService,
    private readonly dashboardService: TeacherDashboardService,
  ) {}

  @Post(":id/read")
  async markRead(
    @Param("id") id: string,
    @Headers("x-demo-user-id") userIdHeader?: string,
    @Query("role") roleQuery?: string,
  ) {
    const submissionId = Number.parseInt(id, 10);
    const { userId: viewerId, role } = this.parseDemoViewer(
      userIdHeader,
      roleQuery,
    );
    if (
      !Number.isSafeInteger(submissionId) ||
      submissionId <= 0 ||
      !Number.isSafeInteger(viewerId) ||
      viewerId <= 0
    ) {
      throw new UnauthorizedException("演示请求参数无效。");
    }
    await this.dashboardService.markRead(submissionId, viewerId, role);
    return { data: { read: true } };
  }

  @Post(":id/comments")
  async addComment(
    @Param("id") id: string,
    @Body() body: unknown,
    @Headers("x-demo-user-id") userIdHeader?: string,
    @Query("role") roleQuery?: string,
  ) {
    const submissionId = Number.parseInt(id, 10);
    const { userId, role } = this.parseDemoViewer(userIdHeader, roleQuery);
    const parsed = createSubmissionCommentSchema.safeParse({
      ...(typeof body === "object" && body ? body : {}),
      submission_id: submissionId,
    });
    if (!parsed.success) throw new BadRequestException("评论内容不能为空。");
    await this.dashboardService.addComment(
      submissionId,
      userId,
      role,
      parsed.data.content,
    );
    return { data: { created: true } };
  }

  private parseDemoViewer(userIdHeader?: string, roleQuery?: string) {
    if (this.config.get<string>("DEMO_AUTH_ENABLED", "false") !== "true") {
      throw new UnauthorizedException("生产环境禁止使用演示身份。");
    }
    const role = roleQuery === "DEAN" ? "DEAN" : "MENTOR";
    const userId = Number.parseInt(
      userIdHeader ?? (role === "DEAN" ? "4" : "2"),
      10,
    );
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new UnauthorizedException("演示请求参数无效。");
    }
    return { userId, role } as const;
  }
}
