import { AppHeader } from "../_components/app-header";
import { getStudentDashboard } from "../../lib/api";

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
            <h1>{dashboard.user.name}</h1>
            <p>上传月度成果文件，提交后导师就能直接查看。</p>
          </div>
          <span className="student-number">
            {dashboard.user.user_no} · {dashboard.user.grade}
          </span>
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

        <div className="student-dashboard-grid">
          <section className="simple-card teacher-comments-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">我的老师</span>
                <h2>查看老师评论</h2>
              </div>
              <a className="add-teacher-link" href="/student/teachers">
                ＋ 添加老师
              </a>
            </div>
            <div className="teacher-comment-list">
              <article>
                <span className="person-avatar">龚</span>
                <div>
                  <div className="teacher-comment-meta">
                    <strong>{report?.mentor.name ?? "龚老师"}</strong>
                    <span>默认导师</span>
                  </div>
                  <p>查看龚老师给你的月报建议和历史评论。</p>
                  <a
                    className="view-comment-link"
                    href="/student/comments#mentor"
                  >
                    查看评论 <span>→</span>
                  </a>
                </div>
              </article>
              <article>
                <span className="person-avatar dean-avatar">杜</span>
                <div>
                  <div className="teacher-comment-meta">
                    <strong>杜院长</strong>
                    <span>院长</span>
                  </div>
                  <p>查看杜院长对你的研究进度留下的评论。</p>
                  <a
                    className="view-comment-link"
                    href="/student/comments#dean"
                  >
                    查看评论 <span>→</span>
                  </a>
                </div>
              </article>
            </div>
          </section>

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
        </div>
      </main>
    </div>
  );
}
