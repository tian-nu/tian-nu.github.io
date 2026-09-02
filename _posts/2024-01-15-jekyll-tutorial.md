---
title: "Jekyll 博客搭建教程"
date: 2024-01-15 14:30:00 +0800
categories: [技术]
tags: [Jekyll, 博客, 教程, GitHub]
excerpt: "详细介绍如何使用 Jekyll 和 GitHub Pages 搭建个人博客网站。"
---

## 什么是 Jekyll？

Jekyll 是一个静态网站生成器，它可以将 Markdown 文件转换为静态 HTML 页面。使用 Jekyll 搭建博客有很多优点：

- **免费托管**：可以直接部署到 GitHub Pages
- **Markdown 支持**：使用 Markdown 编写文章
- **主题丰富**：有大量现成的主题可用
- **插件扩展**：支持各种插件扩展功能

## 快速开始

### 1. 安装 Jekyll

```bash
gem install bundler jekyll
```

### 2. 创建新博客

```bash
jekyll new my-blog
cd my-blog
```

### 3. 本地预览

```bash
bundle exec jekyll serve
```

### 4. 部署到 GitHub Pages

将代码推送到 GitHub 仓库，启用 GitHub Pages 即可。

## 目录结构

```
my-blog/
├── _config.yml          # 配置文件
├── _layouts/            # 布局模板
├── _includes/           # 包含文件
├── _posts/              # 博客文章
├── _sass/               # Sass 样式
├── assets/              # 静态资源
└── index.md             # 首页
```

## 总结

Jekyll 是一个功能强大且易于使用的静态网站生成器，非常适合搭建个人博客。希望这篇教程对你有帮助！
