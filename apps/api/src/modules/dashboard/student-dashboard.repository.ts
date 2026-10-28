import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

export interface UserRow {
  id: number;
  user_no: string;
  name: string;
  grade: string;
}

export interface CurrentReportRow {
  id: number;
  title: string;
  deadline_at: Date;
  grace_deadline_at: Date;
  status: string;
  display_status: string;
  lock_version: number;
  mentor_id: number;
  mentor_name: string;
  professional_title: string | null;
  research_direction: string | null;
  additional_teacher_count: number;
}

export interface TaskRow {
  id: number;
  title: string;
  status: string;
  progress_percent: number;
  due_at: Date | null;
}

export interface AnnouncementRow {
  id: number;
  title: string;
  publish_at: Date | null;
}

@Injectable()
export class StudentDashboardRepository {
  constructor(private readonly database: DatabaseService) {}

  async findUser(userId: number): Promise<UserRow | null> {
    const rows = await this.database.query<UserRow>(
      `SELECT users.id::int AS id, users.user_no, users.name,
              COALESCE(profile.grade, '未填写') AS grade
       FROM users
       LEFT JOIN student_profiles profile ON profile.user_id = users.id
       WHERE users.id = $1
         AND users.deleted_at IS NULL
         AND users.status = 'ACTIVE'`,
      [userId],
    );
    return rows[0] ?? null;
  }

  async findCurrentReport(userId: number): Promise<CurrentReportRow | null> {
    const rows = await this.database.query<CurrentReportRow>(
      `SELECT
         s.id::int AS id,
         c.title,
         c.deadline_at,
         c.grace_deadline_at,
         CASE
           WHEN s.status = 'ARCHIVED' THEN 'ARCHIVED'
           WHEN s.status = 'PENDING' THEN 'PENDING'
           ELSE 'SUBMITTED'
         END AS status,
         CASE
           WHEN s.status = 'PENDING' AND now() > c.grace_deadline_at THEN 'MISSED'
           WHEN s.status = 'PENDING' AND now() > c.deadline_at THEN 'GRACE'
           WHEN s.status <> 'PENDING' AND s.is_late THEN 'SUBMITTED_LATE'
           WHEN s.status = 'ARCHIVED' THEN 'ARCHIVED'
           WHEN s.status <> 'PENDING' THEN 'SUBMITTED'
           ELSE 'PENDING'
         END AS display_status,
         s.lock_version,
         mentor.id::int AS mentor_id,
         mentor.name AS mentor_name,
         staff.professional_title,
         profile.research_direction,
         (SELECT count(*)::int
          FROM student_teacher_access access
          WHERE access.student_id = s.student_id
            AND access.status = 'ACTIVE') AS additional_teacher_count
       FROM monthly_submissions s
       JOIN monthly_cycles c ON c.id = s.cycle_id
       JOIN users mentor ON mentor.id = s.mentor_id
       LEFT JOIN staff_profiles staff ON staff.user_id = mentor.id
       LEFT JOIN mentor_profiles profile ON profile.user_id = mentor.id
       WHERE s.student_id = $1
         AND c.status IN ('SCHEDULED', 'OPEN', 'CLOSED')
       ORDER BY c.cycle_year DESC, c.cycle_month DESC
       LIMIT 1`,
      [userId],
    );
    return rows[0] ?? null;
  }

  findTasks(userId: number): Promise<TaskRow[]> {
    return this.database.query<TaskRow>(
      `SELECT t.id::int AS id, t.title, a.status, a.progress_percent, t.due_at
       FROM task_assignees a
       JOIN tasks t ON t.id = a.task_id
       WHERE a.student_id = $1 AND t.status = 'PUBLISHED'
       ORDER BY t.due_at NULLS LAST, t.id DESC
       LIMIT 5`,
      [userId],
    );
  }

  findAnnouncements(): Promise<AnnouncementRow[]> {
    return this.database.query<AnnouncementRow>(
      `SELECT id::int AS id, title, publish_at
       FROM announcements
       WHERE status = 'PUBLISHED'
         AND (publish_at IS NULL OR publish_at <= now())
         AND (expire_at IS NULL OR expire_at > now())
       ORDER BY publish_at DESC NULLS LAST, id DESC
       LIMIT 5`,
    );
  }
}
