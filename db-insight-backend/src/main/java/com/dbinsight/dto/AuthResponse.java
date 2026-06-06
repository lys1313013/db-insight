package com.dbinsight.dto;

import java.util.UUID;

public record AuthResponse(String token, UserView user) {

    public record UserView(UUID id, String username) {
    }
}
