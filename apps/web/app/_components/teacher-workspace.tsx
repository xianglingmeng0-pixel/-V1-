import type { TeacherDashboard } from "@yanji/contracts";
import { AppHeader } from "./app-header";

const completionLabels: Record<string, string> = {
  COMPLETE: "已提交",
  MISSED: "未完成",
  GRACE: "补交中",
  PENDING: "待提交",
  FUTURE: "未开始",
};

function formatTime(value: string | null) {
  if (!value) return "尚未提交";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function TeacherWorkspace({ data }: { data: TeacherDashboard }) {
  const isDean = data.viewer.role === "DEAN";
  const role = isDean ? "院长" : "导师";
  const base = isDean ? "/dean" : "/mentor";
  return (
    <div className="product-shell">
      <AppHeader name={data.viewer.name} role={role} active="monthly" />
      <main className="product-main teacher-main">
        <section className="welcome-row teacher-heading">
          <div>
            <span className="eyebrow">
              {data.year}年 {data.month}月
            </span>
            <h1>{isDean ? "全院月报概览" : "学生月报工作台"}</h1>
            <p>
              {isDean
                ? "查看所有导师及其学生的月报进展。"
                : "红色表示学生已提交但你还没看，打开后自动变为绿色。"}
            </p>
          </div>
          <a className="secondary-button" href={`${base}/annual`}>
            查看年度进度表 <span>→</span>
          </a>
        </section>

        <section className="summary-grid">
          <article>
            <span>学生</span>
            <strong>{data.summary.student_count}</strong>
            <small>本月应提交</small>
          </article>
          <article>
            <span>已提交</span>
            <strong>{data.summary.submitted_count}</strong>
            <small>无需打分</small>
          </article>
          <article className="summary-alert">
            <span>待查看</span>
            <strong>{data.summary.unread_count}</strong>
            <small>红色项目</small>
          </article>
          <article>
            <span>未完成</span>
            <strong>{data.summary.missed_count}</strong>
            <small>超过补交时间</small>
          </article>
        </section>

        <section className="report-table-card">
          <div className="table-toolbar">
            <div>
              <h2>本月学生月报</h2>
              <p>点击已提交的报告即可查看，系统自动记录查看状态。</p>
            </div>
            <div className="legend-inline">
              <span>
                <i className="legend-dot unread" />
                已提交未查看
              </span>
              <span>
                <i className="legend-dot read" />
                已经查看
              </span>
            </div>
          </div>
          <div className="responsive-table">
            <table className="report-table">
              <thead>
                <tr>
                  <th>学生</th>
                  {isDean ? <th>导师</th> : null}
                  <th>提交情况</th>
                  {isDean ? <th>导师评论</th> : null}
                  <th>查看状态</th>
                  <th>{isDean ? "院长评论" : "导师评论"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.reports.map((report) => {
                  const submitted = report.completion_status === "COMPLETE";
                  const unread = submitted && report.read_status === "UNREAD";
                  return (
                    <tr
                      key={report.submission_id}
                      className={
                        unread
                          ? "report-unread"
                          : submitted
                            ? "report-read"
                            : ""
                      }
                    >
                      <td>
                        <div className="student-cell">
                          <span>{report.student_name.slice(0, 1)}</span>
                          <div>
                            <strong>{report.student_name}</strong>
                            <small>{report.student_no}</small>
                          </div>
                        </div>
                      </td>
                      {isDean ? <td>{report.mentor_name}</td> : null}
                      <td>
                        <span
                          className={`completion-tag completion-${report.completion_status.toLowerCase()}`}
                        >
                          {completionLabels[report.completion_status]}
                        </span>
                        <small className="submitted-time">
                          {formatTime(report.submitted_at)}
                        </small>
                      </td>
                      {isDean ? (
                        <td
                          className="mentor-comment-cell"
                          title={report.mentor_comment ?? undefined}
                        >
                          {report.mentor_comment ?? (
                            <span className="muted-text">暂无评论</span>
                          )}
                        </td>
                      ) : null}
                      <td>
                        {submitted ? (
                          <span
                            className={`read-tag ${unread ? "unread" : "read"}`}
                          >
                            {unread ? "未查看" : "已查看"}
                          </span>
                        ) : (
                          <span className="muted-text">—</span>
                        )}
                      </td>
                      <td>
                        {report.comment_count
                          ? `${report.comment_count}条`
                          : "—"}
                      </td>
                      <td>
                        {submitted ? (
                          <a
                            className="row-action"
                            href={`${base}/reports/${report.submission_id}`}
                          >
                            查看报告
                          </a>
                        ) : (
                          <span className="muted-text">等待学生</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
