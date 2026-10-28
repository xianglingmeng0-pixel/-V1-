import { notFound } from "next/navigation";
import { createDemoHistoricalReport } from "../../lib/demo-data";
import { AppHeader } from "./app-header";

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export function HistoricalReportDetail({
  reportKey,
  viewerRole,
}: {
  reportKey: string;
  viewerRole: "MENTOR" | "DEAN";
}) {
  const [studentIdValue, yearValue, monthValue] = reportKey.split("-");
  const report = createDemoHistoricalReport(
    Number.parseInt(studentIdValue ?? "", 10),
    Number.parseInt(yearValue ?? "", 10),
    Number.parseInt(monthValue ?? "", 10),
  );
  if (!report) notFound();

  const completed = report.status === "COMPLETE";
  const isDean = viewerRole === "DEAN";
  const base = isDean ? "/dean" : "/mentor";
  const viewerName = isDean ? "张院长" : "龚老师";
  const viewerLabel = isDean ? "院长" : "导师";

  return (
    <div className="product-shell">
      <AppHeader name={viewerName} role={viewerLabel} active="annual" />
      <main className="product-main report-detail-main">
        <a className="back-link" href={`${base}/annual`}>
          ← 返回年度进度表
        </a>
        <section className="welcome-row report-detail-heading">
          <div>
            <span className="eyebrow">
              {isDean ? "全院历史月报" : "历史月报"} · {report.year}年度
            </span>
            <h1>
              {report.student.name}的{report.month}月成果报告
            </h1>
            <p>{report.student.studentNo} · 默认导师 龚老师</p>
            {completed ? (
              <div className="history-meta">
                <span>
                  提交时间：
                  <strong>{formatDateTime(report.submittedAt)}</strong>
                </span>
                <span>
                  导师查看时间：
                  <strong>{formatDateTime(report.reviewedAt)}</strong>
                </span>
              </div>
            ) : null}
          </div>
          <span
            className={
              completed ? "read-confirmation" : "state-pill state-missed"
            }
          >
            {completed ? "✓ 已完成并点评" : "未提交"}
          </span>
        </section>

        {completed ? (
          <div className="report-detail-layout">
            <section className="simple-card document-preview">
              <div className="document-toolbar">
                <div>
                  <span className="file-icon pdf">PDF</span>
                  <div>
                    <strong>{report.file.name}</strong>
                    <small>{report.file.size} · 历史提交文件</small>
                  </div>
                </div>
                <button type="button">查看原文件</button>
              </div>
              <div className="document-paper">
                <span>
                  {report.year}年{report.month}月科研成果报告
                </span>
                <h2>{report.title}</h2>
                <p>{report.summary}</p>
                <h3>本月主要成果</h3>
                <ul>
                  {report.achievements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>下月计划</h3>
                <p>{report.nextPlan}</p>
                <div className="paper-placeholder">
                  <span>当月实验结果与进度图表</span>
                </div>
              </div>
            </section>

            <aside className="simple-card comments-card">
              <div className="history-comment-heading">
                <span className="eyebrow">历史记录</span>
                <h2>导师点评</h2>
              </div>
              <p className="history-comment-summary">
                这里保留当月报告提交后形成的点评记录，方便后续按月追踪改进情况。
              </p>
              <div className="comment-list">
                {report.comments.map((comment) => (
                  <article key={`${comment.author}-${comment.createdAt}`}>
                    <span className="person-avatar small">
                      {comment.author.slice(0, 1)}
                    </span>
                    <div>
                      <strong>{comment.author}</strong>
                      <p>{comment.content}</p>
                      <small>{formatDateTime(comment.createdAt)}</small>
                    </div>
                  </article>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          <section className="simple-card history-empty-card">
            <div>
              <strong>该月未提交成果</strong>
              <p>没有可查看的报告文件，因此也没有形成导师点评记录。</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
