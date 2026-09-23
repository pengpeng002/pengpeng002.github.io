# pengpeng002.github.io

个人博客，Jekyll 静态站点，部署在 GitHub Pages。
左中右三栏：左边是头像 / 简介 / 导航，中间是文章列表或正文，右边是最近更新和标签云。
该Md存在部分AI生成。

---

## 目录结构

```
_config.yml            站点配置（标题、作者、导航、社交链接、permalink…）
index.html             首页，用 layout: home 渲染文章列表
about.md / categories.html / tags.html / archives.html / search.html / 404.html
search.json            构建时生成的搜索索引，供客户端搜索用
_posts/                文章，文件名必须是 YYYY-MM-DD-标题.md
assets/
  css/main.css         布局与配色
  css/syntax.css       代码高亮（rouge 的 class）
  js/main.js           移动端抽屉 / 回到顶部 / 搜索
  img/                 头像、favicon
  posts/               文章里用到的图片
_includes/             可复用片段（head / sidebar / topbar / right-panel / post-card / icon / footer / scripts）
_layouts/              default / home / post / page
```

---

## 写一篇新文章

在 `_posts/` 下新建 `YYYY-MM-DD-标题.md`，开头写：

```yaml
---
title: "文章标题"
date: 2026-09-24 12:00:00
description: "一句话摘要，会显示在列表卡片和搜索描述里"
tags: [标签A, 标签B]
category: ["分类名"]
---
```

- `title` 和 `date` 是必需的，其余可省。
- `tags` 决定右侧标签云；`category` 决定「分类」页的分组。
- 想置顶某篇，加 `pinned: true`；想在卡片右侧显示缩略图，加 `image: /assets/posts/xxx.png`。

### 插入图片

图片放在 `assets/posts/`，正文里用**绝对路径**引用：

```markdown
![说明](/assets/posts/1_1.png)
```

---

## 改站点信息

| 想改什么 | 改哪里 |
| --- | --- |
| 站点标题 / 副标题 | `_config.yml` 的 `title` / `tagline` |
| 头像 | 换掉 `assets/img/avatar.svg`，或改 `author.avatar` 指向新文件 |
| 昵称、简介 | `_config.yml` 的 `author.name` / `author.bio` |
| 左侧导航项 | `_config.yml` 的 `nav`（图标名见 `_includes/icon.html`） |
| 社交链接 | `_config.yml` 的 `social`，留空则隐藏 |
| 右侧栏显示条数 | `_config.yml` 的 `panel.recent_count` / `panel.tag_limit` |
| 配色 | `assets/css/main.css` 顶部的 CSS 变量 |

配色跟随系统深浅色自动切换（`prefers-color-scheme`）。

