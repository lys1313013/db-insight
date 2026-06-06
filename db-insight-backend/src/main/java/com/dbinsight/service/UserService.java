package com.dbinsight.service;

import com.dbinsight.entity.User;
import com.dbinsight.exception.AuthException;
import com.dbinsight.exception.ConflictException;
import com.dbinsight.repository.UserRepository;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final Argon2PasswordEncoder passwordEncoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User register(String username, String rawPassword) {
        String normalized = username.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByUsernameIgnoreCase(normalized)) {
            throw new ConflictException("用户名已被占用");
        }
        User user = new User(UUID.randomUUID(), normalized, passwordEncoder.encode(rawPassword));
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User authenticate(String username, String rawPassword) {
        String normalized = username.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByUsernameIgnoreCase(normalized)
                .orElseThrow(() -> new AuthException("用户名或密码错误"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new AuthException("用户名或密码错误");
        }
        return user;
    }
}
