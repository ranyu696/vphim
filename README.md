# 🎬 VePhim: 在线观看电影，免费且快速

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white" alt="GraphQL">
  <img src="https://img.shields.io/badge/Elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white" alt="Elasticsearch">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native">
</div>

<div align="center">
  <h3>🌟 您的个人电影库，随时随地 🌟</h3>
</div>

> ⚠️ **重要法律声明**：本项目仅供教育目的使用。使用本软件前请阅读 [DISCLAIMER.md](./DISCLAIMER.md) 文件。

## 📖 什么是 VePhim？

VePhim 是一个功能丰富的平台，您可以在这里免费在线观看电影。它就像是您的个人电影库，只要有网络连接，随时随地都可以访问。凭借简洁现代的界面和强大的功能，VePhim 为您提供优质的流媒体体验，而无需支付高昂的费用。

## 🔄 它是如何工作的？

VePhim 作为一个聚合器而不是主机。它不是在自己的服务器上存储电影，而是智能地索引和流式传输来自互联网上公开可用的资源。我们的专业爬虫收集全面的电影数据，包括：

- **电影元数据**：标题、描述、类型、发布日期、导演、演员
- **媒体源**：来自各种提供商的 m3u8 流媒体 URL 和嵌入 URL
- **剧集信息**：包含多集和多季的电视节目
- **服务器选项**：每个内容都有多个流媒体源
- **媒体详情**：质量选项、语言信息和可用的字幕

这种完整的数据收集方法实现了：

- **庞大的内容库**，基础设施成本最低
- **无缓冲流媒体**，优化内容传输
- **始终新鲜的内容**，通过定时爬虫自动更新
- **可靠的播放选项**，在 m3u8 和嵌入源之间提供备选方案

## ✨ VePhim 有什么特别之处？

<table>
  <tr>
    <td align="center" width="33%">
      <h3>🤖 AI 驱动的搜索</h3>
      <p>我们的 Gemini 驱动的 AI 理解您的偏好，帮助您根据心情、兴趣或特定标准找到完美的电影。</p>
    </td>
    <td align="center" width="33%">
      <h3>⚡ 闪电般快速的流媒体</h3>
      <p>通过我们先进的流媒体技术和优化的内容传输，体验流畅、高质量的播放。</p>
    </td>
    <td align="center" width="33%">
      <h3>📱 多平台支持</h3>
      <p>通过我们的响应式网页应用和原生移动应用，在浏览器或移动设备上享受 VePhim。</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="33%">
      <h3>🔍 智能发现</h3>
      <p>通过基于您的观看历史和偏好的智能推荐发现新内容。</p>
    </td>
    <td align="center" width="33%">
      <h3>💾 个人收藏</h3>
      <p>创建免费账户以保存收藏、跟踪观看历史并接收个性化推荐。</p>
    </td>
    <td align="center" width="33%">
      <h3>🛡️ 清爽体验</h3>
      <p>享受清爽、轻广告的体验，专注于内容享受而不是干扰。</p>
    </td>
  </tr>
</table>

## 🏗️ 架构和项目结构

VePhim 使用 Nx 构建为单体仓库，这是一个强大的构建系统和开发工具包，可以在多个应用程序之间实现高效的代码共享和维护。

```
vephim/
├── apps/
│   ├── api/         # NestJS 后端服务
│   │    └── .env    # 后端环境配置
│   ├── fe/          # 主用户界面 (Next.js)
│   │    └── .env    # 前端环境配置
│   ├── mnt/         # 管理仪表板界面
│   │    └── .env    # 管理环境配置
│   └── mobile/      # React Native 移动应用
├── containers/      # 基础设施的 Docker 配置
│   ├── be-with-redis/      # 带 Redis 的后端配置
│   ├── be-redis-pm2/       # 带 Redis 和 PM2 的后端
│   ├── be-redis-es/        # 带 Redis 和 Elasticsearch 的后端
│   ├── elasticsearch/      # Elasticsearch 配置
│   ├── kibana/             # Kibana 可视化工具
│   ├── load-balancer/      # 负载均衡配置
│   ├── swag/               # 安全 Web 应用网关
│   └── weserv-images/      # 图像优化服务
├── documents/       # 项目文档和图表
├── tools/           # 构建和开发工具
├── .env             # 根环境变量
└── nx.json          # Nx 工作空间配置
```

## 🛠️ 技术栈

VePhim 利用现代技术提供无缝的用户体验：

### 🔒 后端基础设施

- **NestJS**：用于构建可扩展服务器应用程序的企业级 Node.js 框架
- **MongoDB**：用于灵活和可扩展数据存储的 NoSQL 数据库
- **Redis**：用于缓存和性能优化的内存数据存储
- **Gemini AI**：Google 的高级 LLM，用于智能搜索和推荐
- **Elasticsearch**：用于强大内容发现的分布式搜索引擎
- **GraphQL**：用于高效数据查询和操作的现代 API 技术
- **数据爬虫**：从多个公共源索引和收集完整电影数据的复杂爬虫，包括元数据、流媒体 URL 和嵌入选项

### 🎨 前端应用

VePhim 为不同的用户角色提供两个独立的前端应用：

#### 主用户界面 (fe)
- **Next.js**：为最终用户流媒体体验优化的 React 框架
- **Ant Design**：用于视觉吸引人的用户界面的高级 UI 组件
- **Vidstack**：用于流媒体视频内容的现代、可访问的媒体播放器
- **Swiper**：用于浏览电影集合的触摸式滑块
- **React Hook Form**：性能优先的表单验证和处理

