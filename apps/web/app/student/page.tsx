import { AppHeader } from "../_components/app-header";
import { getStudentDashboard } from "../../lib/api";

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    day: "numeric",
    timeZone: "Asia/Shanghai",
  })
    .format(new Date(value))
    .replace("日", "");
}

const statusText: Record<string, string> = {
  PENDING: "待提交",
  GRACE: "补交中",
  MISSED: "未完成",
  SUBMITTED: "已提交",
  SUBMITTED_LATE: "已补交",
  ARCHIVED: "已归档",
};

export default async function StudentPage() {
  const dashboard = await getStudentDashboard();
  const report = dashboard.current_report;
  return (
    <div className="product-shell">
      <AppHeader name={dashboard.user.name} role="学生" active="report" />
      <main className="product-main student-main">
        <section className="welcome-row">
          <div>
            <span className="eyebrow">学生月度成果</span>
            <h1>{dashboard.user.name}，本月只需完成这一件事</h1>
            <p>上传月度成果文件，提交后导师就能直接查看。</p>
          </div>
          <span className="student-number">{dashboard.user.user_no}</span>
        </section>

        {report ? (
          <section className="student-report-card">
            <div className="report-date-block">
              <small>本月截止</small>
              <strong>{formatDay(report.deadline_at)}</strong>
              <span>23:59</span>
            </div>
            <div className="report-copy">
              <div className="section-title-line">
                <h2>{report.title}</h2>
                <span
                  className={`state-pill state-${report.display_status.toLowerCase()}`}
                >
                  {statusText[report.display_status] ?? report.display_status}
                </span>
              </div>
              <p>支持图片、Word、PDF、PPT，可一次上传多个文件。</p>
              <div className="deadline-strip">
                <span>
                  <b>截止</b>
                  {formatDate(report.deadline_at)}
                </span>
                <span>
                  <b>补交</b>截止后24小时内
                </span>
                <span>
                  <b>导师</b>
                  {report.mentor.name}
                </span>
              </div>
            </div>
            <a
              className="primary-button"
              href={`/student/monthly-reports/${report.id}`}
            >
              {report.status === "PENDING"
                ? "上传并提交月报"
                : "查看已提交月报"}
              <span>→</span>
            </a>
          </section>
        ) : null}

        <div className="student-columns">
          <section className="simple-card process-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">提交规则</span>
                <h2>清晰的三步流程</h2>
              </div>
            </div>
            <ol className="simple-process">
              <li>
                <span>1</span>
                <div>
                  <strong>30日前提交</strong>
                  <p>上传月度成果文件并确认提交。</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>未提交会短信提醒</strong>
                  <p>截止时系统自动提醒，给你24小时补交。</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>导师查看并评论</strong>
                  <p>导师打开后状态会更新，可留下文字建议。</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="simple-card teacher-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">我的老师</span>
                <h2>报告查看权限</h2>
              </div>
              <a href="/student/teachers">管理</a>
            </div>
            <div className="teacher-person">
              <span className="person-avatar">龚</span>
              <div>
                <strong>{report?.mentor.name ?? "龚老师"}</strong>
                <p>{report?.mentor.professional_title} · 默认导师</p>
              </div>
              <span className="access-badge">可查看并评论</span>
            </div>
            <div className="additional-teacher-note">
              已授权 {report?.additional_teacher_count ?? 0} 位其他老师查看月报
            </div>
          </section>
        </div>

        <section className="simple-card announcement-panel">
          <div className="card-heading">
            <div>
              <span className="eyebrow">通知公告</span>
              <h2>近期消息</h2>
            </div>
          </div>
          <div className="announcement-rows">
            {dashboard.announcements.map((item) => (
              <article key={item.id}>
                <span className="announcement-dot" />
                <strong>{item.title}</strong>
                <time>
                  {item.publish_at ? formatDate(item.publish_at) : "刚刚"}
                </time>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
