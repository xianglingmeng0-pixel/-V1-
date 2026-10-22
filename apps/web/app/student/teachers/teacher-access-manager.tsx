"use client";

import { FormEvent, useState } from "react";

export function TeacherAccessManager() {
  const [teachers, setTeachers] = useState(["周老师"]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function addTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!teachers.includes(trimmed)) setTeachers([...teachers, trimmed]);
    setName("");
    setMessage(`已向${trimmed}开放月报查看权限`);
  }

  return (
    <>
      <div className="access-list">
        <article>
          <span className="person-avatar">龚</span>
          <div>
            <strong>龚老师</strong>
            <p>默认导师 · 机器学习与科学计算</p>
          </div>
          <span className="access-badge">查看并评论</span>
        </article>
        {teachers.map((teacher) => (
          <article key={teacher}>
            <span className="person-avatar secondary">
              {teacher.slice(0, 1)}
            </span>
            <div>
              <strong>{teacher}</strong>
              <p>你添加的老师</p>
            </div>
            <button
              type="button"
              className="text-button danger"
              onClick={() =>
                setTeachers(teachers.filter((item) => item !== teacher))
              }
            >
              移除权限
            </button>
          </article>
        ))}
      </div>
      <form className="add-teacher-form" onSubmit={addTeacher}>
        <label htmlFor="teacher-name">添加其他老师</label>
        <p>添加后，该老师可以查看你的月报，但不能替代默认导师。</p>
        <div>
          <input
            id="teacher-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="输入老师姓名或工号"
          />
          <button className="primary-button" type="submit">
            添加查看权限
          </button>
        </div>
        {message ? (
          <output className="success-message">{message}</output>
        ) : null}
      </form>
    </>
  );
}
