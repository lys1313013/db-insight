# DB Insight

[English](#english) | [中文](#中文)

---

## English

### Overview

DB Insight is a web-based database metadata/schema visualization tool. It supports **MySQL 8.0+** and **PostgreSQL 15+**, providing features like table structure browsing, ER diagram visualization, and comment management.

### Features

- **Connection Management**: Support for MySQL and PostgreSQL database connections
- **Table Browsing**: Browse all tables with columns, indexes, and foreign key information
- **ER Diagram Visualization**: Canvas-based table relationship visualization using React Flow
- **Comment Management**: Online editing of table and column comments
- **Column Search**: Cross-table column name search
- **Multi-database Support**: Manage multiple database connections

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite + Ant Design + React Flow + Zustand |
| Backend | Java 21 + Spring Boot 3.2 |
| Database | MySQL 8.0+ / PostgreSQL 15+ |

### Quick Start

#### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| JDK | 21 |
| Maven | 3.9+ |
| Docker | 20+ (optional, for test databases) |

#### 1. Start Backend

```bash
cd db-insight-backend
./mvnw spring-boot:run
```

Backend runs at `http://localhost:9090`.

#### 2. Start Frontend

```bash
cd db-insight-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`, proxies `/api` to backend.

#### 3. Launch Test Databases (Optional)

```bash
cd scripts
docker-compose up -d
```

- MySQL: `localhost:3307`, user `root`, password `root123`, database `testdb`
- PostgreSQL: `localhost:5433`, user `postgres`, password `postgres123`, database `testdb`

### Project Structure

```
db-insight/
├── db-insight-backend/          # Spring Boot backend
│   └── src/main/java/com/dbinsight/
│       ├── config/              # Configuration
│       ├── controller/          # REST controllers
│       ├── service/             # Business logic
│       ├── model/               # Domain models
│       ├── dto/                 # Data transfer objects
│       └── exception/           # Exception handling
├── db-insight-frontend/         # React frontend
│   └── src/
│       ├── api/                 # API client
│       ├── components/          # React components
│       ├── stores/              # Zustand stores
│       └── types/               # TypeScript types
├── docs/                        # Documentation
├── scripts/                     # Dev scripts (local only)
├── LICENSE                      # MIT License
├── README.md
└── CONTRIBUTING.md
```

### API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/connections/test` | Test database connection |
| POST | `/api/connections` | Create a connection |
| DELETE | `/api/connections/{id}` | Disconnect |
| GET | `/api/connections/{id}/tables` | List all tables |
| GET | `/api/connections/{id}/tables/{name}` | Get table structure |
| PATCH | `/api/connections/{id}/tables/{name}/comment` | Update table comment |

### Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

## 中文

### 简介

DB Insight 是一个基于 Web 的数据库元数据/Schema 可视化工具，支持 **MySQL 8.0+** 和 **PostgreSQL 15+**，提供表结构浏览、ER 图展示和注释管理功能。

### 功能特性

- **连接管理**：支持 MySQL 和 PostgreSQL 数据库连接
- **表结构浏览**：浏览数据库中所有表的列、索引信息
- **ER 图可视化**：基于 React Flow 的表关系画布展示
- **注释管理**：支持在线编辑表和列的注释
- **列搜索**：跨表按列名搜索
- **多数据库支持**：管理多个数据库连接

### 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端 | React 18 + TypeScript + Vite + Ant Design + React Flow + Zustand |
| 后端 | Java 21 + Spring Boot 3.2 |
| 数据库 | MySQL 8.0+ / PostgreSQL 15+ |

### 快速启动

#### 环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | 18+ |
| JDK | 21 |
| Maven | 3.9+ |
| Docker | 20+（可选） |

#### 1. 启动后端

```bash
cd db-insight-backend
./mvnw spring-boot:run
```

后端运行在 `http://localhost:9090`。

#### 2. 启动前端

```bash
cd db-insight-frontend
npm install
npm run dev
```

前端运行在 `http://localhost:3000`，自动代理 `/api` 到后端。

#### 3. 启动测试数据库（可选）

```bash
cd scripts
docker-compose up -d
```

- MySQL：`localhost:3307`，用户 `root`，密码 `root123`，数据库 `testdb`
- PostgreSQL：`localhost:5433`，用户 `postgres`，密码 `postgres123`，数据库 `testdb`

### 项目结构

```
db-insight/
├── db-insight-backend/          # Spring Boot 后端
│   └── src/main/java/com/dbinsight/
│       ├── config/              # 配置类
│       ├── controller/          # REST 控制器
│       ├── service/             # 业务逻辑
│       ├── model/               # 数据模型
│       ├── dto/                 # 数据传输对象
│       └── exception/           # 异常处理
├── db-insight-frontend/         # React 前端
│   └── src/
│       ├── api/                 # API 调用
│       ├── components/          # React 组件
│       ├── stores/              # Zustand 状态管理
│       └── types/              # TypeScript 类型
├── docs/                        # 文档
├── scripts/                     # 开发脚本（本地）
├── LICENSE                      # MIT 许可证
├── README.md
└── CONTRIBUTING.md
```

### API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/connections/test` | 测试数据库连接 |
| POST | `/api/connections` | 创建连接 |
| DELETE | `/api/connections/{id}` | 断开连接 |
| GET | `/api/connections/{id}/tables` | 获取表列表 |
| GET | `/api/connections/{id}/tables/{name}` | 获取表结构 |
| PATCH | `/api/connections/{id}/tables/{name}/comment` | 更新表注释 |

### 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE)。
