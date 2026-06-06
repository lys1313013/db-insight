package com.dbinsight.repository;

import com.dbinsight.entity.DbConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DbConnectionRepository extends JpaRepository<DbConnection, UUID> {

    List<DbConnection> findByUserId(UUID userId);

    Optional<DbConnection> findByIdAndUserId(UUID id, UUID userId);
}
