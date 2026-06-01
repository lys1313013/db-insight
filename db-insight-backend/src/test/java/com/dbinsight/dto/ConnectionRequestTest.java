package com.dbinsight.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ConnectionRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void validMySqlConnection() {
        ConnectionRequest request = new ConnectionRequest();
        request.setType("mysql");
        request.setHost("localhost");
        request.setPort(3306);
        request.setUsername("root");
        request.setPassword("password");
        request.setDatabase("testdb");

        Set<ConstraintViolation<ConnectionRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Valid MySQL connection should have no violations");
    }

    @Test
    void validPostgreSqlConnection() {
        ConnectionRequest request = new ConnectionRequest();
        request.setType("postgresql");
        request.setHost("localhost");
        request.setPort(5432);
        request.setUsername("postgres");
        request.setPassword("password");
        request.setDatabase("testdb");

        Set<ConstraintViolation<ConnectionRequest>> violations = validator.validate(request);
        assertTrue(violations.isEmpty(), "Valid PostgreSQL connection should have no violations");
    }

    @Test
    void invalidType() {
        ConnectionRequest request = new ConnectionRequest();
        request.setType("oracle");
        request.setHost("localhost");
        request.setPort(3306);
        request.setUsername("root");
        request.setPassword("password");
        request.setDatabase("testdb");

        Set<ConstraintViolation<ConnectionRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Invalid type should produce violation");
        assertTrue(violations.stream()
                .anyMatch(v -> v.getMessage().contains("mysql") || v.getMessage().contains("postgresql")));
    }

    @Test
    void missingHost() {
        ConnectionRequest request = new ConnectionRequest();
        request.setType("mysql");
        request.setHost("");
        request.setPort(3306);
        request.setUsername("root");
        request.setPassword("password");
        request.setDatabase("testdb");

        Set<ConstraintViolation<ConnectionRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Missing host should produce violation");
    }

    @Test
    void missingUsername() {
        ConnectionRequest request = new ConnectionRequest();
        request.setType("mysql");
        request.setHost("localhost");
        request.setPort(3306);
        request.setUsername("");
        request.setPassword("password");
        request.setDatabase("testdb");

        Set<ConstraintViolation<ConnectionRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Missing username should produce violation");
    }

    @Test
    void missingDatabase() {
        ConnectionRequest request = new ConnectionRequest();
        request.setType("mysql");
        request.setHost("localhost");
        request.setPort(3306);
        request.setUsername("root");
        request.setPassword("password");
        request.setDatabase("");

        Set<ConstraintViolation<ConnectionRequest>> violations = validator.validate(request);
        assertFalse(violations.isEmpty(), "Missing database should produce violation");
    }
}
