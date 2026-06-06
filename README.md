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

#### 1. Start the App's Database (one-time / when DB is down)

DB Insight now persists users and database connections in its own PostgreSQL. Bring it up before starting the backend:

```bash
docker-compose -f scripts/docker-compose.app.yml up -d
```

- App DB: `localhost:5434`, database `db_insight`, user `dbinsight`, password `dbinsight123`
- Data is stored in a named Docker volume (`db-insight-data`) and survives container restarts
- Flyway runs `db/migration/V1__init.sql` automatically on first start

#### 2. Start Backend

The project ships a `mvnw` wrapper script, but `.mvn/wrapper/maven-wrapper.properties` is currently git-ignored, so `./mvnw` fails with `cannot read distributionUrl property`. Use the system `mvn` (3.9+) for now.

```bash
cd db-insight-backend
mvn spring-boot:run
```

> If you have multiple JDKs installed, make sure `JAVA_HOME` points to JDK 21 — Spring Boot 3.2 will not start on newer JDKs without `--enable-native-access` and similar flags, and the project targets Java 21.

Backend runs at `http://localhost:9090`. To stop it, press `Ctrl+C` in the terminal where it's running, or kill the process: `pkill -f spring-boot:run`.

#### 3. Register and log in

Open `http://localhost:9090/api/auth/test` — should return `{"success":true,...}`. Backend is up.

The first time you open the frontend, you'll be redirected to a login page. **Register** an account (username + password, 8+ chars). The account is stored in the app's own PostgreSQL.

Subsequent logins use the same account. To change the JWT signing secret, set the `JWT_SECRET` env var (must be 32–47 bytes). Defaults to a dev-only value in `application.yml`.

#### 4. Start Frontend

```bash
cd db-insight-frontend
npm install
npm run dev
```


#### 4. Start Frontend

```bash
cd db-insight-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`, proxies `/api` to backend (the proxy also forwards the `Authorization` header).

#### 5. Launch Test Databases (Optional)

