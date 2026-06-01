#!/bin/bash

BASE_URL="http://localhost:8080"

echo "=== DB Insight API 测试 ==="
echo ""

# 测试 MySQL 连接
echo "1. 测试 MySQL 连接..."
TEST_RESULT=$(curl -s -X POST "$BASE_URL/api/connections/test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "root123",
    "database": "testdb"
  }')
echo "结果: $TEST_RESULT"
echo ""

# 创建 MySQL 连接
echo "2. 创建 MySQL 连接..."
CREATE_RESULT=$(curl -s -X POST "$BASE_URL/api/connections" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "root123",
    "database": "testdb"
  }')
echo "结果: $CREATE_RESULT"

# 提取 connectionId
MYSQL_CONN_ID=$(echo $CREATE_RESULT | grep -o '"connectionId":"[^"]*"' | cut -d'"' -f4)
echo "连接ID: $MYSQL_CONN_ID"
echo ""

# 获取表列表
echo "3. 获取 MySQL 表列表..."
TABLES_RESULT=$(curl -s "$BASE_URL/api/connections/$MYSQL_CONN_ID/tables")
echo "结果: $TABLES_RESULT"
echo ""

# 获取表详情
echo "4. 获取 users 表详情..."
TABLE_DETAIL=$(curl -s "$BASE_URL/api/connections/$MYSQL_CONN_ID/tables/users")
echo "结果: $TABLE_DETAIL"
echo ""

# 更新表注释
echo "5. 更新 users 表注释..."
UPDATE_RESULT=$(curl -s -X PATCH "$BASE_URL/api/connections/$MYSQL_CONN_ID/tables/users/comment" \
  -H "Content-Type: application/json" \
  -d '{"comment": "用户表 - 已更新注释"}')
echo "结果: $UPDATE_RESULT"
echo ""

# 验证注释更新
echo "6. 验证注释更新..."
VERIFY_RESULT=$(curl -s "$BASE_URL/api/connections/$MYSQL_CONN_ID/tables/users" | grep -o '"tableComment":"[^"]*"')
echo "结果: $VERIFY_RESULT"
echo ""

# 断开连接
echo "7. 断开 MySQL 连接..."
DISCONNECT_RESULT=$(curl -s -X DELETE "$BASE_URL/api/connections/$MYSQL_CONN_ID")
echo "结果: $DISCONNECT_RESULT"
echo ""

echo "=== MySQL 测试完成 ==="
echo ""

# 测试 PostgreSQL 连接
echo "8. 测试 PostgreSQL 连接..."
TEST_RESULT=$(curl -s -X POST "$BASE_URL/api/connections/test" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "postgresql",
    "host": "localhost",
    "port": 5433,
    "username": "postgres",
    "password": "postgres123",
    "database": "testdb"
  }')
echo "结果: $TEST_RESULT"
echo ""

# 创建 PostgreSQL 连接
echo "9. 创建 PostgreSQL 连接..."
CREATE_RESULT=$(curl -s -X POST "$BASE_URL/api/connections" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "postgresql",
    "host": "localhost",
    "port": 5433,
    "username": "postgres",
    "password": "postgres123",
    "database": "testdb"
  }')
echo "结果: $CREATE_RESULT"

PG_CONN_ID=$(echo $CREATE_RESULT | grep -o '"connectionId":"[^"]*"' | cut -d'"' -f4)
echo "连接ID: $PG_CONN_ID"
echo ""

# 获取 PostgreSQL 表列表
echo "10. 获取 PostgreSQL 表列表..."
TABLES_RESULT=$(curl -s "$BASE_URL/api/connections/$PG_CONN_ID/tables")
echo "结果: $TABLES_RESULT"
echo ""

# 断开 PostgreSQL 连接
echo "11. 断开 PostgreSQL 连接..."
DISCONNECT_RESULT=$(curl -s -X DELETE "$BASE_URL/api/connections/$PG_CONN_ID")
echo "结果: $DISCONNECT_RESULT"
echo ""

echo "=== 全部测试完成 ==="
