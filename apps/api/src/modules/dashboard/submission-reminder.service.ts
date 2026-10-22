import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class SubmissionReminderService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(SubmissionReminderService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly database: DatabaseService) {}

  onModuleInit(): void {
    void this.enqueueDueReminders();
    this.timer = setInterval(() => void this.enqueueDueReminders(), 300_000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async enqueueDueReminders(): Promise<void> {
    try {
      await this.database.query(
        `INSERT INTO notifications (
           recipient_id, channel, event_type, title, content,
           business_type, business_id, idempotency_key, scheduled_at
         )
         SELECT
           submission.student_id,
           'SMS',
           'MONTHLY_REPORT_GRACE_STARTED',
           '月度成果补交提醒',
           '你本月的成果报告尚未提交，请在24小时补交期内完成。',
           'MONTHLY_SUBMISSION',
           submission.id,
           'monthly-grace-sms:' || submission.id,
           cycle.missed_remind_at
         FROM monthly_submissions submission
         JOIN monthly_cycles cycle ON cycle.id = submission.cycle_id
         WHERE submission.status = 'PENDING'
           AND cycle.missed_remind_at <= now()
           AND cycle.grace_deadline_at > now()
         ON CONFLICT (idempotency_key) DO NOTHING`,
      );
    } catch (error) {
      this.logger.error("Failed to enqueue monthly report reminders", error);
    }
  }
}
