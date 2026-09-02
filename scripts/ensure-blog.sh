#!/usr/bin/env bash
# 确保 Hugo 预览服务常驻（break the none-blocking review flow）
# 用法：
#   手动运行：  bash scripts/ensure-blog.sh
#   开机自启（在有 root 权限的终端执行一次）：
#     (crontab -l 2>/dev/null; echo "@reboot /home/ubuntu/work/tempproject/blog/scripts/ensure-blog.sh") | crontab -

BLOG_DIR="/home/ubuntu/work/tempproject/blog"
HUGO_BIN="/home/ubuntu/work/tempproject/bin/hugo"
PORT="${PORT:-8090}"
IP="${IP:-42.194.151.133}"
LOG="/home/ubuntu/work/tempproject/hugo-server.log"

if pgrep -x hugo > /dev/null 2>&1; then
    echo "[$(date '+%F %T')] hugo server 已在运行 (端口 $PORT)"
    exit 0
fi

echo "[$(date '+%F %T')] 正在启动 hugo server (端口 $PORT)..."
nohup "$HUGO_BIN" server --source "$BLOG_DIR" --bind 0.0.0.0 --port "$PORT" \
    --baseURL "http://$IP:$PORT/" --disableFastRender >> "$LOG" 2>&1 &

sleep 2
if curl -s -o /dev/null "http://127.0.0.1:$PORT/"; then
    echo "[$(date '+%F %T')] 启动成功: http://$IP:$PORT/"
else
    echo "[$(date '+%F %T')] 启动失败，请查看日志: $LOG"
    exit 1
fi