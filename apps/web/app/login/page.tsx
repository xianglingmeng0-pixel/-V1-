import { WechatScanLogin } from "./wechat-scan-login";

const notices = [
  {
    date: "10-28",
    title: "本月成果提交提醒",
    content: "请于本月30日24:00前提交月度成果，逾期后保留24小时补交时间。",
  },
  {
    date: "10-24",
    title: "系统维护通知",
    content: "周六凌晨进行例行维护，不影响已上传的报告。",
  },
  {
    date: "10-20",
    title: "支持文件类型更新",
    content: "目前支持图片、Word、PDF和PPT文件。",
  },
];

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-notices">
        <div className="login-brand">
          <span className="brand-mark large">研</span>
          <div>
            <h1>112研迹</h1>
            <p>每月一次提交，导师及时看见</p>
          </div>
        </div>
        <div className="notice-title">
          <span>通知公告</span>
        </div>
        <div className="notice-cards">
          {notices.map((notice, index) => (
            <article
              key={notice.title}
              className={index === 0 ? "featured" : ""}
            >
              <time>{notice.date}</time>
              <div>
                <h2>{notice.title}</h2>
                <p>{notice.content}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow">学生登录</span>
          <h2>欢迎回来</h2>
          <p className="login-help">使用学校登记的手机号或微信快速登录</p>
          <form action="/student" className="phone-login">
            <label htmlFor="phone">手机号</label>
            <div className="phone-field">
              <span>+86</span>
              <input
                id="phone"
                name="phone"
                inputMode="tel"
                placeholder="请输入手机号"
                defaultValue="138 0000 2026"
              />
            </div>
            <div className="code-field">
              <input
                aria-label="验证码"
                placeholder="请输入验证码"
                defaultValue="2026"
              />
              <button type="button">获取验证码</button>
            </div>
            <button className="login-primary" type="submit">
              手机号登录
            </button>
          </form>
          <div className="or-divider">
            <span>或</span>
          </div>
          <WechatScanLogin />
          <a className="register-entry" href="/register">
            首次使用？注册学生账号
          </a>
          <p className="agreement">登录即表示同意112研迹用户协议与隐私政策</p>
        </div>
        <div className="demo-entrances" aria-label="演示入口">
          <span>客户演示入口</span>
          <a href="/mentor">导师端</a>
          <a href="/dean">院长端</a>
        </div>
      </section>
    </main>
  );
}
