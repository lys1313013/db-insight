package com.dbinsight.service;

import com.dbinsight.exception.DatabaseException;
import com.dbinsight.model.ColumnInfo;
import com.dbinsight.model.IndexInfo;
import com.dbinsight.model.TableInfo;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
public class SchemaService {

    private final ConnectionService connectionService;

    public SchemaService(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    public List<TableInfo> getTables(String connectionId) {
        Connection conn = connectionService.getConnection(connectionId);
        String dbType = connectionService.getDbType(connectionId);
        String database = connectionService.getDatabase(connectionId);

        String sql = switch (dbType) {
            case "mysql" -> """
                    SELECT t.TABLE_NAME, t.TABLE_COMMENT,
                           (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c
                            WHERE c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME) AS column_count,
                           (SELECT GROUP_CONCAT(
                                CONCAT(COLUMN_NAME, IF(COLUMN_COMMENT IS NOT NULL AND COLUMN_COMMENT != '', CONCAT('(', COLUMN_COMMENT, ')'), ''))
                                ORDER BY ORDINAL_POSITION SEPARATOR ', ')
                            FROM INFORMATION_SCHEMA.COLUMNS c
                            WHERE c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME) AS column_names
                    FROM INFORMATION_SCHEMA.TABLES t
                    WHERE TABLE_SCHEMA = ?
                    """;
            case "postgresql" -> """
                    SELECT t.tablename AS table_name,
                           obj_description(c.oid, 'pg_class') AS table_comment,
                           (SELECT COUNT(*) FROM information_schema.columns col
                            WHERE col.table_schema = t.schemaname AND col.table_name = t.tablename) AS column_count,
                           (SELECT string_agg(
                                col.column_name || CASE WHEN col_description((quote_ident(col.table_schema) || '.' || quote_ident(col.table_name))::regclass, col.ordinal_position::int) IS NOT NULL
                                    THEN '(' || col_description((quote_ident(col.table_schema) || '.' || quote_ident(col.table_name))::regclass, col.ordinal_position::int) || ')'
                                    ELSE '' END,
                                ', ' ORDER BY col.ordinal_position)
                            FROM information_schema.columns col
                            WHERE col.table_schema = t.schemaname AND col.table_name = t.tablename) AS column_names
                    FROM pg_tables t
                    LEFT JOIN pg_class c ON c.relname = t.tablename
                    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
                    WHERE t.schemaname = 'public'
                    """;
            default -> throw new DatabaseException("不支持的数据库类型");
        };

        List<TableInfo> tables = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            if ("mysql".equals(dbType)) {
                ps.setString(1, database);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    TableInfo table = new TableInfo();
                    table.setTableName(rs.getString("table_name"));
                    table.setTableComment(rs.getString("table_comment"));
                    table.setColumnCount(rs.getInt("column_count"));
                    table.setColumnNames(rs.getString("column_names"));
                    tables.add(table);
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("查询表列表失败: " + e.getMessage());
        }
        return tables;
    }

    public TableInfo getTableDetail(String connectionId, String tableName) {
        Connection conn = connectionService.getConnection(connectionId);
        String dbType = connectionService.getDbType(connectionId);
        String database = connectionService.getDatabase(connectionId);

        TableInfo table = new TableInfo();
        table.setTableName(tableName);
        table.setColumns(getColumns(conn, dbType, database, tableName));
        table.setIndexes(getIndexes(conn, dbType, database, tableName));
        table.setTableComment(getTableComment(conn, dbType, database, tableName));
        table.setColumnCount(table.getColumns().size());
        return table;
    }

    public String exportMarkdown(String connectionId) {
        String database = connectionService.getDatabase(connectionId);
        List<TableInfo> tables = getTables(connectionId);
        tables.sort((a, b) -> a.getTableName().compareToIgnoreCase(b.getTableName()));

        StringBuilder md = new StringBuilder();
        md.append("# 数据库文档：").append(database).append("\n\n");

        // 概览表
        md.append("## 概览\n\n");
        md.append("| 表名 | 说明 | 列数 |\n");
        md.append("|------|------|------|\n");
        for (TableInfo table : tables) {
            md.append("| ")
              .append(table.getTableName())
              .append(" | ")
              .append(table.getTableComment() != null ? table.getTableComment() : "-")
              .append(" | ")
              .append(table.getColumnCount())
              .append(" |\n");
        }
        md.append("\n---\n\n");

        // 表结构详情
        md.append("## 表结构详情\n\n");
        for (int i = 0; i < tables.size(); i++) {
            TableInfo tableDetail = getTableDetail(connectionId, tables.get(i).getTableName());

            md.append("### ")
              .append(tableDetail.getTableName())
              .append(" - ")
              .append(tableDetail.getTableComment() != null ? tableDetail.getTableComment() : "-")
              .append("\n\n");

            // 列信息表
            md.append("| 列名 | 说明 | 类型 | 键 | 允许为空 | 默认值 |\n");
            md.append("|------|------|------|-----|----------|--------|\n");
            for (ColumnInfo col : tableDetail.getColumns()) {
                md.append("| ")
                  .append(col.getColumnName())
                  .append(" | ")
                  .append(col.getColumnComment() != null ? col.getColumnComment() : "-")
                  .append(" | ")
                  .append(col.getDataType())
                  .append(" | ")
                  .append(col.getColumnKey() != null && !col.getColumnKey().isEmpty() ? col.getColumnKey() : "-")
                  .append(" | ")
                  .append(col.getIsNullable())
                  .append(" | ")
                  .append(col.getColumnDefault() != null ? col.getColumnDefault() : "-")
                  .append(" |\n");
            }

            if (i < tables.size() - 1) {
                md.append("\n---\n\n");
            }
        }

        return md.toString();
    }

    private String getTableComment(Connection conn, String dbType, String database, String tableName) {
        String sql = switch (dbType) {
            case "mysql" -> "SELECT TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";
            case "postgresql" -> """
                    SELECT obj_description(c.oid, 'pg_class') AS table_comment
                    FROM pg_tables t
                    LEFT JOIN pg_class c ON c.relname = t.tablename
                    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
                    WHERE t.schemaname = 'public' AND t.tablename = ?
                    """;
            default -> throw new DatabaseException("不支持的数据库类型");
        };

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            if ("mysql".equals(dbType)) {
                ps.setString(1, database);
                ps.setString(2, tableName);
            } else {
                ps.setString(1, tableName);
            }
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("table_comment");
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("查询表注释失败: " + e.getMessage());
        }
        return null;
    }

