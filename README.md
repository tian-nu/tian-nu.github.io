# 天努的博客 — 项目说明与上线手册

基于 **Hugo + Stack 主题** 的个人博客。
- 预览版（备案前调试）：`http://42.194.151.133:8090/`（服务器上 `hugo server` 常驻）
- 正式域名：`nusky.cn`（ICP 备案中）
- 目标架构：**服务器主站（Nginx） + GitHub Pages 镜像/边缘内容**

---

## 博客历史与迁移

- 旧站：`tian-nu.github.io`（2024 年用 Jekyll 手搭的「天努的博客」），目前仍在 `https://nusky.cn` 在线
- 已迁移：2 篇文章（Hello World、Jekyll 搭建教程）与关于页信息已迁入本仓库
- 换代：新站（Hugo）push 到 `tian-nu.github.io` 后将接管 `nusky.cn`；旧 Jekyll 源码保留在仓库历史中
- 旧站规划中的待办功能 → 新站功能待办：
  - [ ] Giscus 评论（GitHub Discussions）
  - [ ] 日记页（时间线 + 心情/天气标记）
  - [ ] 备忘录（本地存储待办）
  - [ ] 留言板
  - [ ] 访问统计（文章数/标签数/运行天数）

---

## 看预览版（需要先放行端口）

预览服务运行在：**http://42.194.151.133:8090/**

首次打不开时，去腾讯云放行端口：
控制台 → 云服务器 CVM → 实例 → 安全组 → 入站规则 → 添加规则：
- 协议端口：`TCP:8090`
- 来源：`0.0.0.0/0`（或你常用的固定 IP，更安全）
- 策略：允许

保存后立即生效，刷新浏览器即可。

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

## 网页后台写作（Decap CMS）

新站内置网页后台，上线后可免命令行写文章：

1. 打开 `https://nusky.cn/admin/`，用 GitHub 账号登录（OAuth）
2. 左侧「文章」→ 新建 → 填标题/正文/标签 → 发布
3. 保存即自动 commit 并触发 GitHub Actions 重新构建部署

启用步骤（需要你操作一次，约 3 分钟）：
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
   - Homepage URL: `https://nusky.cn/`
   - Authorization callback URL: `https://nusky.cn/`
2. 把生成的 Client ID 发我，我填进 `static/admin/config.yml`
3. 上线后直接访问 `https://nusky.cn/admin/` 登录使用

备选：不装后台也能在 GitHub 网页直接编辑 md 文件（每次保存自动重新构建）。

## 首次上线步骤（GitHub Pages 先行，无需等备案）

部署目标仓库是 **`tian-nu/tian-nu.github.io`**（已有，自定义域名已绑定，历史含旧 Jekyll 站代码）：

1. 仓库 **Settings → Pages**：Source 选 `GitHub Actions`（关键一步）
2. 本仓库已配置 `.github/workflows/deploy.yml`：push 到 `main` 即自动构建并部署到 GitHub Pages
3. 等几分钟，`https://nusky.cn` 即为新版「天努的博客」
4. 服务器部署：备案通过后，在仓库 Secrets 配置 `SERVER_HOST / SERVER_USER / SSH_KEY` 自动启用

## DNS 记录表

| 阶段 | 类型 | 主机 | 值 | 说明 |
|---|---|---|---|---|
| 备案期 | A | `@` | `185.199.108.153 / 109 / 110 / 111`（4条） | GitHub Pages 四段 IP |
| 备案期 | AAAA | `@` | `2606:50c0:8000::153 / 8153 / 8353 / 8553`（4条） | IPv6（可选） |
| 备案期 | CNAME | `www` | `tian-nu.github.io` | www 转发 |
| 备案期 | TXT | `_github-pages-challenge-tian-nu` | GitHub 给的验证码 | 域名验证 |
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

> ⚠️ **权限说明**：以上 `sudo` 命令需要在服务器上用 root 执行。
> 当前自动化沙箱环境没有 root 权限（容器禁用了提权），无法代为安装 Nginx。
> 备案通过后，请通过腾讯云控制台「登录」或 SSH 登录服务器执行上述步骤。

## 上线验收清单（最终）

- [ ] 备案通过，`nusky.cn` 解析到服务器（`dig nusky.cn` 返回 `42.194.151.133`）
- [ ] `https://nusky.cn` 首页 200，标题为「Nusky 的小站」
- [ ] 文章页 / 关于 / 归档 / 搜索 全部 200
- [ ] HTTP 自动跳转 HTTPS（`curl -I http://nusky.cn` 返回 301）
- [ ] 证书有效（`curl -vI https://nusky.cn` 无证书告警）
- [ ] GitHub Pages 镜像/边缘内容子域名可访问
- [ ] 写一篇新文章 push 后：Pages 与服务器都更新（自动部署生效）
- [ ] 手机浏览器访问正常（响应式布局）

## 需要用户确认 / 操作（截至 2026-09-02）

- [x] GitHub 用户名：`tian-nu`
- [x] nusky.cn 的 DNS 服务商：腾讯云 DNSPod（NS: `*.dnspod.net`）
- [x] ICP 备案：已提交，进行中（2-3 周）
- [x] 8090 端口：安全组已验证外部可达
- [x] `tian-nu.github.io`：已绑定自定义域名 `nusky.cn`（旧 Jekyll 博客，将作为新站部署目标）
- [ ] DNS 补 2 条 A 记录：`185.199.108.153`、`185.199.109.153`
- [ ] GitHub 添加部署公钥（见上「首次上线步骤」）
- [ ] 仓库 Settings → Pages → Source 改为 `GitHub Actions`
- [ ] 预览版风格确认：`http://42.194.151.133:8090/`