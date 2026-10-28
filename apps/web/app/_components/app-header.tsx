type Role = "学生" | "导师" | "院长";

export function AppHeader({
  name,
  role,
  active,
}: {
  name: string;
  role: Role;
  active: "report" | "teachers" | "monthly" | "annual";
}) {
  const isStudent = role === "学生";
  const base = role === "导师" ? "/mentor" : "/dean";
  return (
    <header className="product-header">
      <a className="brand" href={isStudent ? "/student" : base}>
        <span className="brand-mark">研</span>
        <span>
          <strong>112研迹</strong>
          <small>月度成果</small>
        </span>
      </a>
      <nav aria-label={`${role}导航`}>
        {isStudent ? (
          <>
            <a className={active === "report" ? "active" : ""} href="/student">
              本月月报
            </a>
            <a
              className={active === "teachers" ? "active" : ""}
              href="/student/teachers"
            >
              我的老师
            </a>
          </>
        ) : (
          <>
            <a className={active === "monthly" ? "active" : ""} href={base}>
              月报工作台
            </a>
            <a
              className={active === "annual" ? "active" : ""}
              href={`${base}/annual`}
            >
              年度进度
            </a>
          </>
        )}
      </nav>
      <div className="account">
        <span>
          <strong>{name}</strong>
          <small>{role}</small>
        </span>
        <span className="avatar">{name.slice(0, 1)}</span>
        <a className="quiet-link" href="/login">
          退出
        </a>
      </div>
    </header>
  );
}
