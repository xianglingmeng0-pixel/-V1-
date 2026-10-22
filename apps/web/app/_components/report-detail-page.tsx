import type { TeacherDashboard } from "@yanji/contracts";
import { AppHeader } from "./app-header";
import { ReportViewer } from "./report-viewer";

export function ReportDetailPage({
  data,
  submissionId,
}: {
  data: TeacherDashboard;
  submissionId: number;
}) {
  const isDean = data.viewer.role === "DEAN";
  const report =
    data.reports.find((item) => item.submission_id === submissionId) ??
    data.reports.find((item) => item.submitted_at);
  const role = isDean ? "院长" : "导师";
  const base = isDean ? "/dean" : "/mentor";
  if (!report) return null;

  return (
    <div className="product-shell">
      <AppHeader name={data.viewer.name} role={role} active="monthly" />
      <main className="product-main report-detail-main">
        <a className="back-link" href={base}>
          ← 返回月报工作台
        </a>
        <section className="welcome-row report-detail-heading">
          <div>
            <span className="eyebrow">已打开 · 自动标记为已查看</span>
            <h1>
              {report.student_name}的{data.month}月成果报告
            </h1>
            <p>
              {report.student_no} · 默认导师 {report.mentor_name}
            </p>
          </div>
          <span className="read-confirmation">✓ 已查看</span>
        </section>
        <div className="report-detail-layout">
          <section className="simple-card document-preview">
            <div className="document-toolbar">
              <div>
                <span className="file-icon pdf">PDF</span>
                <div>
                  <strong>
                    {report.student_name}-{data.month}月科研进展.pdf
                  </strong>
                  <small>2.8 MB · 学生提交</small>
                </div>
              </div>
              <button type="button">下载原文件</button>
            </div>
            <div className="document-paper">
              <span>月度科研成果报告</span>
              <h2>多模态实验的基线模型复现与对比</h2>
              <p>
                本月完成了数据集清洗、三组基线模型复现与初步误差分析。主要实验结果已整理为表格，并补充了训练参数说明。
              </p>
              <h3>本月主要成果</h3>
              <ul>
                <li>完成数据预处理脚本与质量检查</li>
                <li>复现三种基线模型，结果与论文误差在可接受范围</li>
                <li>整理实验日志与下一阶段对照实验计划</li>
              </ul>
              <div className="paper-placeholder">
                <span>实验结果图表预览</span>
              </div>
            </div>
          </section>
          <aside className="simple-card comments-card">
            <ReportViewer
              submissionId={report.submission_id}
              role={data.viewer.role}
              initialComment={
                report.comment_count
                  ? "内容已查看，建议下月补充实验对照结果。"
                  : undefined
              }
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
