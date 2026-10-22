"use client";

import { FormEvent, useState } from "react";

export function ReportViewer({
  initialComment,
  submissionId,
  role,
}: {
  initialComment?: string;
  submissionId: number;
  role: "MENTOR" | "DEAN";
}) {
  const [comments, setComments] = useState(
    initialComment ? [initialComment] : ([] as string[]),
  );
  const [content, setContent] = useState("");

  const [sending, setSending] = useState(false);

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1"}/submissions/${submissionId}/comments?role=${role}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-demo-user-id": role === "DEAN" ? "4" : "2",
          },
          body: JSON.stringify({ content: trimmed }),
        },
      );
    } catch {
      // Keep the local demonstration responsive when its API is unavailable.
    }
    setComments([...comments, trimmed]);
    setContent("");
    setSending(false);
  }

  return (
    <section className="comment-section">
      <div className="card-heading">
        <div>
          <span className="eyebrow">交流</span>
          <h2>给学生的评论</h2>
        </div>
        <span className="no-score-label">无需打分</span>
      </div>
      {comments.length ? (
        <div className="comment-list">
          {comments.map((comment, index) => (
            <article key={`${comment}-${index}`}>
              <span className="person-avatar small">龚</span>
              <div>
                <strong>导师评论</strong>
                <p>{comment}</p>
                <small>刚刚</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-comment">
          还没有评论，可以给学生留下一句具体建议。
        </p>
      )}
      <form className="comment-form" onSubmit={addComment}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="写下建议或下一步方向，不需要评分……"
        />
        <button className="primary-button" type="submit">
          {sending ? "正在发表…" : "发表评论"}
        </button>
      </form>
    </section>
  );
}