    private List<ColumnInfo> getColumns(Connection conn, String dbType, String database, String tableName) {
        String sql = switch (dbType) {
            case "mysql" -> "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";
            case "postgresql" -> """
                    SELECT c.column_name, c.data_type,
                           CASE WHEN pk.column_name IS NOT NULL THEN 'PRI' ELSE '' END AS column_key,
                           c.is_nullable, c.column_default,
                           col_description((quote_ident(c.table_schema) || '.' || quote_ident(c.table_name))::regclass,
                                          c.ordinal_position::int) AS column_comment
                    FROM information_schema.columns c
                    LEFT JOIN (
                      SELECT ku.column_name
                      FROM information_schema.table_constraints tc
                      JOIN information_schema.key_column_usage ku ON tc.constraint_name = ku.constraint_name
                      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = ?
                    ) pk ON c.column_name = pk.column_name
                    WHERE c.table_schema = 'public' AND c.table_name = ?
                    ORDER BY c.ordinal_position
                    """;
            default -> throw new DatabaseException("不支持的数据库类型");
        };

        List<ColumnInfo> columns = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            if ("mysql".equals(dbType)) {
                ps.setString(1, database);
                ps.setString(2, tableName);
            } else {
                ps.setString(1, tableName);
                ps.setString(2, tableName);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ColumnInfo column = new ColumnInfo();
                    column.setColumnName(rs.getString("column_name"));
                    column.setDataType(rs.getString("data_type"));
                    column.setColumnKey(rs.getString("column_key"));
                    column.setIsNullable(rs.getString("is_nullable"));
                    column.setColumnDefault(rs.getString("column_default"));
                    column.setColumnComment(rs.getString("column_comment"));
                    columns.add(column);
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("查询列信息失败: " + e.getMessage());
        }
        return columns;
    }

    private List<IndexInfo> getIndexes(Connection conn, String dbType, String database, String tableName) {
        String sql = switch (dbType) {
            case "mysql" -> "SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE, INDEX_COMMENT FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?";
            case "postgresql" -> """
                    SELECT indexname AS index_name,
                           regexp_split_to_table(substring(indexdef FROM '\\((.+)\\)'), ',') AS column_name,
                           CASE WHEN indexdef LIKE '%UNIQUE%' THEN false ELSE true END AS non_unique,
                           obj_description((quote_ident(schemaname) || '.' || quote_ident(tablename))::regclass) AS index_comment
                    FROM pg_indexes
                    WHERE schemaname = 'public' AND tablename = ?
                    """;
            default -> throw new DatabaseException("不支持的数据库类型");
        };

        List<IndexInfo> indexes = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            if ("mysql".equals(dbType)) {
                ps.setString(1, database);
                ps.setString(2, tableName);
            } else {
                ps.setString(1, tableName);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    IndexInfo index = new IndexInfo();
                    index.setIndexName(rs.getString("index_name"));
                    index.setColumnName(rs.getString("column_name").trim());
                    index.setNonUnique(rs.getBoolean("non_unique"));
                    indexes.add(index);
                }
            }
        } catch (SQLException e) {
            throw new DatabaseException("查询索引信息失败: " + e.getMessage());
        }
        return indexes;
    }
}
