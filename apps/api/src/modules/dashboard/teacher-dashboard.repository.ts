import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

export interface TeacherViewerRow {
  id: number;
  name: string;
}

export interface TeacherReportRow {
  submission_id: number;
  student_id: number;
  student_no: string;
  student_name: string;
  student_grade: string;
  mentor_name: string;
  title: string;
  completion_status: string;
  read_status: string;
  submitted_at: Date | null;
  mentor_comment: string | null;
  comment_count: number;
}

export interface AnnualProgressRow {
  student_id: number;
  student_no: string;
  student_name: string;
  student_grade: string;
  mentor_name: string;
  cycle_month: number | null;
  completion_status: string | null;
}

@Injectable()
export class TeacherDashboardRepository {
  constructor(private readonly database: DatabaseService) {}

  async findViewer(userId: number): Promise<TeacherViewerRow | null> {
    const rows = await this.database.query<TeacherViewerRow>(
      `SELECT id::int AS id, name
       FROM users
       WHERE id = $1 AND deleted_at IS NULL AND status = 'ACTIVE'`,
      [userId],
    );
    return rows[0] ?? null;
  }

  findReports(
    userId: number,
    role: "MENTOR" | "DEAN",
    year: number,
    month: number,
  ): Promise<TeacherReportRow[]> {
    return this.database.query<TeacherReportRow>(
      `SELECT
         s.id::int AS submission_id,
         student.id::int AS student_id,
         student.user_no AS student_no,
         student.name AS student_name,
         COALESCE(student_profile.grade, '未填写') AS student_grade,
         mentor.name AS mentor_name,
         c.title,
         CASE
           WHEN s.first_submitted_at IS NOT NULL THEN 'COMPLETE'
           WHEN now() > c.grace_deadline_at THEN 'MISSED'
           WHEN now() > c.deadline_at THEN 'GRACE'
           ELSE 'PENDING'
         END AS completion_status,
         CASE WHEN reads.submission_id IS NULL THEN 'UNREAD' ELSE 'READ' END AS read_status,
         s.final_submitted_at AS submitted_at,
         mentor_comment.content AS mentor_comment,
         count(comments.id)::int AS comment_count
       FROM monthly_submissions s
       JOIN monthly_cycles c ON c.id = s.cycle_id
       JOIN users student ON student.id = s.student_id
       LEFT JOIN student_profiles student_profile
         ON student_profile.user_id = student.id
       JOIN users mentor ON mentor.id = s.mentor_id
       LEFT JOIN submission_reads reads
         ON reads.submission_id = s.id AND reads.viewer_id = $1
       LEFT JOIN submission_comments comments ON comments.submission_id = s.id
         AND comments.author_id = $1
         AND comments.deleted_at IS NULL
       LEFT JOIN LATERAL (
         SELECT mentor_comments.content
         FROM submission_comments mentor_comments
         WHERE mentor_comments.submission_id = s.id
           AND mentor_comments.author_id = s.mentor_id
           AND mentor_comments.deleted_at IS NULL
         ORDER BY mentor_comments.created_at DESC
         LIMIT 1
       ) mentor_comment ON true
       WHERE c.cycle_year = $3
         AND c.cycle_month = $4
         AND ($2 = 'DEAN' OR s.mentor_id = $1)
       GROUP BY s.id, student.id, student_profile.grade, mentor.name,
                c.title, c.deadline_at,
                c.grace_deadline_at, reads.submission_id,
                mentor_comment.content
       ORDER BY
         CASE WHEN $2 = 'DEAN' THEN mentor.name ELSE '' END,
         CASE COALESCE(student_profile.grade, '未填写')
           WHEN '大一' THEN 1 WHEN '大二' THEN 2
           WHEN '大三' THEN 3 WHEN '大四' THEN 4
           WHEN '研一' THEN 5 WHEN '研二' THEN 6 WHEN '研三' THEN 7
           WHEN '博一' THEN 8 WHEN '博二' THEN 9
           WHEN '博三' THEN 10 WHEN '博四' THEN 11
           ELSE 99
         END,
         student.name`,
      [userId, role, year, month],
    );
  }

