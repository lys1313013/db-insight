package com.dbinsight.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ConnectionRequest {

    @NotBlank(message = "数据库类型不能为空")
    @Pattern(regexp = "mysql|postgresql", message = "仅支持 mysql 或 postgresql")
    private String type;

    @NotBlank(message = "主机地址不能为空")
    private String host;

    private int port = 3306;

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @NotBlank(message = "数据库名不能为空")
    private String database;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getHost() { return host; }
    public void setHost(String host) { this.host = host; }
    public int getPort() { return port; }
    public void setPort(int port) { this.port = port; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }
}
