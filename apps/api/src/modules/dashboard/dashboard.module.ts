import { Module } from "@nestjs/common";
import { StudentDashboardController } from "./student-dashboard.controller";
import { StudentDashboardRepository } from "./student-dashboard.repository";
import { StudentDashboardService } from "./student-dashboard.service";
import { GradePromotionService } from "./grade-promotion.service";
import { SubmissionInteractionController } from "./submission-interaction.controller";
import { SubmissionReminderService } from "./submission-reminder.service";
import { TeacherDashboardController } from "./teacher-dashboard.controller";
import { TeacherDashboardRepository } from "./teacher-dashboard.repository";
import { TeacherDashboardService } from "./teacher-dashboard.service";

@Module({
  controllers: [
    StudentDashboardController,
    TeacherDashboardController,
    SubmissionInteractionController,
  ],
  providers: [
    StudentDashboardRepository,
    StudentDashboardService,
    GradePromotionService,
    TeacherDashboardRepository,
    TeacherDashboardService,
    SubmissionReminderService,
  ],
})
export class DashboardModule {}
