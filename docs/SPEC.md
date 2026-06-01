# DB Insight - 技术规格文档

## 1. 项目概述

| 属性 | 值 |
|------|-----|
| 项目名称 | DB Insight |
| 前端技术 | React 18 + TypeScript + Vite |
| 后端技术 | Java 21 + Spring Boot 3 |
| 数据库支持 | MySQL 8.0+、PostgreSQL 15+ |
| 通信协议 | RESTful API + WebSocket（实时连接状态） |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐   │
│  │ 连接管理 │  │ 表列表   │  │ 表画布   │  │ 表结构详情   │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └──────┬──────┘   │
│       └────────────┴────────────┴──────────────┘            │
│                          │ Axios                            │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTP
┌──────────────────────────┼───────────────────────────────────┐
│                     后端 (Java 21)                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐     │
│  │ Connection │  │  Schema    │  │    Comment         │     │
│  │ Controller │  │  Controller│  │    Controller      │     │
│  └─────┬──────┘  └─────┬──────┘  └─────────┬──────────┘     │
│        └───────────────┼──────────────────┘                 │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Service Layer                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Connection │  │   Schema   │  │  Comment   │     │   │
│  │  │  Service   │  │  Service   │  │  Service   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           MetaData Query Layer (无持久化)             │   │
│  │   直接查询目标数据库的 INFORMATION_SCHEMA             │   │
│  │            mysql-connector-java / postgresql-jdbc    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌───────────┐        ┌───────────┐        ┌───────────┐
    │   MySQL   │        │PostgreSQL │        │  其他...  │
    │ 元数据查询 │        │ 元数据查询 │        │           │
    └───────────┘        └───────────┘        └───────────┘
```

---

## 3. 项目模块结构

```
db-insight/
├── db-insight-frontend/          # 前端项目
│   ├── src/
│   │   ├── api/                  # API 调用层
│   │   │   ├── client.ts         # Axios 实例配置
│   │   │   ├── connectionApi.ts  # 连接管理 API
│   │   │   ├── schemaApi.ts       # 表结构 API
│   │   │   └── commentApi.ts     # 注释 API
│   │   ├── components/           # React 组件
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── TableList/
│   │   │   ├── TableCanvas/
│   │   │   └── TableDetail/
│   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── useConnection.ts
│   │   │   ├── useTables.ts
│   │   │   └── useCanvas.ts
│   │   ├── stores/               # 状态管理 (Zustand)
│   │   │   ├── connectionStore.ts
│   │   │   └── tableStore.ts
│   │   ├── types/                # TypeScript 类型定义
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── package.json
│
└── db-insight-backend/           # 后端项目（无持久化，直接查询元数据）
    └── src/main/java/com/dbinsight/
        ├── DbInsightApplication.java
        ├── config/               # 配置类
        │   └── CorsConfig.java
        ├── controller/            # 控制器
        │   ├── ConnectionController.java
        │   ├── SchemaController.java
        │   └── CommentController.java
        ├── service/              # 业务逻辑（直接查询元数据）
        │   ├── ConnectionService.java
        │   ├── SchemaService.java
        │   └── CommentService.java
        ├── model/                # 数据模型
        │   ├── ConnectionConfig.java
        │   ├── TableInfo.java
        │   ├── ColumnInfo.java
        │   └── IndexInfo.java
        ├── dto/                  # 数据传输对象
        │   ├── ConnectionRequest.java
        │   ├── TableListResponse.java
        │   └── UpdateCommentRequest.java
        └── exception/            # 异常处理
            ├── GlobalExceptionHandler.java
            └── DatabaseException.java
```

**注意**: 后端不存储任何数据，所有元数据直接通过数据库连接查询：
- MySQL: `INFORMATION_SCHEMA`
- PostgreSQL: `information_schema`

---

## 4. API 接口设计

### 4.1 连接管理

#### POST /api/connections/test
测试数据库连接

**Request:**
```json
{
  "type": "mysql" | "postgresql",
  "host": "string",
  "port": number,
  "username": "string",
  "password": "string",
  "database": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "连接成功"
}
```

#### POST /api/connections
创建连接（会话级）

**Response:**
```json
{
  "connectionId": "uuid-string",
  "success": true
}
```

#### DELETE /api/connections/{connectionId}
断开连接

**Response:**
```json
{
  "success": true
}
```

---

### 4.2 表结构查询

#### GET /api/connections/{connectionId}/tables
获取所有表列表

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tableName": "string",
      "tableComment": "string",
      "columnCount": number
    }
  ]
}
```

#### GET /api/connections/{connectionId}/tables/{tableName}
获取指定表的完整结构

**Response:**
```json
{
  "success": true,
  "data": {
    "tableName": "string",
    "tableComment": "string",
    "columns": [
      {
        "columnName": "string",
        "dataType": "string",
        "columnKey": "PRI" | "MUL" | "",
        "isNullable": "YES" | "NO",
        "columnDefault": "string" | null,
        "columnComment": "string"
      }
    ],
    "indexes": [
      {
        "indexName": "string",
        "columnName": "string",
        "nonUnique": boolean,
        "indexComment": "string"
      }
    ]
  }
}
```

---

### 4.3 注释修改

#### PATCH /api/connections/{connectionId}/tables/{tableName}/comment
更新表注释

**Request:**
```json
{
  "comment": "新的表注释内容"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 5. 元数据查询策略

后端直接通过目标数据库的元数据系统查询表结构信息，无需本地存储。

### 5.1 MySQL 元数据查询

```sql
-- 获取所有表
SELECT TABLE_NAME, TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = ?

