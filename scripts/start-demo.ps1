$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "未找到 Docker。请先安装并启动 Docker Desktop："
    Write-Host "https://www.docker.com/products/docker-desktop/"
    exit 1
}

docker compose version | Out-Null
docker compose -f compose.demo.yml up --build -d

Write-Host ""
Write-Host "研迹演示系统正在启动。首次构建通常需要几分钟。"
Write-Host "查看状态：docker compose -f compose.demo.yml ps"
Write-Host "查看日志：docker compose -f compose.demo.yml logs -f"
Write-Host "登录页：http://localhost:3000/login"
Write-Host "学生端：http://localhost:3000/student"
Write-Host "导师端：http://localhost:3000/mentor"
Write-Host "院长端：http://localhost:3000/dean"
Write-Host "停止系统：docker compose -f compose.demo.yml down"
