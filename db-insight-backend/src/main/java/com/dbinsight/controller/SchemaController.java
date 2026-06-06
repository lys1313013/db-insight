package com.dbinsight.controller;

import com.dbinsight.model.ColumnInfo;
import com.dbinsight.model.TableInfo;
import com.dbinsight.security.CurrentUser;
import com.dbinsight.service.ConnectionService;
import com.dbinsight.service.SchemaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/connections/{connectionId}")
public class SchemaController {

    private final SchemaService schemaService;
    private final ConnectionService connectionService;
    private final CurrentUser currentUser;

    public SchemaController(SchemaService schemaService,
                            ConnectionService connectionService,
                            CurrentUser currentUser) {
        this.schemaService = schemaService;
        this.connectionService = connectionService;
        this.currentUser = currentUser;
    }

    @GetMapping("/tables")
    public ResponseEntity<Map<String, Object>> getTables(@PathVariable UUID connectionId) {
        UUID userId = currentUser.id();
        List<TableInfo> tables = schemaService.getTables(userId, connectionId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", tables);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/columns")
    public ResponseEntity<Map<String, Object>> getAllColumns(@PathVariable UUID connectionId) {
        UUID userId = currentUser.id();
        List<ColumnInfo> columns = schemaService.getAllColumns(userId, connectionId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", columns);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tables/{tableName}")
    public ResponseEntity<Map<String, Object>> getTableDetail(
            @PathVariable UUID connectionId,
            @PathVariable String tableName) {
        UUID userId = currentUser.id();
        TableInfo table = schemaService.getTableDetail(userId, connectionId, tableName);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", table);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export/markdown")
    public ResponseEntity<Map<String, Object>> exportMarkdown(@PathVariable UUID connectionId) {
        UUID userId = currentUser.id();
        String content = schemaService.exportMarkdown(userId, connectionId);
        String database = connectionService.getDatabase(userId, connectionId);
        Map<String, Object> data = new HashMap<>();
        data.put("content", content);
        data.put("database", database);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}
