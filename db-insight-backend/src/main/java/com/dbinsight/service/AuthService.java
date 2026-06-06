package com.dbinsight.service;

import com.dbinsight.dto.AuthResponse;
import com.dbinsight.entity.User;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthService(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    public AuthResponse register(String username, String password) {
        User user = userService.register(username, password);
        String token = jwtService.issue(user.getId(), user.getUsername());
        return new AuthResponse(token, new AuthResponse.UserView(user.getId(), user.getUsername()));
    }

    public AuthResponse login(String username, String password) {
        User user = userService.authenticate(username, password);
        String token = jwtService.issue(user.getId(), user.getUsername());
        return new AuthResponse(token, new AuthResponse.UserView(user.getId(), user.getUsername()));
    }
}
