import { AppHeader } from "../../_components/app-header";

const teacherComments = [
  {
    id: "mentor",
    name: "龚老师",
    role: "默认导师",
    avatar: "龚",
    avatarClassName: "person-avatar",
    comments: [
      {
        month: "10月成果报告",
        content: "本月进展清晰，建议下一阶段继续补充实验对照结果。",
        time: "10月28日 09:20",
      },
      {
        month: "9月成果报告",
        content: "基础工作完成得比较扎实，下月重点整理关键参数和误差分析。",
        time: "9月29日 16:40",
      },
    ],
  },
  {
    id: "dean",
    name: "杜院长",
    role: "院长",
    avatar: "杜",
    avatarClassName: "person-avatar dean-avatar",
    comments: [
      {
        month: "10月成果报告",
        content: "请按计划推进研究工作，并及时沉淀阶段性成果。",
        time: "10月28日 14:10",
      },
      {
        month: "9月成果报告",
        content: "研究进度连续，建议后续进一步突出阶段成果的创新点。",
        time: "9月30日 10:15",
      },
    ],
  },
] as const;

export default function StudentCommentsPage() {
  return (
    <div className="product-shell">
      <AppHeader name="林晓雨" role="学生" active="teachers" />
      <main className="product-main narrow-main student-comments-main">
        <a className="back-link" href="/student">
          ← 返回学生首页
        </a>
        <section className="welcome-row">
          <div>
            <span className="eyebrow">我的老师</span>
            <h1>老师给我的评论</h1>
            <p>按老师查看每个月留下的建议，方便后续持续改进。</p>
          </div>
        </section>

        <div className="student-comment-groups">
          {teacherComments.map((teacher) => (
            <section
              className="simple-card student-comment-group"
              id={teacher.id}
              key={teacher.id}
            >
              <div className="student-comment-teacher">
                <span className={teacher.avatarClassName}>
                  {teacher.avatar}
                </span>
                <div>
                  <strong>{teacher.name}</strong>
                  <p>{teacher.role}</p>
                </div>
                <span>{teacher.comments.length}条评论</span>
              </div>
              <div className="student-comment-history">
                {teacher.comments.map((comment) => (
                  <article key={`${teacher.id}-${comment.month}`}>
                    <div>
                      <strong>{comment.month}</strong>
                      <time>{comment.time}</time>
                    </div>
                    <p>{comment.content}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
