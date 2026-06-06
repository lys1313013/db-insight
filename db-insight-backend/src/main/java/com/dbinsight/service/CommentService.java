package com.dbinsight.service;

import com.dbinsight.exception.DatabaseException;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;

@Service
public class CommentService {

    private final ConnectionService connectionService;

    public CommentService(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    public void updateTableComment(UUID userId, UUID connectionId, String tableName, String comment) {
        Connection conn = connectionService.getConnection(userId, connectionId);
        String dbType = connectionService.getDbType(userId, connectionId);
        String database = connectionService.getDatabase(userId, connectionId);

        String escapedName = escapeTableName(tableName, dbType);

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

    private String escapeTableName(String tableName, String dbType) {
        return switch (dbType) {
            case "mysql" -> "`" + tableName.replace("`", "``") + "`";
            case "postgresql" -> "\"" + tableName.replace("\"", "\"\"") + "\"";
            default -> throw new DatabaseException("不支持的数据库类型");
        };
    }
}
