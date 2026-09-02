# Nusky 的小站 — 项目说明与上线手册

基于 **Hugo + Stack 主题** 的个人博客。
- 预览版（备案前调试）：`http://42.194.151.133:8090/`（服务器上 `hugo server` 常驻）
- 正式域名：`nusky.cn`（ICP 备案中）
- 目标架构：**服务器主站（Nginx） + GitHub Pages 镜像/边缘内容**

---

## 目录结构

```
blog/
├── config/
│   ├── _default/          # 默认（预览/开发）配置；已含主题、语言、参数
│   └── production/        # 生产配置：baseURL=https://nusky.cn/
├── content/
│   ├── post/              # 博客文章（index.zh.md 中文 / index.en.md 英文）
│   └── page/              # 关于/归档/搜索/链接
├── static/CNAME           # 让 GitHub Pages 识别自定义域名
├── themes/stack/          # Hugo 主题（已随仓库提交）
└── .github/workflows/     # push 后自动：构建 -> GitHub Pages + 服务器
```

## 写一篇文章

```bash
mkdir -p content/post/my-post
vim content/post/my-post/index.zh.md   # 中文版
vim content/post/my-post/index.en.md   # 英文版（可选）
```

front matter 模板：

```yaml
---
title: "文章标题"
description: "摘要"
slug: my-post            # 建议写英文 slug，URL 更干净
date: 2026-09-02T10:00:00+08:00
tags: ["标签"]
categories: ["分类"]
---
正文 Markdown……
```

写完 `git add -A && git commit -m "新文章" && git push`，GitHub Actions 自动构建并双端部署。

## 首次上线步骤（GitHub Pages 先行，无需等备案）

1. 在 GitHub 建仓库（如 `nusky-blog`），然后把本目录推上去：
   ```bash
   git remote add origin git@github.com:<你的用户名>/nusky-blog.git
   git push -u origin main
   ```
2. 仓库 **Settings → Pages**：Source 选 `GitHub Actions`；Custom domain 填 `nusky.cn`，保存后按提示把 TXT 验证记录加到 DNS。
3. 在 DNS 服务商配置下表的「备案期」记录。
4. 等几分钟，`https://nusky.cn` 即可访问 GitHub Pages 版。

## DNS 记录表

| 阶段 | 类型 | 主机 | 值 | 说明 |
|---|---|---|---|---|
| 备案期 | A | `@` | `185.199.108.153 / 109 / 110 / 111`（4条） | GitHub Pages 四段 IP |
| 备案期 | AAAA | `@` | `2606:50c0:8000::153 / 8153 / 8353 / 8553`（4条） | IPv6（可选） |
| 备案期 | CNAME | `www` | `<你的用户名>.github.io` | www 转发 |
| 备案期 | TXT | `_github-pages-challenge-<用户名>` | GitHub 给的验证码 | 域名验证 |
| 备案通过后 | A | `@` | `42.194.151.133` | 切回服务器主站 |
| 备案通过后 | CNAME | `www` | `42.194.151.133`（或 A 记录） | www -> 服务器 |
| 备案通过后 | A | `lab` | `42.194.151.133` | 服务器子域名（边缘内容用） |

## 备案（2~3 周，腾讯云控制台完成，无需动服务器）

- 入口：腾讯云官网 → **备案**（或「腾讯云助手」小程序）
- 材料：① 主办人身份证正反面照片；② nusky.cn 域名**实名认证**（若注册商不是腾讯云，先去注册商处实名）
- 网站名称建议：「Nusky的个人站」（个人备案，名称不要带"公司/商城/博客"等受限词）
- 提交后：管局会发**短信核验**，24 小时内点击链接验证
- 备案期间站点照常运行在 GitHub Pages 上，不受影响

## 备案通过后切换服务器主站

```bash
# 在服务器上（首次）
sudo apt update && sudo apt install -y nginx
sudo mkdir -p /var/www/nusky.cn
# 部署参考：GitHub Actions 已含 ssh-deploy 步骤；
# 在仓库 Settings -> Secrets 配置 SERVER_HOST=42.194.151.133 / SERVER_USER / SSH_KEY
sudo cp config/nginx-site.conf /etc/nginx/sites-available/nusky.cn
sudo ln -s /etc/nginx/sites-available/nusky.cn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# HTTPS（certbot）
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nusky.cn -d www.nusky.cn
```

然后按上表把 DNS 的 `@`/`www` 切到服务器，GitHub Pages 移到 `lab.nusky.cn` 放边缘内容。
最后验收：浏览器打开 `https://nusky.cn`。

## 需要用户提供 / 确认

- [ ] GitHub 用户名（用于仓库名、Pages 域名、社交链接）
- [ ] nusky.cn 的 DNS 服务商（腾讯云 DNSPod / 阿里云 / 其他？）及解析权限
- [ ] 腾讯云备案入口确认（登录后开始提交）
- [ ] 预览版看后：风格是否 OK（换主题/配色/栏目）