package com.dbinsight.service;

import com.dbinsight.dto.ConnectionRequest;
import com.dbinsight.exception.DatabaseException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConnectionService {

    private static final Logger log = LoggerFactory.getLogger(ConnectionService.class);

    private final Map<String, ConnectionInfo> connections = new ConcurrentHashMap<>();
    private final ConnectionFileManager fileManager;

    public ConnectionService(ConnectionFileManager fileManager) {
        this.fileManager = fileManager;
    }

    @PostConstruct
    public void restoreConnections() {
        Map<String, ConnectionFileManager.ConnectionConfig> saved = fileManager.loadAll();
        for (var entry : saved.entrySet()) {
            String id = entry.getKey();
            ConnectionFileManager.ConnectionConfig cfg = entry.getValue();
            try {
                ConnectionRequest req = new ConnectionRequest();
                req.setType(cfg.type());
                req.setHost(cfg.host());
                req.setPort(cfg.port());
                req.setUsername(cfg.username());
                req.setPassword(cfg.password());
                req.setDatabase(cfg.database());
                Connection conn = createJdbcConnection(req);
                connections.put(id, new ConnectionInfo(conn, cfg.type(), cfg.database()));
                log.info("恢复连接: {} ({})", id, cfg.database());
            } catch (Exception e) {
                log.warn("恢复连接失败: {} - {}", id, e.getMessage());
                fileManager.remove(id);
            }
        }
    }

    public String testConnection(ConnectionRequest request) {
        try (Connection conn = createJdbcConnection(request)) {
            return "连接成功";
        } catch (SQLException e) {
            throw new DatabaseException("连接失败: " + e.getMessage());
        }
    }

    public String createConnection(ConnectionRequest request) {
        String connectionId = UUID.randomUUID().toString();
        try {
            Connection conn = createJdbcConnection(request);
            connections.put(connectionId, new ConnectionInfo(conn, request.getType(), request.getDatabase()));
            fileManager.save(connectionId, new ConnectionFileManager.ConnectionConfig(
                    request.getType(), request.getHost(), request.getPort(),
                    request.getUsername(), request.getPassword(), request.getDatabase()));
            return connectionId;
        } catch (SQLException e) {
            throw new DatabaseException("创建连接失败: " + e.getMessage());
        }
    }

    public void disconnect(String connectionId) {
        ConnectionInfo info = connections.remove(connectionId);
        if (info != null) {
            try {
                info.connection.close();
            } catch (SQLException e) {
                // ignore close error
            }
        }
        fileManager.remove(connectionId);
    }

    public Connection getConnection(String connectionId) {
        ConnectionInfo info = connections.get(connectionId);
        if (info == null) {
            throw new DatabaseException("连接不存在或已断开");
        }
        try {
            if (info.connection.isClosed()) {
                connections.remove(connectionId);
                fileManager.remove(connectionId);
                throw new DatabaseException("连接已关闭");
            }
        } catch (SQLException e) {
            throw new DatabaseException("检查连接状态失败");
        }
        return info.connection;
    }

    public String getDbType(String connectionId) {
        ConnectionInfo info = connections.get(connectionId);
        if (info == null) {
            throw new DatabaseException("连接不存在");
        }
        return info.dbType;
    }

    public String getDatabase(String connectionId) {
        ConnectionInfo info = connections.get(connectionId);
        if (info == null) {
            throw new DatabaseException("连接不存在");
        }
        return info.database;
    }

    private Connection createJdbcConnection(ConnectionRequest request) throws SQLException {
        String url = buildUrl(request);
        return DriverManager.getConnection(url, request.getUsername(), request.getPassword());
    }

    private String buildUrl(ConnectionRequest request) {
        return switch (request.getType()) {
            case "mysql" -> "jdbc:mysql://" + request.getHost() + ":" + request.getPort() + "/" + request.getDatabase() + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci";
            case "postgresql" -> "jdbc:postgresql://" + request.getHost() + ":" + request.getPort() + "/" + request.getDatabase();
            default -> throw new DatabaseException("不支持的数据库类型: " + request.getType());
        };
    }

    private record ConnectionInfo(Connection connection, String dbType, String database) {
    }
}
