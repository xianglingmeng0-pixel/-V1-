# 研迹 Yanji

轻量的学生月度成果提交与导师查看平台。系统围绕“每月提交一次—导师及时查看—学院全年追踪—逾期自动提醒”建立闭环。

## 当前进度

当前是V2客户试用版，已经包含：

- 学生、导师、院长三个可见端；
- 手机号/微信登录界面与公开公告；
- 图片、Word、PDF、PPT月报上传界面；
- 导师查看即读、纯文字评论，不评分、不退回；
- 6名学生×12个月年度进度表；
- 院长全院查看视角，管理员界面隐藏；
- 每月30日截止、24小时补交和短信提醒入队规则；
- NestJS API与健康检查；
- PostgreSQL数据库结构和三角色演示数据；
- Redis与MinIO本地基础设施；
- 共享Zod接口契约；
- CI、Dependabot和安全说明。

真实微信、短信供应商和生产对象存储需要在客户提供凭证后接入。演示模式不可直接用于生产。

## 技术栈

- Node.js 24 LTS
- pnpm 11
- Next.js 16.4 / React 19.3
- NestJS 11
- PostgreSQL 17
- Redis 8
- MinIO（S3兼容对象存储）
- TypeScript / Zod / Vitest

## 本地启动

要求：Node.js 24、pnpm 11+、Docker与Docker Compose。

如果只需要查看交付演示，直接阅读 [START_HERE.md](START_HERE.md)，使用一键Docker启动，不需要单独安装Node.js和pnpm。

```bash
cp .env.example .env
pnpm install
pnpm infra:up
pnpm dev
```

打开：

- 登录页：<http://localhost:3000/login>
- 学生端：<http://localhost:3000/student>
- 导师端：<http://localhost:3000/mentor>
- 院长端：<http://localhost:3000/dean>
- API健康检查：<http://localhost:3001/health>
- MinIO控制台：<http://localhost:9001>

演示环境默认启用 `DEMO_AUTH_ENABLED=true`。这只用于本地开发，生产部署必须关闭并接入真实手机号/微信认证。

## 发布临时演示网址

源代码仓库连接Vercel后，将项目的 **Root Directory** 设置为 `apps/web`，其余配置由 `apps/web/vercel.json`提供。Vercel环境会自动使用内置演示数据，不依赖本地Docker、数据库或API。

[一键导入Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fxianglingmeng0-pixel%2F-V1-%2F&root-directory=apps%2Fweb)

这个网址用于客户查看流程与界面；文件、评论和登录信息不会永久保存。

## 常用命令

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm check
pnpm infra:logs
pnpm infra:down
```

## 仓库结构

```text
apps/
  api/                 NestJS API
  web/                 Next.js Web端
packages/
  contracts/           前后端共享接口契约
infra/
  postgres/init/       数据库结构与开发种子数据
  docker-compose.yml   本地基础设施
docs/                  架构、数据库和接口文档
```

## 安全提醒

- 不要提交 `.env`、密钥、短信配置或微信AppSecret。
- 演示认证不得用于生产环境。
- 生产文件桶必须为私有，只通过短时签名URL访问。
- 生产环境上线前需完成依赖审计、权限测试、备份恢复演练和隐私评估。

## 开源协议

Apache License 2.0。详见 [LICENSE](LICENSE)。
