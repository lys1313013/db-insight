package com.dbinsight.controller;

import com.dbinsight.dto.UpdateCommentRequest;
import com.dbinsight.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/connections/{connectionId}/tables/{tableName}/comment")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PatchMapping
    public ResponseEntity<Map<String, Object>> updateTableComment(
            @PathVariable String connectionId,
            @PathVariable String tableName,
            @RequestBody UpdateCommentRequest request) {
        commentService.updateTableComment(connectionId, tableName, request.getComment());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
