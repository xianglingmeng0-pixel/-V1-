# 贡献指南

感谢参与112研迹平台建设。

## 开发流程

1. 从 `main` 创建功能分支。
2. 每个提交只处理一个清晰问题。
3. 修改接口时同步更新共享契约和OpenAPI文档。
4. 修改数据库时新增迁移，不修改已经发布的迁移。
5. 提交前运行 `pnpm check`。

## 提交信息

推荐使用 Conventional Commits：

```text
feat(submission): add monthly report version endpoint
fix(notification): prevent duplicate T-7 reminder
docs(api): clarify optimistic locking
```

涉及身份认证、数据范围、文件访问、审核状态或通知投递的变更，需要在PR中说明安全影响和回滚方法。
