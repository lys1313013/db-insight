# DB Insight

## 简介

DB Insight 是一个基于 Web 的数据库元数据/Schema 可视化工具，支持 **MySQL 8.0+** 和 **PostgreSQL 15+**，提供表结构浏览、ER 图展示和注释管理功能。

## 功能特性

- **连接管理**：支持 MySQL 和 PostgreSQL 数据库连接
- **表结构浏览**：浏览数据库中所有表的列、索引信息
- **ER 图可视化**：基于 React Flow 的表关系画布展示
- **注释管理**：支持在线编辑表和列的注释
- **列搜索**：跨表按列名搜索
- **多数据库支持**：管理多个数据库连接

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端 | React 18 + TypeScript + Vite + Ant Design + React Flow + Zustand |
| 后端 | Java 21 + Spring Boot 3.2 |
| 数据库 | MySQL 8.0+ / PostgreSQL 15+ |

## 快速启动

### 方式一：Docker Compose 部署（推荐）

使用阿里云 ACR 镜像一键部署完整应用栈。

#### 1. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的 ACR 信息：

```env
ALIYUN_ACR_REGISTRY=crpi-yvha9coypdedaafa.cn-beijing.personal.cr.aliyuncs.com
ALIYUN_ACR_NAMESPACE=lys1313013
BACKEND_TAG=latest
FRONTEND_TAG=latest
```

#### 2. 登录阿里云 ACR

```bash
docker login --username=<你的用户名> crpi-yvha9coypdedaafa.cn-beijing.personal.cr.aliyuncs.com
```

#### 3. 启动应用

```bash
docker-compose pull    # 拉取镜像
docker-compose up -d   # 后台启动
```

#### 4. 访问应用

- **前端**：http://localhost
- **后端 API**：http://localhost:8080
- **数据库**：localhost:15434

#### 5. 常用命令

```bash
docker-compose ps        # 查看服务状态
docker-compose logs -f   # 查看日志
docker-compose restart   # 重启服务
docker-compose down      # 停止并移除容器
```

### 方式二：本地开发部署

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
docker-compose -f docker-compose-db.yml up -d
```

- App DB: `localhost:15434`,数据库 `db_insight`,用户 `dbinsight`,密码 `dbinsight123`
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

这些是**被检视的目标库**,跟 App 自己的 DB(15434)独立。

```bash
cd scripts
docker-compose up -d
```

- MySQL：`localhost:3307`，用户 `root`，密码 `root123`，数据库 `testdb`
- PostgreSQL：`localhost:5433`，用户 `postgres`，密码 `postgres123`，数据库 `testdb`

## 项目结构

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
├── docker-compose.yml           # Docker Compose 完整部署配置
├── docker-compose-db.yml        # 仅数据库的 Compose 配置
├── .env.example                 # 环境变量示例
├── LICENSE                      # MIT 许可证
├── README.md
└── CONTRIBUTING.md
```

## API 接口

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
| GET | `/api/connections/{id}/export/markdown` | 导出 Schema 为 Markdown |

## 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE)。
