package com.dbinsight.service;

import com.dbinsight.exception.DatabaseException;
import com.dbinsight.model.ColumnInfo;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;

@Service
public class CommentService {

    private final ConnectionService connectionService;
    private final SchemaService schemaService;

    public CommentService(ConnectionService connectionService, SchemaService schemaService) {
        this.connectionService = connectionService;
        this.schemaService = schemaService;
    }

    public void updateTableComment(UUID userId, UUID connectionId, String tableName, String comment) {
        Connection conn = connectionService.getConnection(userId, connectionId);
        String dbType = connectionService.getDbType(userId, connectionId);

        String escapedName = escapeIdentifier(tableName, dbType);

        String sql = switch (dbType) {
            case "mysql" -> "ALTER TABLE " + escapedName + " COMMENT = ?";
            case "postgresql" -> "COMMENT ON TABLE " + escapedName + " IS ?";
            default -> throw new DatabaseException("不支持的数据库类型");
        };

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, comment);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseException("更新表注释失败: " + e.getMessage());
        }
    }

    public void updateColumnComment(UUID userId, UUID connectionId, String tableName, String columnName, String comment) {
        Connection conn = connectionService.getConnection(userId, connectionId);
        String dbType = connectionService.getDbType(userId, connectionId);

        String sql = switch (dbType) {
            case "mysql" -> buildMysqlAlterColumn(connectionId, userId, tableName, columnName, comment);
            case "postgresql" -> {
                String escTable = escapeIdentifier(tableName, dbType);
                String escCol = escapeIdentifier(columnName, dbType);
                yield "COMMENT ON COLUMN " + escTable + "." + escCol + " IS ?";
            }
            default -> throw new DatabaseException("不支持的数据库类型");
        };

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            if ("postgresql".equals(dbType)) {
                ps.setString(1, comment);
            }
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseException("更新列注释失败: " + e.getMessage());
        }
    }

    private String buildMysqlAlterColumn(UUID connectionId, UUID userId, String tableName, String columnName, String comment) {
        // Re-fetch the column's current type/nullability/default so MODIFY COLUMN preserves them
        ColumnInfo current = schemaService.getColumnDetail(userId, connectionId, tableName, columnName);
        if (current == null) {
            throw new DatabaseException("列不存在: " + columnName);
        }
        String escTable = escapeIdentifier(tableName, "mysql");
        String escCol = escapeIdentifier(columnName, "mysql");
        String columnType = current.getColumnType() != null ? current.getColumnType() : current.getDataType();
        String nullability = "NO".equalsIgnoreCase(current.getIsNullable()) ? "NOT NULL" : "NULL";

        StringBuilder sb = new StringBuilder();
        sb.append("ALTER TABLE ").append(escTable)
          .append(" MODIFY COLUMN ").append(escCol)
          .append(' ').append(columnType)
          .append(' ').append(nullability);

        String def = current.getColumnDefault();
        if (def != null && !def.isBlank()) {
            sb.append(" DEFAULT ").append(formatDefault(def, columnType));
        }

        sb.append(" COMMENT ?");
        return sb.toString();
    }

    private String formatDefault(String def, String columnType) {
        String upper = columnType.toUpperCase();
        boolean isString = upper.startsWith("CHAR") || upper.startsWith("VARCHAR")
                || upper.startsWith("TEXT") || upper.startsWith("TINYTEXT")
                || upper.startsWith("MEDIUMTEXT") || upper.startsWith("LONGTEXT")
                || upper.startsWith("DATE") || upper.startsWith("DATETIME")
                || upper.startsWith("TIMESTAMP") || upper.startsWith("TIME")
                || upper.startsWith("YEAR") || upper.startsWith("ENUM")
                || upper.startsWith("SET") || upper.startsWith("JSON")
                || upper.startsWith("BINARY") || upper.startsWith("VARBINARY")
                || upper.startsWith("BLOB");
        if (isString) {
            return "'" + def.replace("'", "''") + "'";
        }
        return def;
    }

    private String escapeIdentifier(String name, String dbType) {
        return switch (dbType) {
            case "mysql" -> "`" + name.replace("`", "``") + "`";
            case "postgresql" -> "\"" + name.replace("\"", "\"\"") + "\"";
            default -> throw new DatabaseException("不支持的数据库类型");
        };
    }
}
