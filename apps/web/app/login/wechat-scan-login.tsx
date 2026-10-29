"use client";

import { useEffect, useState } from "react";

export function WechatScanLogin() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        className="wechat-login"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        <span>微</span> 使用微信扫码登录
      </button>

      {isOpen ? (
        <div
          className="wechat-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsOpen(false);
          }}
        >
          <section
            className="wechat-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wechat-modal-title"
          >
            <button
              className="wechat-modal-close"
              type="button"
              aria-label="关闭微信扫码登录"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <span className="wechat-modal-icon">微</span>
            <h3 id="wechat-modal-title">微信扫码登录</h3>
            <p>请使用微信扫一扫，扫码后在手机上确认登录</p>
            <div className="wechat-qr-frame">
              <img
                src="/wechat-login-qr.svg"
                width="198"
                height="198"
                alt="112研迹微信登录二维码"
              />
            </div>
            <small>二维码仅用于本次演示</small>
          </section>
        </div>
      ) : null}
    </>
  );
}