-- 获取表的所有列
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?

-- 获取表的所有索引
SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, INDEX_COMMENT
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
```

### 5.2 PostgreSQL 元数据查询

```sql
-- 获取所有表
SELECT t.tablename AS table_name, obj_description(c.oid, 'pg_class') AS table_comment
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
WHERE t.schemaname = 'public'

-- 获取表的所有列
SELECT c.column_name, c.data_type, 
       CASE WHEN pk.column_name IS NOT NULL THEN 'PRI' ELSE '' END AS column_key,
       c.is_nullable, c.column_default,
       col_description(format('%I.%I', c.table_schema, c.table_name)::regclass, 
                       ordinal_position) AS column_comment
FROM information_schema.columns c
LEFT JOIN (
  SELECT ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = ?
) pk ON c.column_name = pk.column_name
WHERE c.table_schema = 'public' AND c.table_name = ?
ORDER BY c.ordinal_position

-- 获取表的所有索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = ?
```

---

## 6. 数据模型

### 6.1 ColumnInfo

| 字段 | 类型 | 描述 |
|------|------|------|
| columnName | String | 列名 |
| dataType | String | 数据类型（不含长度） |
| columnKey | String | 键类型：PRI/MUL/UNI |
| isNullable | String | YES/NO |
| columnDefault | String | 默认值 |
| columnComment | String | 列注释 |

### 6.2 IndexInfo

| 字段 | 类型 | 描述 |
|------|------|------|
| indexName | String | 索引名 |
| columnName | String | 索引列名 |
| nonUnique | Boolean | 是否唯一 |
| indexComment | String | 索引注释 |

### 6.3 TableInfo

| 字段 | 类型 | 描述 |
|------|------|------|
| tableName | String | 表名 |
| tableComment | String | 表注释 |
| columns | List<ColumnInfo> | 列信息列表 |
| indexes | List<IndexInfo> | 索引信息列表 |

---

## 7. 安全性设计

### 7.1 SQL 注入防护

| 防护措施 | 实现方式 |
|----------|----------|
| 参数化查询 | 所有 WHERE 条件使用 `?` 占位符 |
| 表名转义 | MySQL 使用反引号，PostgreSQL 使用双引号 |
| 白名单验证 | 数据库类型只允许 mysql/postgresql |

**示例代码:**
```java
// 错误 ❌ - 字符串拼接
String sql = "SELECT * FROM " + tableName;

// 正确 ✅ - 根据数据库类型选择转义方式
String escapedName;
if ("mysql".equals(dbType)) {
    escapedName = "`" + tableName.replace("`", "``") + "`";
} else {
    escapedName = "\"" + tableName.replace("\"", "\"\"") + "\"";
}
String sql = "SELECT * FROM " + escapedName;
PreparedStatement ps = connection.prepareStatement(sql);
```

### 7.2 连接安全

- 密码不在日志中输出
- 单次查询超时时间：10秒
- 最大并发连接数：5（会话级管理，每个用户会话独立维护连接，不共享连接池）
- 断开连接后立即释放资源

---

## 8. 前端技术细节

### 8.1 状态管理 (Zustand)

```typescript
interface ConnectionStore {
  connectionId: string | null;
  isConnected: boolean;
  dbType: 'mysql' | 'postgresql' | null;
  connect: (config: ConnectionConfig) => Promise<void>;
  disconnect: () => Promise<void>;
}

interface TableStore {
  tables: TableInfo[];
  selectedTable: string | null;
  tableSearchQuery: string;
  columnSearchQuery: string;
  fetchTables: () => Promise<void>;
  setSelectedTable: (name: string) => void;
}
```

### 8.2 画布实现

| 技术方案 | 选择 |
|----------|------|
| 画布库 | React Flow |
| 布局算法 | Dagre |
| 状态管理 | Zustand + React Flow 内置状态 |

**画布功能:**
- 节点：表卡片（固定宽度，高度随列数自适应）
- 边：表间外键关系（如果可获取）
- 交互：缩放(0.25x-2x)、平移、拖拽节点

### 8.3 组件列表

| 组件 | 职责 |
|------|------|
| Header | Logo、连接状态、视图切换 |
| Sidebar | 连接表单、表搜索、列搜索、表清单 |
| TableList | 表格形式展示所有表 |
| TableCanvas | 画布形式展示所有表 |
| TableDetail | 单表完整结构展示（列、索引、注释编辑） |

---

## 9. 后端技术细节

### 9.1 Spring Boot 配置

```yaml
server:
  port: 8080

spring:
  application:
    name: db-insight
```

### 9.2 异常处理

| 异常类型 | HTTP 状态码 | 处理方式 |
|----------|-------------|----------|
| 连接失败 | 400 | 返回错误信息 |
| 表不存在 | 404 | 返回错误信息 |
| SQL 执行错误 | 500 | 记录日志，返回脱敏错误 |
| 超时 | 504 | 返回超时错误 |

---

## 10. 开发环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | 18+ |
| npm | 9+ |
| JDK | 21 |
| Maven | 3.9+ |
| MySQL | 8.0+ (测试用) |
| PostgreSQL | 15+ (测试用) |

---

## 11. 启动方式

### 前端
```bash
cd db-insight-frontend
npm install
npm run dev
```

### 后端
```bash
cd db-insight-backend
mvn spring-boot:run
```
