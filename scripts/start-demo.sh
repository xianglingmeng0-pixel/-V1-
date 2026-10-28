#!/usr/bin/env sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "未找到 Docker。请先安装并启动 Docker Desktop："
  echo "https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "当前 Docker 未安装 Compose 插件，请升级 Docker Desktop。"
  exit 1
fi

docker compose -f compose.demo.yml up --build -d

echo ""
echo "112研迹演示系统正在启动。首次构建通常需要几分钟。"
echo "查看状态：docker compose -f compose.demo.yml ps"
echo "查看日志：docker compose -f compose.demo.yml logs -f"
echo "登录页：http://localhost:3000/login"
echo "学生端：http://localhost:3000/student"
echo "导师端：http://localhost:3000/mentor"
echo "院长端：http://localhost:3000/dean"
echo "停止系统：./scripts/stop-demo.sh"
