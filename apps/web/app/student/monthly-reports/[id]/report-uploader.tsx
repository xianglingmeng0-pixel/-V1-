"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type SelectedFile = { name: string; size: number };

export function ReportUploader() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    setFiles(
      Array.from(event.target.files ?? []).map((file) => ({
        name: file.name,
        size: file.size,
      })),
    );
    setSubmitted(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (files.length) setSubmitted(true);
  }

  return (
    <form className="upload-form" onSubmit={submit}>
      <label className={`drop-zone ${files.length ? "has-files" : ""}`}>
        <span className="upload-symbol">＋</span>
        <strong>{files.length ? "继续添加文件" : "选择或拖入月报文件"}</strong>
        <p>图片、Word、PDF、PPT均可，单个文件不超过100MB</p>
        <input
          type="file"
          multiple
          accept="image/*,.doc,.docx,.pdf,.ppt,.pptx"
          onChange={selectFiles}
        />
      </label>
      {files.length ? (
        <div className="selected-files">
          {files.map((file) => (
            <article key={`${file.name}-${file.size}`}>
              <span className="file-icon">文</span>
              <div>
                <strong>{file.name}</strong>
                <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
              </div>
              <span className="file-ready">已就绪</span>
            </article>
          ))}
        </div>
      ) : null}
      <label className="report-note-field">
        本月说明（选填）
        <textarea
          rows={4}
          placeholder="可以简单说明本月完成的工作，导师也可直接查看附件。"
        />
      </label>
      <label className="confirm-row">
        <input type="checkbox" required />
        我确认以上文件为本月成果，提交后导师即可查看
      </label>
      <button
        className="primary-button submit-button"
        type="submit"
        disabled={!files.length}
      >
        确认提交本月成果
      </button>
      {submitted ? (
        <div className="submission-success" role="status">
          <span>✓</span>
          <div>
            <strong>提交成功</strong>
            <p>龚老师现在可以查看你的月报。</p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
