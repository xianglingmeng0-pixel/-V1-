import { AppHeader } from "../../_components/app-header";
import { TeacherAccessManager } from "./teacher-access-manager";

export default function StudentTeachersPage() {
  return (
    <div className="product-shell">
      <AppHeader name="林晓雨" role="学生" active="teachers" />
      <main className="product-main narrow-main">
        <section className="welcome-row">
          <div>
            <span className="eyebrow">查看权限</span>
            <h1>我的老师</h1>
            <p>注册时填写默认导师，也可以继续添加其他老师查看自己的月报。</p>
          </div>
        </section>
        <section className="simple-card access-manager">
          <TeacherAccessManager />
        </section>
      </main>
    </div>
  );
}
