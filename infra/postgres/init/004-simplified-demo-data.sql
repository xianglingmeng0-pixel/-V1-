-- Rich V1 demonstration data: six students, a dean, an additional teacher,
-- and a complete twelve-month progress matrix.
BEGIN;

INSERT INTO users (user_no, name, status) VALUES
  ('D0001', '张院长', 'ACTIVE'),
  ('20260002', '陈思远', 'ACTIVE'),
  ('20260003', '赵一诺', 'ACTIVE'),
  ('20260004', '周子涵', 'ACTIVE'),
  ('20260005', '孙嘉宁', 'ACTIVE'),
  ('20260006', '吴桐', 'ACTIVE'),
  ('T0002', '周老师', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT users.id, roles.id, admin.id
FROM users
JOIN roles ON roles.code = CASE
  WHEN users.user_no = 'D0001' THEN 'DEAN'
  WHEN users.user_no = 'T0002' THEN 'MENTOR'
  ELSE 'STUDENT'
END
CROSS JOIN users admin
WHERE users.user_no IN (
  'D0001', 'T0002', '20260002', '20260003',
  '20260004', '20260005', '20260006'
)
AND admin.user_no = 'A0001';

INSERT INTO user_org_memberships (user_id, org_unit_id, membership_type, start_date)
SELECT users.id, org.id, 'PRIMARY', CURRENT_DATE
FROM users
CROSS JOIN org_units org
WHERE users.user_no IN (
  'D0001', 'T0002', '20260002', '20260003',
  '20260004', '20260005', '20260006'
)
AND org.code = 'CS';

INSERT INTO student_profiles (
  user_id, student_no, major_id, class_id, grade, enrollment_year, degree_level
)
SELECT students.id, students.user_no, major.id, class.id, '2026',
       EXTRACT(YEAR FROM CURRENT_DATE)::smallint, 'MASTER'
FROM users students
JOIN majors major ON major.code = 'SE'
JOIN classes class ON class.code = 'SE-2026-1'
WHERE students.user_no BETWEEN '20260002' AND '20260006';

INSERT INTO staff_profiles (user_id, employee_no, professional_title, contact_email)
SELECT id, user_no,
       CASE WHEN user_no = 'D0001' THEN '教授' ELSE '讲师' END,
       lower(user_no) || '@example.edu.cn'
FROM users WHERE user_no IN ('D0001', 'T0002');

INSERT INTO mentor_profiles (user_id, research_direction, introduction)
SELECT id, '数据智能与可信软件', '演示教师资料。'
FROM users WHERE user_no IN ('D0001', 'T0002');

INSERT INTO mentor_student_relations (
  mentor_id, student_id, start_date, is_primary, status, created_by
)
SELECT mentor.id, student.id, CURRENT_DATE, true, 'ACTIVE', admin.id
FROM users mentor
CROSS JOIN users student
CROSS JOIN users admin
WHERE mentor.user_no = 'T0001'
  AND student.user_no BETWEEN '20260002' AND '20260006'
  AND admin.user_no = 'A0001';

INSERT INTO student_teacher_access (student_id, teacher_id)
SELECT student.id, teacher.id
FROM users student
CROSS JOIN users teacher
WHERE student.user_no = '20260001' AND teacher.user_no = 'T0002';

WITH month_numbers AS (
  SELECT generate_series(1, 12)::integer AS month_number
), cycle_values AS (
  SELECT
    org.id AS org_id,
    EXTRACT(YEAR FROM CURRENT_DATE)::integer AS cycle_year,
    month_number,
    make_timestamptz(
      EXTRACT(YEAR FROM CURRENT_DATE)::integer,
      month_number,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(
            EXTRACT(YEAR FROM CURRENT_DATE)::integer,
            month_number,
            1
          ) + interval '1 month - 1 day')
        )::integer
      ),
      23, 59, 59, 'Asia/Shanghai'
    ) AS deadline_at,
    admin.id AS admin_id
  FROM month_numbers
  CROSS JOIN org_units org
  CROSS JOIN users admin
  WHERE org.code = 'CS' AND admin.user_no = 'A0001'
)
INSERT INTO monthly_cycles (
  scope_org_id, cycle_year, cycle_month, title, description,
  open_at, remind_at, deadline_at, review_deadline_at,
  allow_late, late_deadline_at, status, created_by,
  missed_remind_at, grace_deadline_at
)
SELECT
  org_id,
  cycle_year,
  month_number,
  cycle_year || '年' || lpad(month_number::text, 2, '0') || '月成果报告',
  '学生月度成果提交周期',
  deadline_at - interval '29 days',
  deadline_at - interval '7 days',
  deadline_at,
  NULL,
  true,
  deadline_at + interval '1 day',
  CASE
    WHEN month_number > EXTRACT(MONTH FROM CURRENT_DATE) THEN 'SCHEDULED'
    WHEN month_number = EXTRACT(MONTH FROM CURRENT_DATE) THEN 'OPEN'
    ELSE 'CLOSED'
  END,
  admin_id,
  deadline_at + interval '5 minutes',
  deadline_at + interval '1 day'
