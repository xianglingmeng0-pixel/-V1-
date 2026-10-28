-- V1 simplified workflow: one deadline, 24-hour grace period, read receipts,
-- comments without scores, and student-authorized additional teachers.
BEGIN;

ALTER TABLE monthly_cycles
  ADD COLUMN missed_remind_at timestamptz,
  ADD COLUMN grace_deadline_at timestamptz;

UPDATE monthly_cycles
SET open_at = make_timestamptz(
      cycle_year,
      cycle_month,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(cycle_year, cycle_month, 1)
                    + interval '1 month - 1 day')
        )::integer
      ),
      23,
      59,
      59,
      'Asia/Shanghai'
    ) - interval '29 days',
    remind_at = make_timestamptz(
      cycle_year,
      cycle_month,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(cycle_year, cycle_month, 1)
                    + interval '1 month - 1 day')
        )::integer
      ),
      23,
      59,
      59,
      'Asia/Shanghai'
    ) - interval '7 days',
    deadline_at = make_timestamptz(
      cycle_year,
      cycle_month,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(cycle_year, cycle_month, 1)
                    + interval '1 month - 1 day')
        )::integer
      ),
      23,
      59,
      59,
      'Asia/Shanghai'
    ),
    review_deadline_at = make_timestamptz(
      cycle_year,
      cycle_month,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(cycle_year, cycle_month, 1)
                    + interval '1 month - 1 day')
        )::integer
      ),
      23,
      59,
      59,
      'Asia/Shanghai'
    ) + interval '7 days',
    missed_remind_at = make_timestamptz(
      cycle_year,
      cycle_month,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(cycle_year, cycle_month, 1)
                    + interval '1 month - 1 day')
        )::integer
      ),
      23,
      59,
      59,
      'Asia/Shanghai'
    ) + interval '5 minutes',
    grace_deadline_at = make_timestamptz(
      cycle_year,
      cycle_month,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(cycle_year, cycle_month, 1)
                    + interval '1 month - 1 day')
        )::integer
      ),
      23,
      59,
      59,
      'Asia/Shanghai'
    ) + interval '1 day',
    late_deadline_at = make_timestamptz(
      cycle_year,
      cycle_month,
      LEAST(
        30,
        EXTRACT(
          DAY FROM (make_date(cycle_year, cycle_month, 1)
                    + interval '1 month - 1 day')
        )::integer
      ),
      23,
      59,
      59,
      'Asia/Shanghai'
    ) + interval '1 day',
    allow_late = true;

ALTER TABLE monthly_cycles
  ALTER COLUMN missed_remind_at SET NOT NULL,
  ALTER COLUMN grace_deadline_at SET NOT NULL,
  ADD CONSTRAINT ck_monthly_cycle_grace
    CHECK (
      missed_remind_at >= deadline_at
      AND grace_deadline_at = deadline_at + interval '1 day'
    );

CREATE TABLE student_teacher_access (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id  bigint NOT NULL REFERENCES users(id),
  teacher_id  bigint NOT NULL REFERENCES users(id),
  access_type varchar(20) NOT NULL DEFAULT 'VIEW_ONLY'
              CHECK (access_type = 'VIEW_ONLY'),
  status      varchar(20) NOT NULL DEFAULT 'ACTIVE'
              CHECK (status IN ('ACTIVE', 'REVOKED')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz,
  CHECK (student_id <> teacher_id)
);

CREATE UNIQUE INDEX uq_student_teacher_access_active
  ON student_teacher_access(student_id, teacher_id)
  WHERE status = 'ACTIVE';
CREATE INDEX idx_student_teacher_access_teacher
  ON student_teacher_access(teacher_id, status, student_id);

CREATE TABLE submission_reads (
  submission_id bigint NOT NULL REFERENCES monthly_submissions(id) ON DELETE CASCADE,
  viewer_id     bigint NOT NULL REFERENCES users(id),
  first_read_at timestamptz NOT NULL DEFAULT now(),
  last_read_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (submission_id, viewer_id)
);

CREATE INDEX idx_submission_reads_viewer
  ON submission_reads(viewer_id, last_read_at DESC);

CREATE TABLE submission_comments (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submission_id bigint NOT NULL REFERENCES monthly_submissions(id) ON DELETE CASCADE,
  version_id    bigint REFERENCES submission_versions(id),
  author_id     bigint NOT NULL REFERENCES users(id),
  content       text NOT NULL CHECK (length(btrim(content)) BETWEEN 1 AND 2000),
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX idx_submission_comments_timeline
  ON submission_comments(submission_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW v_monthly_submission_status AS
SELECT
  s.*,
  c.scope_org_id,
  c.cycle_year,
  c.cycle_month,
  c.deadline_at,
  CASE
    WHEN s.status = 'PENDING' AND now() > c.grace_deadline_at THEN 'MISSED'
    WHEN s.status = 'PENDING' AND now() > c.deadline_at THEN 'GRACE'
    WHEN s.status <> 'PENDING' AND s.is_late THEN 'SUBMITTED_LATE'
    WHEN s.status = 'ARCHIVED' THEN 'ARCHIVED'
    WHEN s.status <> 'PENDING' THEN 'SUBMITTED'
    ELSE 'PENDING'
  END AS display_status
FROM monthly_submissions s
JOIN monthly_cycles c ON c.id = s.cycle_id;

COMMIT;
