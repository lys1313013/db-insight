package com.dbinsight.controller;

import com.dbinsight.dto.ConnectionRequest;
import com.dbinsight.service.ConnectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
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
        String connectionId = connectionService.createConnection(request);
        Map<String, Object> response = new HashMap<>();
        response.put("connectionId", connectionId);
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<Map<String, Object>> disconnect(@PathVariable String connectionId) {
        connectionService.disconnect(connectionId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
