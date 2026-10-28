import type { AnnualProgress, CompletionStatus } from "@yanji/contracts";
import { AppHeader } from "./app-header";

const statusLabels: Record<CompletionStatus, string> = {
  COMPLETE: "已完成",
  MISSED: "未完成",
  GRACE: "补交中",
  PENDING: "待提交",
  FUTURE: "未开始",
};

export function AnnualProgressTable({ data }: { data: AnnualProgress }) {
  const isDean = data.viewer.role === "DEAN";
  const role = isDean ? "院长" : "导师";
  const base = isDean ? "/dean" : "/mentor";
  return (
    <div className="product-shell">
      <AppHeader name={data.viewer.name} role={role} active="annual" />
      <main className="product-main annual-main">
        <section className="welcome-row teacher-heading">
          <div>
            <span className="eyebrow">全年追踪</span>
            <h1>{data.year}年度月报进度</h1>
            <p>
              {isDean
                ? "按导师查看全院学生12个月的完成情况。"
                : "一张表看清每位学生全年12个月的完成情况。"}
            </p>
          </div>
          <a className="secondary-button" href={base}>
            ← 返回月报工作台
          </a>
        </section>
        <div className="annual-legend">
          <span>
            <i className="progress-cell complete" />
            已完成
          </span>
          <span>
            <i className="progress-cell missed" />
            未完成
          </span>
          <span>
            <i className="progress-cell grace" />
            补交中
          </span>
          <span>
            <i className="progress-cell pending" />
            待提交
          </span>
          <span>
            <i className="progress-cell future" />
            未开始
          </span>
        </div>
        <p className="annual-action-tip">
          点击绿色月份，即可查看该学生当月提交的报告、提交时间和导师点评。
        </p>
        <section className="annual-table-card">
          <div className="responsive-table">
            <table className="annual-table">
              <thead>
                <tr>
                  <th className="sticky-name">学生</th>
                  {isDean ? <th>导师</th> : null}
                  {Array.from({ length: 12 }, (_, index) => (
                    <th key={index}>{index + 1}月</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.students.map((student) => (
                  <tr key={student.student_id}>
                    <td className="sticky-name">
                      <strong>{student.student_name}</strong>
                      <small>{student.student_no}</small>
                    </td>
                    {isDean ? <td>{student.mentor_name}</td> : null}
                    {student.months.map((item) => {
                      const canView = item.status === "COMPLETE";
                      const label = `${student.student_name}${item.month}月：${statusLabels[item.status]}`;
                      const content =
                        item.status === "COMPLETE"
                          ? "✓"
                          : item.status === "MISSED"
                            ? "!"
                            : "";
                      return (
                        <td key={item.month}>
                          {canView ? (
                            <a
                              className="progress-cell complete progress-link"
                              href={`${base}/history/${student.student_id}-${data.year}-${item.month}`}
                              title={`${label}，点击查看报告与点评`}
                              aria-label={`${label}，点击查看报告与点评`}
                            >
                              {content}
                            </a>
                          ) : (
                            <span
                              className={`progress-cell ${item.status.toLowerCase()}`}
                              title={label}
                              aria-label={label}
                            >
                              {content}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="annual-footnote">
          绿色表示已提交，可点击追溯报告与点评；红色表示超过补交时间仍未提交。
        </p>
      </main>
    </div>
  );
}