FROM cycle_values
ON CONFLICT (scope_org_id, cycle_year, cycle_month) DO NOTHING;

INSERT INTO monthly_submissions (
  cycle_id, student_id, mentor_id, mentor_relation_id, status,
  first_submitted_at, final_submitted_at, is_late
)
SELECT
  cycle.id,
  student.id,
  mentor.id,
  relation.id,
  CASE
    WHEN cycle.cycle_month < EXTRACT(MONTH FROM CURRENT_DATE)
      AND NOT (
        (student.user_no IN ('20260002', '20260005') AND cycle.cycle_month = 8)
        OR (student.user_no = '20260004' AND cycle.cycle_month = 6)
      ) THEN 'SUBMITTED'
    WHEN cycle.cycle_month = EXTRACT(MONTH FROM CURRENT_DATE)
      AND student.user_no IN ('20260002', '20260003', '20260006') THEN 'SUBMITTED'
    ELSE 'PENDING'
  END,
  CASE
    WHEN cycle.cycle_month < EXTRACT(MONTH FROM CURRENT_DATE)
      AND NOT (
        (student.user_no IN ('20260002', '20260005') AND cycle.cycle_month = 8)
        OR (student.user_no = '20260004' AND cycle.cycle_month = 6)
      ) THEN cycle.deadline_at - interval '2 days'
    WHEN cycle.cycle_month = EXTRACT(MONTH FROM CURRENT_DATE)
      AND student.user_no IN ('20260002', '20260003', '20260006')
      THEN now() - interval '2 days'
    ELSE NULL
  END,
  CASE
    WHEN cycle.cycle_month < EXTRACT(MONTH FROM CURRENT_DATE)
      AND NOT (
        (student.user_no IN ('20260002', '20260005') AND cycle.cycle_month = 8)
        OR (student.user_no = '20260004' AND cycle.cycle_month = 6)
      ) THEN cycle.deadline_at - interval '2 days'
    WHEN cycle.cycle_month = EXTRACT(MONTH FROM CURRENT_DATE)
      AND student.user_no IN ('20260002', '20260003', '20260006')
      THEN now() - interval '2 days'
    ELSE NULL
  END,
  false
FROM monthly_cycles cycle
CROSS JOIN users student
CROSS JOIN users mentor
JOIN mentor_student_relations relation
  ON relation.student_id = student.id
  AND relation.mentor_id = mentor.id
  AND relation.status = 'ACTIVE'
WHERE cycle.cycle_year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND student.user_no BETWEEN '20260001' AND '20260006'
  AND mentor.user_no = 'T0001'
ON CONFLICT (cycle_id, student_id) DO UPDATE SET
  status = EXCLUDED.status,
  first_submitted_at = EXCLUDED.first_submitted_at,
  final_submitted_at = EXCLUDED.final_submitted_at,
  is_late = EXCLUDED.is_late;

INSERT INTO submission_reads (submission_id, viewer_id)
SELECT submission.id, mentor.id
FROM monthly_submissions submission
JOIN monthly_cycles cycle ON cycle.id = submission.cycle_id
JOIN users student ON student.id = submission.student_id
CROSS JOIN users mentor
WHERE cycle.cycle_year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND cycle.cycle_month = EXTRACT(MONTH FROM CURRENT_DATE)
  AND student.user_no = '20260002'
  AND mentor.user_no = 'T0001'
  AND submission.first_submitted_at IS NOT NULL;

INSERT INTO submission_comments (submission_id, author_id, content)
SELECT submission.id, mentor.id, '内容已查看，建议下月补充实验对照结果。'
FROM monthly_submissions submission
JOIN monthly_cycles cycle ON cycle.id = submission.cycle_id
JOIN users student ON student.id = submission.student_id
CROSS JOIN users mentor
WHERE cycle.cycle_year = EXTRACT(YEAR FROM CURRENT_DATE)
  AND cycle.cycle_month = EXTRACT(MONTH FROM CURRENT_DATE)
  AND student.user_no = '20260002'
  AND mentor.user_no = 'T0001';

COMMIT;