  findAnnualProgress(
    userId: number,
    role: "MENTOR" | "DEAN",
    year: number,
  ): Promise<AnnualProgressRow[]> {
    return this.database.query<AnnualProgressRow>(
      `WITH visible_students AS (
         SELECT relation.student_id, relation.mentor_id
         FROM mentor_student_relations relation
         WHERE relation.status = 'ACTIVE'
           AND relation.is_primary = true
           AND ($2 = 'DEAN' OR relation.mentor_id = $1)
       )
       SELECT
         student.id::int AS student_id,
         student.user_no AS student_no,
         student.name AS student_name,
         COALESCE(student_profile.grade, '未填写') AS student_grade,
         mentor.name AS mentor_name,
         c.cycle_month::int AS cycle_month,
         CASE
           WHEN s.first_submitted_at IS NOT NULL THEN 'COMPLETE'
           WHEN c.id IS NULL OR c.cycle_year > EXTRACT(YEAR FROM CURRENT_DATE)
             OR (c.cycle_year = EXTRACT(YEAR FROM CURRENT_DATE)
                 AND c.cycle_month > EXTRACT(MONTH FROM CURRENT_DATE)) THEN 'FUTURE'
           WHEN now() > c.grace_deadline_at THEN 'MISSED'
           WHEN now() > c.deadline_at THEN 'GRACE'
           ELSE 'PENDING'
         END AS completion_status
       FROM visible_students visible
       JOIN users student ON student.id = visible.student_id
       LEFT JOIN student_profiles student_profile
         ON student_profile.user_id = student.id
       JOIN users mentor ON mentor.id = visible.mentor_id
       LEFT JOIN monthly_cycles c ON c.cycle_year = $3
       LEFT JOIN monthly_submissions s
         ON s.cycle_id = c.id AND s.student_id = visible.student_id
       ORDER BY
         CASE WHEN $2 = 'DEAN' THEN mentor.name ELSE '' END,
         CASE COALESCE(student_profile.grade, '未填写')
           WHEN '大一' THEN 1 WHEN '大二' THEN 2
           WHEN '大三' THEN 3 WHEN '大四' THEN 4
           WHEN '研一' THEN 5 WHEN '研二' THEN 6 WHEN '研三' THEN 7
           WHEN '博一' THEN 8 WHEN '博二' THEN 9
           WHEN '博三' THEN 10 WHEN '博四' THEN 11
           ELSE 99
         END,
         student.name,
         c.cycle_month`,
      [userId, role, year],
    );
  }

  async markRead(
    submissionId: number,
    viewerId: number,
    role: "MENTOR" | "DEAN",
  ): Promise<boolean> {
    const rows = await this.database.query<{ submission_id: number }>(
      `INSERT INTO submission_reads (submission_id, viewer_id)
       SELECT submission.id, $2
       FROM monthly_submissions submission
       WHERE submission.id = $1
         AND (
           $3 = 'DEAN'
           OR submission.mentor_id = $2
           OR EXISTS (
             SELECT 1 FROM student_teacher_access access
             WHERE access.student_id = submission.student_id
               AND access.teacher_id = $2
               AND access.status = 'ACTIVE'
           )
         )
       ON CONFLICT (submission_id, viewer_id)
       DO UPDATE SET last_read_at = now()
       RETURNING submission_id::int`,
      [submissionId, viewerId, role],
    );
    return rows.length > 0;
  }

  async addComment(
    submissionId: number,
    authorId: number,
    role: "MENTOR" | "DEAN",
    content: string,
  ): Promise<boolean> {
    const rows = await this.database.query<{ id: number }>(
      `INSERT INTO submission_comments (submission_id, author_id, content)
       SELECT submission.id, $2, $4
       FROM monthly_submissions submission
       WHERE submission.id = $1
         AND ($3 = 'DEAN' OR submission.mentor_id = $2)
       RETURNING id::int`,
      [submissionId, authorId, role, content],
    );
    return rows.length > 0;
  }
}
