package com.dbinsight.dto;

import com.dbinsight.entity.DbConnection;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ConnectionView(
        UUID id,
        String name,
        String dbType,
        String host,
        int port,
        String username,
        String database,
        OffsetDateTime createdAt
) {
    public static ConnectionView from(DbConnection c) {
        return new ConnectionView(
                c.getId(),
                c.getName(),
                c.getDbType(),
                c.getHost(),
                c.getPort(),
                c.getDbUsername(),
                c.getDatabase(),
                c.getCreatedAt()
        );
    }
}
