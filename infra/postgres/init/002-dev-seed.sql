-- Local development seed data. Never run this file in production.
BEGIN;

INSERT INTO org_units (code, name, unit_type)
VALUES ('CS', '计算机学院', 'COLLEGE');

INSERT INTO majors (org_unit_id, code, name, degree_level)
SELECT id, 'SE', '软件工程', 'MASTER'
FROM org_units WHERE code = 'CS';

INSERT INTO classes (major_id, code, name, enrollment_year)
SELECT id, 'SE-2026-1', '软件工程2026级1班', EXTRACT(YEAR FROM CURRENT_DATE)::smallint
FROM majors WHERE code = 'SE';

INSERT INTO users (user_no, name, status) VALUES
  ('20260001', '林晓雨', 'ACTIVE'),
  ('T0001', '龚老师', 'ACTIVE'),
  ('A0001', '系统管理员', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT student.id, role.id, admin.id
FROM users student
JOIN roles role ON role.code = 'STUDENT'
CROSS JOIN users admin
WHERE student.user_no = '20260001' AND admin.user_no = 'A0001';

INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT mentor.id, role.id, admin.id
FROM users mentor
JOIN roles role ON role.code = 'MENTOR'
CROSS JOIN users admin
WHERE mentor.user_no = 'T0001' AND admin.user_no = 'A0001';

INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT admin.id, role.id, admin.id
FROM users admin
JOIN roles role ON role.code = 'ADMIN'
WHERE admin.user_no = 'A0001';

INSERT INTO user_org_memberships (user_id, org_unit_id, membership_type, start_date)
SELECT users.id, org_units.id, 'PRIMARY', CURRENT_DATE
FROM users CROSS JOIN org_units
WHERE users.user_no IN ('20260001', 'T0001', 'A0001') AND org_units.code = 'CS';

INSERT INTO student_profiles (
  user_id, student_no, major_id, class_id, grade, enrollment_year, degree_level
)
SELECT student.id, student.user_no, major.id, class.id, '大三',
       EXTRACT(YEAR FROM CURRENT_DATE)::smallint, 'MASTER'
FROM users student
JOIN majors major ON major.code = 'SE'
JOIN classes class ON class.code = 'SE-2026-1'
WHERE student.user_no = '20260001';

INSERT INTO staff_profiles (user_id, employee_no, professional_title, contact_email)
SELECT id, user_no, '副教授', 'mentor@example.edu.cn'
FROM users WHERE user_no = 'T0001';

INSERT INTO mentor_profiles (user_id, research_direction, introduction)
SELECT id, '机器学习与科学计算', '关注数据驱动建模与工程应用。'
FROM users WHERE user_no = 'T0001';

INSERT INTO mentor_student_relations (
  mentor_id, student_id, start_date, is_primary, status, created_by
)
SELECT mentor.id, student.id, CURRENT_DATE, true, 'ACTIVE', admin.id
FROM users mentor
CROSS JOIN users student
CROSS JOIN users admin
WHERE mentor.user_no = 'T0001'
  AND student.user_no = '20260001'
  AND admin.user_no = 'A0001';

INSERT INTO monthly_cycles (
  scope_org_id, cycle_year, cycle_month, title, description,
  open_at, remind_at, deadline_at, review_deadline_at,
  allow_late, late_deadline_at, status, created_by
)
SELECT
  org.id,
  EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
  EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
  to_char(CURRENT_DATE, 'YYYY年MM月') || '成果报告',
  '本地开发演示周期',
  now() - interval '10 days',
  now() + interval '4 days',
  now() + interval '11 days',
  now() + interval '16 days',
  true,
  now() + interval '14 days',
  'OPEN',
  admin.id
FROM org_units org
CROSS JOIN users admin
WHERE org.code = 'CS' AND admin.user_no = 'A0001';

INSERT INTO monthly_submissions (
  cycle_id, student_id, mentor_id, mentor_relation_id, status
)
SELECT cycle.id, student.id, mentor.id, relation.id, 'PENDING'
FROM monthly_cycles cycle
CROSS JOIN users student
CROSS JOIN users mentor
JOIN mentor_student_relations relation
  ON relation.student_id = student.id AND relation.mentor_id = mentor.id
WHERE student.user_no = '20260001' AND mentor.user_no = 'T0001'
ORDER BY cycle.id DESC LIMIT 1;

INSERT INTO tasks (
  mentor_id, title, description, expected_outcome, progress_requirement,
  priority, start_at, due_at, status
)
SELECT id, '补充基线模型对比实验', '完成至少两组基线实验。',
       '提交实验表格与结论', '每周更新一次进度',
       'HIGH', now() - interval '3 days', now() + interval '5 days', 'PUBLISHED'
FROM users WHERE user_no = 'T0001';

INSERT INTO task_assignees (task_id, student_id, status, progress_percent, progress_note)
SELECT task.id, student.id, 'IN_PROGRESS', 60, '已完成第一组实验'
FROM tasks task CROSS JOIN users student
WHERE student.user_no = '20260001'
ORDER BY task.id DESC LIMIT 1;

INSERT INTO announcements (
  publisher_id, scope_org_id, title, content, status, publish_at, expire_at
)
SELECT mentor.id, org.id, '周四组会安排',
       '请每位同学准备三分钟的本周进展汇报。',
       'PUBLISHED', now() - interval '1 day', now() + interval '14 days'
FROM users mentor CROSS JOIN org_units org
WHERE mentor.user_no = 'T0001' AND org.code = 'CS';

COMMIT;
