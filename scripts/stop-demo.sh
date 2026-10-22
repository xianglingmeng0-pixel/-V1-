#!/usr/bin/env sh
set -eu

docker compose -f compose.demo.yml down
echo "研迹演示系统已停止。数据仍保存在Docker数据卷中。"
