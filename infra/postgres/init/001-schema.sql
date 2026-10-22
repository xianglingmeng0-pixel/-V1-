-- “研迹”学生—导师系统 PostgreSQL schema V1.0
-- Target: PostgreSQL 15+

BEGIN;

CREATE TABLE org_units (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id       bigint REFERENCES org_units(id),
    code            varchar(50) NOT NULL UNIQUE,
    name            varchar(150) NOT NULL,
    unit_type       varchar(20) NOT NULL CHECK (unit_type IN ('SCHOOL', 'COLLEGE', 'DEPARTMENT')),
    status          varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    sort_order      integer NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_org_units_parent ON org_units(parent_id);

CREATE TABLE majors (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    org_unit_id     bigint NOT NULL REFERENCES org_units(id),
    code            varchar(50) NOT NULL UNIQUE,
    name            varchar(150) NOT NULL,
    degree_level    varchar(20) CHECK (degree_level IN ('UNDERGRADUATE', 'MASTER', 'DOCTOR')),
    status          varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_majors_org ON majors(org_unit_id);

CREATE TABLE classes (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    major_id        bigint NOT NULL REFERENCES majors(id),
    code            varchar(50) NOT NULL UNIQUE,
    name            varchar(150) NOT NULL,
    enrollment_year smallint NOT NULL CHECK (enrollment_year BETWEEN 2000 AND 2200),
    status          varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_classes_major ON classes(major_id);

CREATE TABLE users (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_no         varchar(50) NOT NULL UNIQUE,
    name            varchar(100) NOT NULL,
    avatar_url      text,
    email           varchar(255),
    status          varchar(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'ACTIVE', 'DISABLED', 'LOCKED')),
    last_login_at   timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

CREATE UNIQUE INDEX uq_users_email_active
    ON users(lower(email)) WHERE email IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

CREATE TABLE auth_identities (
    id                      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                 bigint NOT NULL REFERENCES users(id),
    identity_type           varchar(20) NOT NULL CHECK (identity_type IN ('PHONE', 'WECHAT', 'PASSWORD')),
    identifier_hash         varchar(128) NOT NULL,
    identifier_ciphertext   text,
    credential_hash         text,
    verified_at             timestamptz,
    last_login_at           timestamptz,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (identity_type, identifier_hash)
);

CREATE INDEX idx_auth_identities_user ON auth_identities(user_id);

CREATE TABLE roles (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code            varchar(50) NOT NULL UNIQUE,
    name            varchar(100) NOT NULL,
    is_builtin      boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code            varchar(100) NOT NULL UNIQUE,
    name            varchar(100) NOT NULL,
    module          varchar(50) NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         bigint NOT NULL REFERENCES users(id),
    role_id         bigint NOT NULL REFERENCES roles(id),
    granted_by      bigint REFERENCES users(id),
    granted_at      timestamptz NOT NULL DEFAULT now(),
    revoked_at      timestamptz
);

CREATE UNIQUE INDEX uq_user_roles_active
    ON user_roles(user_id, role_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_roles_role ON user_roles(role_id) WHERE revoked_at IS NULL;

CREATE TABLE user_org_memberships (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         bigint NOT NULL REFERENCES users(id),
    org_unit_id     bigint NOT NULL REFERENCES org_units(id),
    membership_type varchar(20) NOT NULL DEFAULT 'PRIMARY'
                    CHECK (membership_type IN ('PRIMARY', 'AFFILIATED')),
    start_date      date NOT NULL,
    end_date        date,
    created_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (end_date IS NULL OR end_date >= start_date),
    UNIQUE (user_id, org_unit_id, start_date)
);

CREATE UNIQUE INDEX uq_user_current_primary_org
    ON user_org_memberships(user_id)
    WHERE membership_type = 'PRIMARY' AND end_date IS NULL;
CREATE INDEX idx_user_org_memberships_org
    ON user_org_memberships(org_unit_id, user_id) WHERE end_date IS NULL;

CREATE TABLE role_permissions (
    role_id         bigint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   bigint NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_data_scopes (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         bigint NOT NULL REFERENCES users(id),
    scope_type      varchar(20) NOT NULL CHECK (scope_type IN ('ALL', 'ORG_UNIT', 'SELF')),
    org_unit_id     bigint REFERENCES org_units(id),
    created_by      bigint REFERENCES users(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (
        (scope_type = 'ORG_UNIT' AND org_unit_id IS NOT NULL)
        OR (scope_type IN ('ALL', 'SELF') AND org_unit_id IS NULL)
    )
);

CREATE UNIQUE INDEX uq_user_data_scopes
    ON user_data_scopes(user_id, scope_type, COALESCE(org_unit_id, 0));

CREATE TABLE student_profiles (
    user_id          bigint PRIMARY KEY REFERENCES users(id),
    student_no       varchar(50) NOT NULL UNIQUE,
    major_id         bigint REFERENCES majors(id),
    class_id         bigint REFERENCES classes(id),
    grade            varchar(20),
    enrollment_year  smallint CHECK (enrollment_year BETWEEN 2000 AND 2200),
    degree_level     varchar(20) CHECK (degree_level IN ('UNDERGRADUATE', 'MASTER', 'DOCTOR')),
    research_status  varchar(20) NOT NULL DEFAULT 'ACTIVE'
                     CHECK (research_status IN ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'WITHDRAWN')),
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_profiles_major ON student_profiles(major_id);
CREATE INDEX idx_student_profiles_class ON student_profiles(class_id);

CREATE TABLE staff_profiles (
    user_id             bigint PRIMARY KEY REFERENCES users(id),
    employee_no         varchar(50) NOT NULL UNIQUE,
    professional_title  varchar(100),
    office_location     varchar(255),
    contact_email       varchar(255),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mentor_profiles (
    user_id             bigint PRIMARY KEY REFERENCES staff_profiles(user_id),
    research_direction  text,
    introduction        text,
    max_students        integer CHECK (max_students IS NULL OR max_students >= 0),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mentor_student_relations (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mentor_id       bigint NOT NULL REFERENCES users(id),
    student_id      bigint NOT NULL REFERENCES users(id),
    start_date      date NOT NULL,
    end_date        date,
    is_primary      boolean NOT NULL DEFAULT true,
    status          varchar(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('PENDING', 'ACTIVE', 'ENDED')),
    created_by      bigint NOT NULL REFERENCES users(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (mentor_id <> student_id),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE UNIQUE INDEX uq_student_active_primary_mentor
    ON mentor_student_relations(student_id)
    WHERE status = 'ACTIVE' AND is_primary = true AND end_date IS NULL;
CREATE INDEX idx_relations_mentor_active
    ON mentor_student_relations(mentor_id, status, student_id);
CREATE INDEX idx_relations_student_history
    ON mentor_student_relations(student_id, start_date DESC);

CREATE TABLE monthly_cycles (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    scope_org_id        bigint NOT NULL REFERENCES org_units(id),
    cycle_year          smallint NOT NULL CHECK (cycle_year BETWEEN 2000 AND 2200),
    cycle_month         smallint NOT NULL CHECK (cycle_month BETWEEN 1 AND 12),
    title               varchar(200) NOT NULL,
    description         text,
    open_at             timestamptz NOT NULL,
    remind_at           timestamptz NOT NULL,
    deadline_at         timestamptz NOT NULL,
    review_deadline_at  timestamptz,
    allow_late          boolean NOT NULL DEFAULT true,
    late_deadline_at    timestamptz,
    status              varchar(20) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT', 'SCHEDULED', 'OPEN', 'CLOSED', 'ARCHIVED')),
    created_by          bigint NOT NULL REFERENCES users(id),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (scope_org_id, cycle_year, cycle_month),
    CHECK (open_at <= remind_at AND remind_at < deadline_at),
    CHECK (review_deadline_at IS NULL OR review_deadline_at >= deadline_at),
    CHECK (
        (allow_late = false AND late_deadline_at IS NULL)
        OR (allow_late = true AND (late_deadline_at IS NULL OR late_deadline_at >= deadline_at))
    )
);

CREATE INDEX idx_monthly_cycles_schedule ON monthly_cycles(status, open_at, deadline_at);

CREATE TABLE monthly_submissions (
    id                      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cycle_id                bigint NOT NULL REFERENCES monthly_cycles(id),
    student_id              bigint NOT NULL REFERENCES users(id),
    mentor_id               bigint NOT NULL REFERENCES users(id),
    mentor_relation_id      bigint REFERENCES mentor_student_relations(id),
    status                  varchar(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'SUBMITTED', 'REVIEWING', 'RETURNED', 'APPROVED', 'ARCHIVED')),
    current_version_id      bigint,
    first_submitted_at      timestamptz,
    final_submitted_at      timestamptz,
    approved_at             timestamptz,
    final_score             numeric(5,2) CHECK (final_score BETWEEN 0 AND 100),
    is_late                 boolean NOT NULL DEFAULT false,
    lock_version            integer NOT NULL DEFAULT 0 CHECK (lock_version >= 0),
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (cycle_id, student_id)
);

CREATE INDEX idx_submissions_cycle_status
    ON monthly_submissions(cycle_id, status, student_id);
CREATE INDEX idx_submissions_mentor_status
    ON monthly_submissions(mentor_id, status, cycle_id);
CREATE INDEX idx_submissions_student_timeline
    ON monthly_submissions(student_id, cycle_id DESC);

CREATE TABLE submission_versions (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    submission_id       bigint NOT NULL REFERENCES monthly_submissions(id),
    version_no          integer NOT NULL CHECK (version_no > 0),
    title               varchar(200) NOT NULL,
    monthly_summary     text NOT NULL,
    achievements        text,
    difficulties        text,
    next_plan           text NOT NULL,
    self_progress       smallint CHECK (self_progress BETWEEN 0 AND 100),
    change_note         text,
    client_request_id   uuid UNIQUE,
    submitted_by        bigint NOT NULL REFERENCES users(id),
    submitted_at        timestamptz NOT NULL DEFAULT now(),
    created_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (submission_id, version_no),
    UNIQUE (id, submission_id)
);

ALTER TABLE monthly_submissions
    ADD CONSTRAINT fk_submission_current_version
    FOREIGN KEY (current_version_id, id)
    REFERENCES submission_versions(id, submission_id)
    DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX idx_submission_versions_latest
    ON submission_versions(submission_id, version_no DESC);

CREATE TABLE file_objects (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    original_name   varchar(500) NOT NULL,
    file_extension  varchar(20) NOT NULL,
    mime_type       varchar(150) NOT NULL,
    file_size       bigint NOT NULL CHECK (file_size > 0),
    sha256          char(64) NOT NULL,
    storage_provider varchar(30) NOT NULL,
    bucket_name     varchar(100) NOT NULL,
    object_key      varchar(1000) NOT NULL,
    uploaded_by     bigint NOT NULL REFERENCES users(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz,
    UNIQUE (storage_provider, bucket_name, object_key)
);

CREATE INDEX idx_file_objects_hash ON file_objects(sha256);

CREATE TABLE submission_version_files (
    version_id      bigint NOT NULL REFERENCES submission_versions(id),
    file_id         bigint NOT NULL REFERENCES file_objects(id),
    file_role       varchar(20) NOT NULL DEFAULT 'ATTACHMENT'
                    CHECK (file_role IN ('MAIN_REPORT', 'ATTACHMENT', 'EVIDENCE')),
    sort_order      integer NOT NULL DEFAULT 0,
    PRIMARY KEY (version_id, file_id)
);

CREATE TABLE submission_reviews (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    submission_id   bigint NOT NULL REFERENCES monthly_submissions(id),
    version_id      bigint NOT NULL,
    reviewer_id     bigint NOT NULL REFERENCES users(id),
    action          varchar(20) NOT NULL
                    CHECK (action IN ('START_REVIEW', 'COMMENT', 'RETURN', 'APPROVE', 'RESCORE')),
    comment         text,
    score           numeric(5,2) CHECK (score BETWEEN 0 AND 100),
    client_request_id uuid UNIQUE,
    created_at      timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (version_id, submission_id)
        REFERENCES submission_versions(id, submission_id)
);

CREATE INDEX idx_reviews_submission_time
    ON submission_reviews(submission_id, created_at DESC);
CREATE INDEX idx_reviews_reviewer_time
    ON submission_reviews(reviewer_id, created_at DESC);

CREATE TABLE submission_status_logs (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    submission_id   bigint NOT NULL REFERENCES monthly_submissions(id),
    from_status     varchar(20),
    to_status       varchar(20) NOT NULL,
    operator_id     bigint REFERENCES users(id),
    reason          text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_submission_status_logs
    ON submission_status_logs(submission_id, created_at DESC);

CREATE TABLE tasks (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mentor_id       bigint NOT NULL REFERENCES users(id),
    title           varchar(200) NOT NULL,
    description     text,
    expected_outcome text,
    progress_requirement text,
    priority        varchar(20) NOT NULL DEFAULT 'NORMAL'
                    CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    start_at        timestamptz,
    due_at          timestamptz,
    status          varchar(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (due_at IS NULL OR start_at IS NULL OR due_at >= start_at)
);

CREATE INDEX idx_tasks_mentor_status ON tasks(mentor_id, status, due_at);

CREATE TABLE task_assignees (
    task_id          bigint NOT NULL REFERENCES tasks(id),
    student_id       bigint NOT NULL REFERENCES users(id),
    status           varchar(20) NOT NULL DEFAULT 'TODO'
                     CHECK (status IN ('TODO', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED')),
    progress_percent smallint NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    progress_note    text,
    submitted_at     timestamptz,
    updated_at       timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (task_id, student_id)
);

CREATE INDEX idx_task_assignees_student ON task_assignees(student_id, status);

CREATE TABLE task_progress_logs (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id          bigint NOT NULL,
    student_id       bigint NOT NULL,
    progress_percent smallint NOT NULL CHECK (progress_percent BETWEEN 0 AND 100),
    progress_note    text,
    created_by       bigint NOT NULL REFERENCES users(id),
    created_at       timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (task_id, student_id)
        REFERENCES task_assignees(task_id, student_id)
);

CREATE INDEX idx_task_progress_logs_timeline
    ON task_progress_logs(task_id, student_id, created_at DESC);

CREATE TABLE task_files (
    task_id         bigint NOT NULL REFERENCES tasks(id),
    file_id         bigint NOT NULL REFERENCES file_objects(id),
    PRIMARY KEY (task_id, file_id)
);

CREATE TABLE announcements (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    publisher_id    bigint NOT NULL REFERENCES users(id),
    scope_org_id    bigint REFERENCES org_units(id),
    title           varchar(200) NOT NULL,
    content         text NOT NULL,
    status          varchar(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT', 'PUBLISHED', 'WITHDRAWN')),
    publish_at      timestamptz,
    expire_at       timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CHECK (expire_at IS NULL OR publish_at IS NULL OR expire_at > publish_at)
);

CREATE TABLE announcement_audiences (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    announcement_id bigint NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    audience_type   varchar(20) NOT NULL CHECK (audience_type IN ('ALL', 'ROLE', 'ORG_UNIT', 'USER')),
    audience_key    varchar(100),
    CHECK (
        (audience_type = 'ALL' AND audience_key IS NULL)
        OR (audience_type <> 'ALL' AND audience_key IS NOT NULL)
    )
);

CREATE INDEX idx_announcement_audiences_lookup
    ON announcement_audiences(audience_type, audience_key);

CREATE TABLE announcement_reads (
    announcement_id bigint NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id         bigint NOT NULL REFERENCES users(id),
    read_at         timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (announcement_id, user_id)
);

CREATE TABLE discussion_threads (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    thread_type     varchar(30) NOT NULL CHECK (thread_type IN ('STUDENT_MENTOR', 'GROUP_DISCUSSION')),
    title           varchar(200),
    scope_org_id    bigint REFERENCES org_units(id),
    created_by      bigint NOT NULL REFERENCES users(id),
    status          varchar(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'ARCHIVED')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE discussion_participants (
    thread_id       bigint NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    user_id         bigint NOT NULL REFERENCES users(id),
    participant_role varchar(20) NOT NULL DEFAULT 'MEMBER' CHECK (participant_role IN ('OWNER', 'MEMBER')),
    joined_at       timestamptz NOT NULL DEFAULT now(),
    last_read_at    timestamptz,
    PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX idx_discussion_participants_user ON discussion_participants(user_id, thread_id);

CREATE TABLE discussion_messages (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    thread_id       bigint NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    sender_id       bigint NOT NULL REFERENCES users(id),
    reply_to_id     bigint REFERENCES discussion_messages(id),
    content         text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    edited_at       timestamptz,
    deleted_at      timestamptz
);

CREATE INDEX idx_discussion_messages_thread
    ON discussion_messages(thread_id, created_at);

CREATE TABLE notification_templates (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code            varchar(100) NOT NULL,
    channel         varchar(20) NOT NULL CHECK (channel IN ('IN_APP', 'SMS', 'WECHAT', 'EMAIL')),
    title_template  text,
    body_template   text NOT NULL,
    status          varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (code, channel)
);

CREATE TABLE notifications (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_id    bigint NOT NULL REFERENCES users(id),
    template_id     bigint REFERENCES notification_templates(id),
    channel         varchar(20) NOT NULL CHECK (channel IN ('IN_APP', 'SMS', 'WECHAT', 'EMAIL')),
    event_type      varchar(100) NOT NULL,
    title           text,
    content         text NOT NULL,
    business_type   varchar(50),
    business_id     bigint,
    idempotency_key varchar(255) NOT NULL UNIQUE,
    status          varchar(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'SENDING', 'SENT', 'FAILED', 'CANCELLED')),
    scheduled_at    timestamptz NOT NULL DEFAULT now(),
    sent_at         timestamptz,
    read_at         timestamptz,
    retry_count     integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    last_error      text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_dispatch
    ON notifications(status, scheduled_at) WHERE status IN ('PENDING', 'FAILED');
CREATE INDEX idx_notifications_recipient
    ON notifications(recipient_id, created_at DESC);

CREATE TABLE outbox_events (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type      varchar(100) NOT NULL,
    aggregate_type  varchar(50) NOT NULL,
    aggregate_id    bigint NOT NULL,
    payload         jsonb NOT NULL,
    status          varchar(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED')),
    available_at    timestamptz NOT NULL DEFAULT now(),
    processed_at    timestamptz,
    retry_count     integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    last_error      text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_outbox_events_pending
    ON outbox_events(status, available_at) WHERE status IN ('PENDING', 'FAILED');

CREATE TABLE import_jobs (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    import_type     varchar(30) NOT NULL CHECK (import_type IN ('STUDENT', 'MENTOR', 'DEAN', 'RELATION')),
    source_file_id  bigint NOT NULL REFERENCES file_objects(id),
    status          varchar(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCEEDED', 'PARTIAL', 'FAILED')),
    total_rows      integer NOT NULL DEFAULT 0 CHECK (total_rows >= 0),
    success_rows    integer NOT NULL DEFAULT 0 CHECK (success_rows >= 0),
    failed_rows     integer NOT NULL DEFAULT 0 CHECK (failed_rows >= 0),
    created_by      bigint NOT NULL REFERENCES users(id),
    started_at      timestamptz,
    finished_at     timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE import_job_errors (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id          bigint NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
    row_number      integer NOT NULL CHECK (row_number > 0),
    raw_data        jsonb,
    error_code      varchar(100),
    error_message   text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_import_job_errors_job ON import_job_errors(job_id, row_number);

CREATE TABLE system_configs (
    config_key      varchar(100) PRIMARY KEY,
    config_value    jsonb NOT NULL,
    description     text,
    is_secret       boolean NOT NULL DEFAULT false,
    updated_by      bigint REFERENCES users(id),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_id        bigint REFERENCES users(id),
    action          varchar(100) NOT NULL,
    resource_type   varchar(50) NOT NULL,
    resource_id     varchar(100),
    before_data     jsonb,
    after_data      jsonb,
    ip_address      inet,
    user_agent      text,
    request_id      varchar(100),
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_resource
    ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor
    ON audit_logs(actor_id, created_at DESC);

-- Dynamic business status: overdue is derived rather than permanently stored.
CREATE VIEW v_monthly_submission_status AS
SELECT
    s.*,
    c.scope_org_id,
    c.cycle_year,
    c.cycle_month,
    c.deadline_at,
    CASE
        WHEN s.status = 'PENDING' AND now() > c.deadline_at THEN 'OVERDUE'
        WHEN s.status = 'RETURNED' AND now() > c.deadline_at THEN 'RETURNED_OVERDUE'
        ELSE s.status
    END AS display_status
FROM monthly_submissions s
JOIN monthly_cycles c ON c.id = s.cycle_id;

CREATE VIEW v_cycle_dashboard AS
SELECT
    c.id AS cycle_id,
    c.scope_org_id,
    c.cycle_year,
    c.cycle_month,
    count(s.id) AS expected_count,
    count(s.id) FILTER (WHERE s.first_submitted_at IS NOT NULL) AS submitted_count,
    count(s.id) FILTER (WHERE s.status = 'PENDING' AND now() > c.deadline_at) AS overdue_count,
    count(s.id) FILTER (WHERE s.status IN ('SUBMITTED', 'REVIEWING')) AS pending_review_count,
    count(s.id) FILTER (WHERE s.status = 'RETURNED') AS returned_count,
    count(s.id) FILTER (WHERE s.status IN ('APPROVED', 'ARCHIVED')) AS approved_count,
    round(
        100.0 * count(s.id) FILTER (WHERE s.first_submitted_at IS NOT NULL)
        / NULLIF(count(s.id), 0),
        2
    ) AS submission_rate
FROM monthly_cycles c
LEFT JOIN monthly_submissions s ON s.cycle_id = c.id
GROUP BY c.id, c.scope_org_id, c.cycle_year, c.cycle_month;

-- Built-in roles. Permission rows are seeded after API actions are finalized.
INSERT INTO roles (code, name, is_builtin) VALUES
    ('STUDENT', '学生', true),
    ('MENTOR', '导师', true),
    ('DEAN', '院长', true),
    ('ADMIN', '管理员', true);

COMMIT;
