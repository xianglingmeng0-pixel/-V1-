# 从这里开始：研迹 V2 客户试用版

## 这版已经改成什么样

这版只保留三个可见角色，页面中没有管理员入口：

- 学生：手机号或微信入口、查看公告、提交月度成果、管理其他老师的查看权限；
- 导师：查看自己的学生月报、查看即变绿、发表文字评论、查看年度进度表；
- 院长：功能与导师一致，但可以查看全院导师和学生。

核心规则：每月30日23:59截止；2月按实际月末截止。未提交学生在截止后收到短信提醒，并获得24小时补交时间，超过补交时间记为未完成。

## 最简单的启动方法

只需要先安装并启动 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，不需要单独安装数据库或Node.js。

1. 解压 `yanji-platform-v2-demo.zip`；
2. 打开解压后的 `yanji-platform`文件夹；
3. 按操作系统运行下面的命令。

macOS或Linux：

```bash
./scripts/start-demo.sh
```

Windows PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-demo.ps1
```

第一次会下载运行环境并构建程序，一般需要几分钟。完成后打开：

- 登录页：<http://localhost:3000/login>
- 学生端：<http://localhost:3000/student>
- 导师端：<http://localhost:3000/mentor>
- 导师年度进度：<http://localhost:3000/mentor/annual>
- 院长端：<http://localhost:3000/dean>
- 院长年度进度：<http://localhost:3000/dean/annual>

登录页底部提供“导师端”和“院长端”客户演示入口。演示数据包含龚老师、张院长和6名学生。

## 试用时重点看什么

1. 学生登录页左侧直接展示通知公告；
2. 学生首页只突出当月报告和截止时间；
3. 上传页支持选择图片、Word、PDF、PPT；
4. 导师工作台中，红色代表“已提交、未查看”，绿色代表“已经查看”；
5. 点击“查看报告”后会自动记录已查看，无需老师额外操作；
6. 评论只有文字，不评分、不退回；
7. 年度进度页用绿色、红色、橙色、灰色展示12个月情况；
8. 院长端可以看到所有导师对应的学生。

## 停止、查看日志和重置

停止系统并保留数据：

```bash
./scripts/stop-demo.sh
```

查看运行状态：

```bash
docker compose -f compose.demo.yml ps
```

查看日志：

```bash
docker compose -f compose.demo.yml logs -f
```

完全清除演示数据并重新初始化：

```bash
docker compose -f compose.demo.yml down -v
docker compose -f compose.demo.yml up --build -d
```

`down -v`会删除当前演示数据，只在确认无需保留时使用。

## 目前哪些是演示，哪些已做好底层设计

这份包可直接用于客户确认流程和界面，但不能直接用于学校生产上线。

已经可运行或已落库：

- 三端页面与年度进度矩阵；
- 查看即读的数据库记录和接口；
- 导师文字评论接口；
- 额外老师只读授权的数据模型；
- 30日截止、24小时补交和逾期状态计算；
- 短信提醒任务的去重入队逻辑；
- PostgreSQL、Redis、MinIO本地环境。

仍需学校或客户提供外部条件后才能真实启用：

- 微信登录：微信应用的 AppID、AppSecret 和回调域名；
- 手机登录及短信：短信服务商账号、签名、模板和密钥；
- 文件永久保存：生产对象存储地址、访问策略和病毒扫描方案；
- 学校数据：学生、导师、院长名单及默认师生匹配表；
- 上线环境：域名、HTTPS证书、服务器、备份与隐私合规要求。

当前登录验证码、微信按钮和文件提交成功提示用于客户试用；接入上述真实服务前，不应把演示身份模式用于生产环境。

## 常见问题

### 网页打不开

先执行 `docker compose -f compose.demo.yml ps`。如果API仍在启动，等待其状态变为 `healthy`后刷新。

### 3000端口被占用

把 `compose.demo.yml`中Web服务端口改成：

```yaml
ports:
  - "8080:3000"
```

然后访问 <http://localhost:8080>。

### 修改数据库脚本后页面数据没有更新

初始化脚本只在第一次创建数据库时执行。使用“完全清除演示数据并重新初始化”的两条命令。
