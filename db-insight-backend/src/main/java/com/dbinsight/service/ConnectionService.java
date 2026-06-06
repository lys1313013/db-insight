package com.dbinsight.service;

import com.dbinsight.dto.ConnectionRequest;
import com.dbinsight.dto.ConnectionView;
import com.dbinsight.entity.DbConnection;
import com.dbinsight.exception.DatabaseException;
import com.dbinsight.repository.DbConnectionRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConnectionService {

    private static final Logger log = LoggerFactory.getLogger(ConnectionService.class);

    private final DbConnectionRepository repository;
    private final Map<UUID, ConnectionInfo> liveConnections = new ConcurrentHashMap<>();

    public ConnectionService(DbConnectionRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void restoreConnections() {
        List<DbConnection> saved = repository.findAll();
        for (DbConnection cfg : saved) {
            try {
                Connection conn = openJdbc(cfg.getDbType(), cfg.getHost(), cfg.getPort(),
                        cfg.getDbUsername(), cfg.getDbPassword(), cfg.getDatabase());
                liveConnections.put(cfg.getId(),
                        new ConnectionInfo(conn, cfg.getDbType(), cfg.getDatabase(), cfg.getUserId()));
                log.info("恢复连接: {} ({}, user={})", cfg.getId(), cfg.getDatabase(), cfg.getUserId());
            } catch (Exception e) {
                log.warn("恢复连接失败: {} - {}", cfg.getId(), e.getMessage());
            }
        }
    }

    public String testConnection(ConnectionRequest request) {
        try (Connection conn = openJdbc(request.getType(), request.getHost(), request.getPort(),
                request.getUsername(), request.getPassword(), request.getDatabase())) {
            if (!conn.isValid(3)) {
                throw new DatabaseException("连接无效");
            }
            return "连接成功";
        } catch (SQLException e) {
            throw new DatabaseException("连接失败: " + e.getMessage());
        }
    }

    @Transactional
    public UUID createConnection(UUID userId, ConnectionRequest request) {
        try {
            Connection conn = openJdbc(request.getType(), request.getHost(), request.getPort(),
                    request.getUsername(), request.getPassword(), request.getDatabase());
            DbConnection entity = new DbConnection(
                    userId,
                    request.getName(),
                    request.getType(),
                    request.getHost(),
                    request.getPort(),
                    request.getUsername(),
                    request.getPassword(),
                    request.getDatabase()
            );
            DbConnection saved = repository.save(entity);
            liveConnections.put(saved.getId(),
                    new ConnectionInfo(conn, saved.getDbType(), saved.getDatabase(), userId));
            return saved.getId();
        } catch (SQLException e) {
            throw new DatabaseException("创建连接失败: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteConnection(UUID userId, UUID connectionId) {
        assertOwner(userId, connectionId);
        ConnectionInfo info = liveConnections.remove(connectionId);
        if (info != null) {
            try {
                info.connection.close();
            } catch (SQLException ignored) {
            }
        }
        repository.deleteById(connectionId);
    }

    public void closeJdbc(UUID userId, UUID connectionId) {
        assertOwner(userId, connectionId);
        ConnectionInfo info = liveConnections.remove(connectionId);
        if (info != null) {
            try {
                info.connection.close();
            } catch (SQLException ignored) {
            }
        }
    }

    public Connection getConnection(UUID userId, UUID connectionId) {
        assertOwner(userId, connectionId);
        ConnectionInfo info = liveConnections.get(connectionId);
        if (info == null) {
            DbConnection entity = repository.findByIdAndUserId(connectionId, userId)
                    .orElseThrow(() -> new DatabaseException("连接不存在或已断开"));
            try {
                Connection conn = openJdbc(entity.getDbType(), entity.getHost(), entity.getPort(),
                        entity.getDbUsername(), entity.getDbPassword(), entity.getDatabase());
                info = new ConnectionInfo(conn, entity.getDbType(), entity.getDatabase(), userId);
                liveConnections.put(connectionId, info);
            } catch (SQLException e) {
                throw new DatabaseException("重新连接失败: " + e.getMessage());
            }
        }
        try {
            if (!info.connection.isValid(3)) {
                liveConnections.remove(connectionId);
                throw new DatabaseException("连接已失效,请重新创建");
            }
        } catch (SQLException e) {
            liveConnections.remove(connectionId);
            throw new DatabaseException("检查连接状态失败");
        }
        return info.connection;
    }

    public String getDbType(UUID userId, UUID connectionId) {
        assertOwner(userId, connectionId);
        ConnectionInfo info = liveConnections.get(connectionId);
        if (info != null) {
            return info.dbType;
        }
        return repository.findByIdAndUserId(connectionId, userId)
                .orElseThrow(() -> new DatabaseException("连接不存在"))
                .getDbType();
    }

    public String getDatabase(UUID userId, UUID connectionId) {
        assertOwner(userId, connectionId);
        ConnectionInfo info = liveConnections.get(connectionId);
        if (info != null) {
            return info.database;
        }
        return repository.findByIdAndUserId(connectionId, userId)
                .orElseThrow(() -> new DatabaseException("连接不存在"))
                .getDatabase();
    }

    public List<ConnectionView> listForUser(UUID userId) {
        return repository.findByUserId(userId).stream()
                .map(ConnectionView::from)
                .toList();
    }

    private void assertOwner(UUID userId, UUID connectionId) {
        DbConnection c = repository.findByIdAndUserId(connectionId, userId)
                .orElseThrow(() -> new DatabaseException("连接不存在或无权访问"));
        if (!c.getUserId().equals(userId)) {
            throw new DatabaseException("无权访问该连接");
        }
    }

    private Connection openJdbc(String type, String host, int port, String username, String password, String database)
            throws SQLException {
        String url = buildUrl(type, host, port, database);
        return DriverManager.getConnection(url, username, password);
    }

    private String buildUrl(String type, String host, int port, String database) {
        return switch (type) {
            case "mysql" -> "jdbc:mysql://" + host + ":" + port + "/" + database
                    + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
                    + "&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci";
            case "postgresql" -> "jdbc:postgresql://" + host + ":" + port + "/" + database;
            default -> throw new DatabaseException("不支持的数据库类型: " + type);
        };
    }

    private record ConnectionInfo(Connection connection, String dbType, String database, UUID userId) {
    }
}
