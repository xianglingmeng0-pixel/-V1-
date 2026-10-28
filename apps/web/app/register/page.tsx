export default function RegisterPage() {
  return (
    <main className="registration-page">
      <a className="registration-brand" href="/login">
        <span className="brand-mark">研</span>
        <span>
          <strong>112研迹</strong>
          <small>学生账号注册</small>
        </span>
      </a>
      <section className="registration-card">
        <span className="eyebrow">首次使用</span>
        <h1>创建学生账号</h1>
        <p>填写本人信息，注册后系统会匹配你的默认导师。</p>
        <form action="/student" className="registration-form">
          <label htmlFor="student-name">姓名</label>
          <input
            id="student-name"
            name="studentName"
            defaultValue="林晓雨"
            placeholder="请输入真实姓名"
            required
          />

          <div className="registration-pair">
            <label>
              <span>导师姓名</span>
              <input
                name="mentorName"
                defaultValue="龚老师"
                placeholder="请输入导师姓名"
                required
              />
            </label>
            <label>
              <span>年级</span>
              <input
                name="grade"
                list="grade-options"
                defaultValue="研二"
                placeholder="如：大三、研二"
                required
              />
              <datalist id="grade-options">
                <option value="大一" />
                <option value="大二" />
                <option value="大三" />
                <option value="大四" />
                <option value="研一" />
                <option value="研二" />
                <option value="研三" />
                <option value="博一" />
                <option value="博二" />
                <option value="博三" />
                <option value="博四" />
              </datalist>
            </label>
          </div>

          <label htmlFor="register-phone">手机号</label>
          <div className="phone-field">
            <span>+86</span>
            <input
              id="register-phone"
              name="phone"
              inputMode="tel"
              defaultValue="138 0000 2026"
              placeholder="请输入手机号"
              required
            />
          </div>
          <div className="code-field">
            <input
              name="code"
              aria-label="验证码"
              defaultValue="2026"
              placeholder="请输入验证码"
              required
            />
            <button type="button">获取验证码</button>
          </div>
          <button className="login-primary" type="submit">
            注册并进入112研迹
          </button>
        </form>
        <p className="grade-update-note">
          年级信息将在每年暑假结束后由系统统一更新。
        </p>
        <a className="back-to-login" href="/login">
          已有账号，返回登录
        </a>
      </section>
    </main>
  );
}
