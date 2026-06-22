package com.dbinsight.controller;

import com.dbinsight.dto.ConnectionRequest;
import com.dbinsight.dto.ConnectionView;
import com.dbinsight.security.CurrentUser;
import com.dbinsight.service.ConnectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;
    private final CurrentUser currentUser;

    public ConnectionController(ConnectionService connectionService, CurrentUser currentUser) {
        this.connectionService = connectionService;
        this.currentUser = currentUser;
    }

    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection(@Valid @RequestBody ConnectionRequest request) {
        String message = connectionService.testConnection(request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createConnection(@Valid @RequestBody ConnectionRequest request) {
        UUID userId = currentUser.id();
        UUID connectionId = connectionService.createConnection(userId, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("connectionId", connectionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ConnectionView>> listConnections() {
        return ResponseEntity.ok(connectionService.listForUser(currentUser.id()));
    }

    @PostMapping("/{connectionId}/disconnect")
    public ResponseEntity<Map<String, Object>> closeJdbc(@PathVariable UUID connectionId) {
        connectionService.closeJdbc(currentUser.id(), connectionId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<Map<String, Object>> deleteConnection(@PathVariable UUID connectionId) {
        connectionService.deleteConnection(currentUser.id(), connectionId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{connectionId}")
    public ResponseEntity<Map<String, Object>> updateConnection(
            @PathVariable UUID connectionId,
            @Valid @RequestBody ConnectionRequest request) {
        connectionService.updateConnection(currentUser.id(), connectionId, request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
