import { notFound } from "next/navigation";
import { AppHeader } from "../../../_components/app-header";
import { getStudentDashboard } from "../../../../lib/api";
import { ReportUploader } from "./report-uploader";

export const dynamic = "force-dynamic";

function formatDeadline(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(value));
}

export default async function MonthlyReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, dashboard] = await Promise.all([
    params,
    getStudentDashboard(),
  ]);
  const report = dashboard.current_report;
  if (!report || String(report.id) !== id) notFound();

  return (
    <div className="product-shell">
      <AppHeader name={dashboard.user.name} role="学生" active="report" />
      <main className="product-main upload-page">
        <a className="back-link" href="/student">
          ← 返回本月月报
        </a>
        <section className="welcome-row upload-heading">
          <div>
            <span className="eyebrow">{report.title}</span>
            <h1>上传月度成果</h1>
            <p>无需填写复杂表单，把已有的成果文件提交即可。</p>
          </div>
          <div className="deadline-mini">
            <small>截止时间</small>
            <strong>{formatDeadline(report.deadline_at)}</strong>
          </div>
        </section>
        <div className="upload-layout">
          <section className="simple-card uploader-card">
            <ReportUploader />
          </section>
          <aside className="upload-aside">
            <section className="simple-card mentor-summary">
              <span className="person-avatar">龚</span>
              <div>
                <small>默认导师</small>
                <strong>{report.mentor.name}</strong>
                <p>{report.mentor.research_direction}</p>
              </div>
            </section>
            <section className="simple-card rule-note">
              <h2>补交说明</h2>
              <p>如果30日当天仍未提交，系统会发送短信提醒。</p>
              <p>提醒后有24小时补交时间，超过补交时间记为未完成。</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
