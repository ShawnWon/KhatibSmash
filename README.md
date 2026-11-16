# KhatibSmash - 乒乓球开球网风格积分赛系统 (Supabase + 静态 Web)

专为社区乒乓球俱乐部量身定制的**简化版开球网积分赛系统**。采用 **Supabase (云数据库/PostgreSQL + RESTful API)** 作为无服务器后端，前端为纯静态 **HTML5 + Vanilla JavaScript (ES Module) + Tailwind CSS**，可零成本部署在 GitHub Pages、Vercel、Cloudflare Pages 或 Netlify 上。

---

## 🌟 核心功能清单

1. **总积分榜 (Leaderboard)**:
   - 选手当前积分、历史最高积分、总参赛场次、胜场/负场、生涯胜率。
   - 前三甲领奖台卡片高亮与按姓名、打法风格实时搜索。
2. **赛事与对阵 (Tournaments)**:
   - **小组循环交叉矩阵对阵表 (Cross Matrix)**: 还原乒乓球经典的对阵矩阵，展示每对选手的大比分胜负与单局小分（如 `11-9, 8-11, 11-7`）。
   - **淘汰赛树状图 (Knockout Brackets)**: 半决赛、季军争夺战、冠亚军决赛的比分与进阶路径。
   - **最终排名与积分清算 (Rating Delta)**: 按照开球网/USATT动态积分增减规则，结算每位选手的赛前积分、变动值 ($\pm \Delta$) 及赛后新积分。
3. **选手个人档案 (Player Profile)**:
   - 基于 Chart.js 的积分演变历史曲线走势图。
   - 选手的胜率、打法风格、以及近期的所有交锋记录。
4. **两两历史交锋查询 (Head-to-Head / H2H)**:
   - 任意选择两位球友（选手 A vs 选手 B），实时计算总交手胜负比、单局局分详情与战绩走势条。

---

## 📂 项目结构

```
khatibsmash/
├── index.html            # 单页静态应用主入口 (带响应式导航与模态框)
├── css/
│   └── style.css         # 自定义样式 (深色玻璃质感、交叉对阵表矩阵等)
├── js/
│   ├── app.js            # 前端业务渲染主控制器 (SPA 路由与交互)
│   ├── db.js             # Supabase 客户端与数据访问层 (双模式: 线上/本地)
│   └── rating.js         # 开球网 / USATT 积分计算算法核心
├── sql/
│   └── schema.sql        # Supabase 数据库建表 DDL 与 RLS 安全策略
├── data/
│   └── mock_data.json    # 本地演示数据 (无 Supabase 配置时即开即用)
└── README.md
```

---

## 🚀 快速上手与 Supabase 配置

### 1. 本地直接预览
由于是纯静态项目，您可以直接使用任何本地静态服务器打开 `index.html`（例如 VS Code Live Server，或直接双击网页查看演示数据）。

### 2. 连接您的 Supabase 项目
1. 注册并登录 [Supabase](https://supabase.com/)，创建一个新项目。
2. 进入项目的 **SQL Editor**，将 [`sql/schema.sql`](file:///c:/repo/khatibsmash/sql/schema.sql) 中的所有 SQL 语句复制并执行（一键创建 `players`, `tournaments`, `matches`, `rating_history` 表及只读 RLS 策略）。
3. 在 Supabase **Project Settings -> API** 中复制：
   - **Project URL**
   - **anon / public key**
4. 打开网页，点击右上角的 **数据源设置** (齿轮图标)，粘贴 URL 和 Key 并保存。系统将无缝切换至您的真实 Supabase 云端数据库！

---

## 🌐 静态托管部署建议

- **GitHub Pages**: 将本仓库代码推送到 GitHub，在仓库 `Settings -> Pages` 选择从 main 分支发布即可。
- **Cloudflare Pages / Vercel**: 导入 Git 仓库，构建命令留空，静态发布目录选择根目录 `./`，10秒内完成全球 CDN 部署。
