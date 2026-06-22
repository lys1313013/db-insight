package com.dbinsight.controller;

import com.dbinsight.dto.UpdateCommentRequest;
import com.dbinsight.security.CurrentUser;
import com.dbinsight.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/connections/{connectionId}/tables/{tableName}")
public class CommentController {

    private final CommentService commentService;
    private final CurrentUser currentUser;

    public CommentController(CommentService commentService, CurrentUser currentUser) {
        this.commentService = commentService;
        this.currentUser = currentUser;
    }

    @PatchMapping("/comment")
    public ResponseEntity<Map<String, Object>> updateTableComment(
            @PathVariable UUID connectionId,
            @PathVariable String tableName,
            @RequestBody UpdateCommentRequest request) {
        commentService.updateTableComment(currentUser.id(), connectionId, tableName, request.getComment());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/columns/{columnName}/comment")
    public ResponseEntity<Map<String, Object>> updateColumnComment(
            @PathVariable UUID connectionId,
            @PathVariable String tableName,
            @PathVariable String columnName,
            @RequestBody UpdateCommentRequest request) {
        commentService.updateColumnComment(currentUser.id(), connectionId, tableName, columnName, request.getComment());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
