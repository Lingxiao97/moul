# 知识库管理平台

一个现代化的后台知识库管理系统，基于 Next.js 14 构建。

## 功能特性

- ✅ 知识条目的创建、编辑、删除
- ✅ 全文搜索功能
- ✅ 分类管理
- ✅ 标签支持
- ✅ 响应式设计
- ✅ 现代化的 UI 界面

## 技术栈

- **前端框架**: Next.js 14 (React 18)
- **样式**: Tailwind CSS
- **数据库**: SQLite (better-sqlite3)
- **图标**: Lucide React
- **日期处理**: date-fns

## 快速开始

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── knowledge/     # 知识条目 API
│   │   └── categories/    # 分类 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── KnowledgeList.tsx  # 知识条目列表
│   ├── KnowledgeForm.tsx  # 知识条目表单
│   ├── SearchBar.tsx      # 搜索栏
│   └── CategoryFilter.tsx # 分类筛选器
├── lib/                   # 工具库
│   └── db.ts             # 数据库操作
└── data/                  # 数据目录（自动创建）
    └── knowledge_base.db  # SQLite 数据库
```

## API 接口

### 获取知识条目

```
GET /api/knowledge
GET /api/knowledge?keyword=搜索关键词
GET /api/knowledge?category=分类名称
```

### 获取单个知识条目

```
GET /api/knowledge/[id]
```

### 创建知识条目

```
POST /api/knowledge
Body: { title, content, category?, tags?, author? }
```

### 更新知识条目

```
PUT /api/knowledge/[id]
Body: { title?, content?, category?, tags?, author? }
```

### 删除知识条目

```
DELETE /api/knowledge/[id]
```

### 获取所有分类

```
GET /api/categories
```

## 使用说明

1. **创建知识条目**: 点击"新建知识条目"按钮，填写标题和内容（必填），可选择填写分类、标签和作者
2. **编辑知识条目**: 点击知识条目卡片右上角的编辑图标
3. **删除知识条目**: 点击知识条目卡片右上角的删除图标
4. **搜索**: 在搜索栏输入关键词进行全文搜索
5. **筛选**: 使用分类下拉菜单筛选特定分类的知识条目

## 数据库

系统使用 SQLite 数据库存储数据，数据库文件位于 `data/knowledge_base.db`。首次运行时会自动创建数据库和表结构。

## 许可证

MIT
