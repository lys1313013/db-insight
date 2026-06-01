package com.dbinsight.controller;

import com.dbinsight.model.TableInfo;
import com.dbinsight.service.ConnectionService;
import com.dbinsight.service.SchemaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections/{connectionId}")
public class SchemaController {

    private final SchemaService schemaService;
    private final ConnectionService connectionService;

    public SchemaController(SchemaService schemaService, ConnectionService connectionService) {
        this.schemaService = schemaService;
        this.connectionService = connectionService;
    }

    @GetMapping("/tables")
    public ResponseEntity<Map<String, Object>> getTables(@PathVariable String connectionId) {
        List<TableInfo> tables = schemaService.getTables(connectionId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", tables);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tables/{tableName}")
    public ResponseEntity<Map<String, Object>> getTableDetail(
            @PathVariable String connectionId,
            @PathVariable String tableName) {
        TableInfo table = schemaService.getTableDetail(connectionId, tableName);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", table);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export/markdown")
    public ResponseEntity<Map<String, Object>> exportMarkdown(@PathVariable String connectionId) {
        String content = schemaService.exportMarkdown(connectionId);
        String database = connectionService.getDatabase(connectionId);
        Map<String, Object> data = new HashMap<>();
        data.put("content", content);
        data.put("database", database);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }
}