These are the **target** databases you'll inspect with the tool. They are independent of the app's own DB (port 5434).

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
│   └── src/main/
│       ├── java/com/dbinsight/
│       │   ├── config/          # (legacy; merged into security/)
│       │   ├── controller/      # REST controllers (Auth, Connection, Schema, Comment)
│       │   ├── dto/             # Request/response payloads
│       │   ├── entity/          # JPA entities (User, DbConnection)
│       │   ├── exception/       # Exception + GlobalExceptionHandler
│       │   ├── model/           # Plain model classes (TableInfo, ColumnInfo, IndexInfo)
│       │   ├── repository/      # Spring Data JPA repositories
│       │   ├── security/        # SecurityConfig, CurrentUser
│       │   └── service/         # AuthService, UserService, JwtService, ConnectionService, SchemaService, CommentService
│       └── resources/
│           ├── application.yml
│           └── db/migration/    # Flyway migrations (V1__init.sql)
├── db-insight-frontend/         # React frontend
│   └── src/
│       ├── api/                 # API client (axios + authApi)
│       ├── components/          # React components
│       ├── pages/               # LoginPage, RegisterPage
│       ├── stores/              # Zustand stores (authStore, connectionStore)
│       └── types/               # TypeScript types
├── docs/                        # Documentation
├── scripts/                     # Dev scripts + docker-compose
│   ├── docker-compose.yml       # Test target DBs (MySQL 3307, PostgreSQL 5433)
│   └── docker-compose.app.yml   # App's own PostgreSQL (port 5434)
├── LICENSE                      # MIT License
├── README.md
└── CONTRIBUTING.md
```

### API Reference

All endpoints below (except `/api/auth/*` and `/actuator/health`) require an `Authorization: Bearer <jwt>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user (`username`, `password`) |
| POST | `/api/auth/login` | Login, returns `{token, user}` |
| GET | `/api/connections` | List the current user's connections |
| POST | `/api/connections/test` | Test a connection (no DB write) |
| POST | `/api/connections` | Save a connection for the current user |
| DELETE | `/api/connections/{id}` | Delete a connection (owner only) |
| GET | `/api/connections/{id}/tables` | List all tables |
| GET | `/api/connections/{id}/tables/{name}` | Get table structure |
| PATCH | `/api/connections/{id}/tables/{name}/comment` | Update table comment |
| GET | `/api/connections/{id}/export/markdown` | Export schema as Markdown |

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

#### 1. 启动应用自身的数据库（启动后端前先做）

DB Insight 现在使用独立的 PostgreSQL 存储用户和连接配置。启动后端前先把这个数据库跑起来:

```bash
docker-compose -f scripts/docker-compose.app.yml up -d
```

- App DB: `localhost:5434`,数据库 `db_insight`,用户 `dbinsight`,密码 `dbinsight123`
- 数据持久化在名为 `db-insight-data` 的 Docker volume,容器重建不丢
- 首次启动时 Flyway 自动执行 `db/migration/V1__init.sql`

#### 2. 启动后端

项目内含 `mvnw` wrapper 脚本,但 `.mvn/wrapper/maven-wrapper.properties` 当前被 `.gitignore` 忽略,直接执行 `./mvnw` 会报 `cannot read distributionUrl property` 错误。请使用系统安装的 `mvn`(3.9+)启动。

```bash
cd db-insight-backend
mvn spring-boot:run
```

> 如果机器上装了好几个 JDK,请确认 `JAVA_HOME` 指向 JDK 21 —— Spring Boot 3.2 在更高版本 JDK 上直接启动会出问题,且项目本身按 Java 21 编译。

后端运行在 `http://localhost:9090`。停止服务:在运行终端按 `Ctrl+C`,或 `pkill -f spring-boot:run`。

#### 3. 注册并登录

打开 `http://localhost:9090/api/auth/test` 应返回 `{"success":true,...}`,说明后端通了。

第一次打开前端会跳到登录页。**先注册**一个账号(用户名 + 8 位以上密码),账号存在 App DB 自己的 `users` 表里。

后续用同一账号登录即可。要换 JWT 签名密钥,设置 `JWT_SECRET` 环境变量(必须是 32–47 字节);默认是 `application.yml` 里的开发用值。

#### 4. 启动前端

```bash
cd db-insight-frontend
npm install
npm run dev
```

前端运行在 `http://localhost:3000`,代理 `/api` 到后端(`Authorization` 头会透传过去)。

#### 5. 启动测试数据库（可选）

这些是**被检视的目标库**,跟 App 自己的 DB(5434)独立。

```bash
cd scripts
docker-compose up -d
```

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
│   └── src/main/
│       ├── java/com/dbinsight/
│       │   ├── config/          # (历史目录,已合并入 security/)
│       │   ├── controller/      # REST 控制器（Auth、Connection、Schema、Comment）
│       │   ├── dto/             # 请求/响应 DTO
│       │   ├── entity/          # JPA 实体（User、DbConnection）
│       │   ├── exception/       # 异常 + GlobalExceptionHandler
│       │   ├── model/           # 普通模型类（TableInfo、ColumnInfo、IndexInfo）
│       │   ├── repository/      # Spring Data JPA 仓库
│       │   ├── security/        # SecurityConfig、CurrentUser
│       │   └── service/         # AuthService、UserService、JwtService、ConnectionService、SchemaService、CommentService
│       └── resources/
│           ├── application.yml
│           └── db/migration/    # Flyway 迁移（V1__init.sql）
├── db-insight-frontend/         # React 前端
│   └── src/
│       ├── api/                 # API 客户端（axios + authApi）
│       ├── components/          # React 组件
│       ├── pages/               # LoginPage、RegisterPage
│       ├── stores/              # Zustand 状态（authStore、connectionStore）
│       └── types/               # TypeScript 类型
├── docs/                        # 文档
├── scripts/                     # 开发脚本 + docker-compose
│   ├── docker-compose.yml       # 测试目标库（MySQL 3307、PostgreSQL 5433）
│   └── docker-compose.app.yml   # App 自己的 PostgreSQL（端口 5434）
├── LICENSE                      # MIT 许可证
├── README.md
└── CONTRIBUTING.md
```

### API 接口

以下接口（`/api/auth/*` 和 `/actuator/health` 除外）都需要 `Authorization: Bearer <jwt>` 请求头。

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册新用户（`username`、`password`） |
| POST | `/api/auth/login` | 登录,返回 `{token, user}` |
| GET | `/api/connections` | 列出当前用户的所有连接 |
| POST | `/api/connections/test` | 测试连接（不写库） |
| POST | `/api/connections` | 保存连接到当前用户 |
| DELETE | `/api/connections/{id}` | 删除连接（仅限所有者） |
| GET | `/api/connections/{id}/tables` | 获取表列表 |
| GET | `/api/connections/{id}/tables/{name}` | 获取表结构 |
| PATCH | `/api/connections/{id}/tables/{name}/comment` | 更新表注释 |

### 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE)。
