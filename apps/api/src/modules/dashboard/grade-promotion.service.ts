import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class GradePromotionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GradePromotionService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly database: DatabaseService) {}

  onModuleInit(): void {
    void this.promoteGradesAfterSummer();
    this.timer = setInterval(
      () => void this.promoteGradesAfterSummer(),
      86_400_000,
    );
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async promoteGradesAfterSummer(): Promise<void> {
    const shanghaiDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const [yearValue, monthValue] = shanghaiDate.split("-");
    const year = Number(yearValue);
    const month = Number(monthValue);
    if (!Number.isInteger(year) || month < 9) return;

    try {
      const rows = await this.database.query<{ updated_count: number }>(
        `WITH previous AS (
           SELECT (config_value->>'year')::int AS last_year
           FROM system_configs
           WHERE config_key = 'student_grade_last_promoted_year'
         ), claimed AS (
           INSERT INTO system_configs (config_key, config_value, description)
           VALUES (
             'student_grade_last_promoted_year',
             jsonb_build_object('year', $1::int),
             '每年暑假结束后统一升级学生年级'
           )
           ON CONFLICT (config_key) DO UPDATE
           SET config_value = EXCLUDED.config_value,
               updated_at = now()
           WHERE (system_configs.config_value->>'year')::int < $1
           RETURNING config_key
         ), promoted AS (
           UPDATE student_profiles
           SET grade = CASE grade
             WHEN '大一' THEN '大二'
             WHEN '大二' THEN '大三'
             WHEN '大三' THEN '大四'
             WHEN '研一' THEN '研二'
             WHEN '研二' THEN '研三'
             WHEN '博一' THEN '博二'
             WHEN '博二' THEN '博三'
             WHEN '博三' THEN '博四'
             ELSE grade
           END,
           updated_at = now()
           WHERE grade IN (
             '大一', '大二', '大三',
             '研一', '研二',
             '博一', '博二', '博三'
           )
             AND EXISTS (
               SELECT 1 FROM previous WHERE last_year < $1
             )
             AND EXISTS (SELECT 1 FROM claimed)
           RETURNING user_id
         )
         SELECT count(*)::int AS updated_count FROM promoted`,
        [year],
      );
      const updatedCount = rows[0]?.updated_count ?? 0;
      if (updatedCount > 0) {
        this.logger.log(`Promoted grades for ${updatedCount} students`);
      }
    } catch (error) {
      this.logger.error("Failed to promote student grades", error);
    }
  }
}
