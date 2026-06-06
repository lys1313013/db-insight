package com.dbinsight.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "db_connections")
public class DbConnection {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "db_type", nullable = false, length = 16)
    private String dbType;

    @Column(name = "host", nullable = false)
    private String host;

    @Column(name = "port", nullable = false)
    private int port;

    @Column(name = "db_username", nullable = false)
    private String dbUsername;

    @Column(name = "db_password", nullable = false)
    private String dbPassword;

    @Column(name = "database", nullable = false, length = 128)
    private String database;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected DbConnection() {
    }

    public DbConnection(UUID userId, String name, String dbType, String host, int port,
                        String dbUsername, String dbPassword, String database) {
        this.userId = userId;
        this.name = name;
        this.dbType = dbType;
        this.host = host;
        this.port = port;
        this.dbUsername = dbUsername;
        this.dbPassword = dbPassword;
        this.database = database;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getName() { return name; }
    public String getDbType() { return dbType; }
    public String getHost() { return host; }
    public int getPort() { return port; }
    public String getDbUsername() { return dbUsername; }
    public String getDbPassword() { return dbPassword; }
    public String getDatabase() { return database; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