#### 管理仪表板 (mnt)
- **Next.js**：与主 UI 相同的框架，但配置用于管理任务
- **RefineJS**：用于构建管理面板的基于 React 的框架
- **Ant Design**：两个前端之间一致的设计系统
- **React Hook Form**：用于内容管理操作的表单处理

### 📱 移动体验

- **Expo**：跨平台移动应用开发框架
- **UI Kitten**：具有可自定义组件的 React Native UI 库
- **React Native Reanimated**：流畅移动体验的高级动画
- **Expo Video**：移动设备的原生视频播放

## 🚀 开始使用

### 本地开发设置

1. **安装依赖：**
   ```bash
   yarn install
   ```

2. **配置环境：**
   ```bash
   cp .env.example .env
   # 使用您的配置值编辑 .env
   ```

3. **启动基础设施服务：**
   ```bash
   docker compose -f docker-compose.infra.yml up -d
   ```

4. **以开发模式启动应用：**

   **后端：**
   ```bash
   # 配置后端环境
   cp apps/api/.env.example apps/api/.env
   # 根据需要编辑 apps/api/.env

   # 以开发模式启动 API 服务器
   yarn api
   # 服务器将在 http://localhost:8000 运行
   ```

   **主用户界面：**
   ```bash
   # 配置前端环境
   cp apps/fe/.env.example apps/fe/.env
   # 根据需要编辑 apps/fe/.env

   # 以开发模式启动 Web 应用
   yarn fe
   # 主 UI 将在 http://localhost:3000 运行
   ```

   **管理仪表板：**
   ```bash
   # 配置管理环境
   cp apps/mnt/.env.example apps/mnt/.env
   # 根据需要编辑 apps/mnt/.env

   # 以开发模式启动管理界面
   yarn mnt
   # 管理仪表板将在 http://localhost:4000 运行
   ```

   **移动应用：**
   ```bash
   # 确保 Android 模拟器正在运行
   yarn adr
   ```

### 生产构建和部署

#### 生产构建

1. **构建后端：**
   ```bash
   yarn nx build api --configuration=production
   # 输出将在 dist/apps/api
   ```

2. **构建主 UI：**
   ```bash
   yarn nx build fe --skip-nx-cache
   # 输出将在 apps/fe/.next，生产环境使用 standalone 文件夹
   ```

3. **构建管理仪表板：**
   ```bash
   yarn nx build mnt --skip-nx-cache
   # 输出将在 apps/mnt/.next，生产环境使用 standalone 文件夹
   ```

#### 生产模式运行

1. **运行后端：**
   ```bash
   # 构建后
   NODE_ENV=production node dist/apps/api/main
   ```

2. **运行主 UI：**
   ```bash
   # 构建后
   cd apps/fe/.next/standalone
   NODE_ENV=production node server.js
   ```

3. **运行管理仪表板：**
   ```bash
   # 构建后
   cd apps/mnt/.next/standalone
   NODE_ENV=production node server.js
   ```

### Docker 部署选项

#### 后端部署

- **选项 1：独立后端**
  ```bash
  docker compose up -d
  ```

- **选项 2：带 Redis 的后端包**
  ```bash
  docker compose -f docker-compose.bundle.yml up -d
  ```

#### 前端部署

使用 Vercel 快速部署：

1. **主用户界面：**
   - 将您的仓库连接到 Vercel
   - 配置环境变量
   - 使用这些构建设置：
     - 构建命令：`yarn nx build fe --skip-nx-cache`
     - 输出目录：`apps/fe/.next`
     - 安装命令：`yarn install --immutable`

2. **管理仪表板：**
   - 为管理界面创建单独的 Vercel 项目
   - 配置环境变量（包括身份验证）
   - 使用这些构建设置：
     - 构建命令：`yarn nx build mnt --skip-nx-cache`
     - 输出目录：`apps/mnt/.next`
     - 安装命令：`yarn install --immutable`

#### 自定义 Docker 构建

您也可以使用提供的 Dockerfile 构建和运行自己的 Docker 镜像：

```bash
# 构建和运行后端
docker build -f apps/api/Dockerfile -t vephim-api .
docker run -p 8000:8000 vephim-api

# 构建和运行主 UI
docker build -f apps/fe/Dockerfile -t vephim-fe .
docker run -p 3000:3000 vephim-fe

# 构建和运行管理仪表板
docker build -f apps/mnt/Dockerfile -t vephim-mnt .
docker run -p 4000:4000 vephim-mnt
```

## 🔍 想要贡献或了解更多？

本 README 提供了 VePhim 的概述。有关详细文档、架构图和贡献指南，请查看 `documents` 目录或访问我们的 [GitHub 仓库](https://github.com/lehuygiang28/vphim)。

## ⚠️ 免责声明

**重要法律声明**

本项目**严格仅供教育和演示目的使用**。

有关完整的法律免责声明，请参阅本仓库中的 [DISCLAIMER.md](./DISCLAIMER.md) 文件。

总结：
- VePhim 不托管、存储或分发任何电影内容
- 所有内容都来自并直接从第三方源流式传输
- 用户负责遵守其当地法律和法规
- 本项目旨在展示开发技术，而不是促进版权侵权

**本软件按"原样"提供，不提供任何明示或暗示的保证。**
