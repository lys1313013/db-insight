package com.dbinsight.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class SecurityConfig {

    private final String jwtSecret;

    public SecurityConfig(@Value("${app.jwt.secret}") String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(o -> o.jwt(jwt -> jwt.decoder(jwtDecoder()))
                        .authenticationEntryPoint(jsonEntryPoint())
                        .accessDeniedHandler((req, res, ex) -> writeJsonError(res, HttpStatus.FORBIDDEN, "无权限"))
                )
                .exceptionHandling(e -> e.authenticationEntryPoint(jsonEntryPoint()));
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32 || keyBytes.length > 47) {
            throw new IllegalStateException(
                    "app.jwt.secret must be 32–47 bytes (HS256); got " + keyBytes.length);
        }
        return NimbusJwtDecoder.withSecretKey(Keys.hmacShaKeyFor(keyBytes))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Authorization"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    private org.springframework.security.web.AuthenticationEntryPoint jsonEntryPoint() {
        return (request, response, authException) -> {
            String message = "未认证,请先登录";
            Throwable cause = authException.getCause();
            if (authException.getMessage() != null && authException.getMessage().toLowerCase().contains("jwt")) {
                message = "Token 无效或已过期";
            } else if (cause != null && cause.getClass().getName().toLowerCase().contains("jwt")) {
                message = "Token 无效或已过期";
            }
            writeJsonError(response, HttpStatus.UNAUTHORIZED, message);
        };
    }

    private void writeJsonError(jakarta.servlet.http.HttpServletResponse response,
                                HttpStatus status, String message) throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }
}
