package com.dbinsight.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Component
public class ConnectionFileManager {

    private static final Path FILE_PATH = Path.of(System.getProperty("user.home"), ".db-insight", "connections.json");
    private static final ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

    public void save(String connectionId, ConnectionConfig config) {
        Map<String, ConnectionConfig> all = loadAll();
        all.put(connectionId, config);
        writeAll(all);
    }

    public void remove(String connectionId) {
        Map<String, ConnectionConfig> all = loadAll();
        all.remove(connectionId);
        writeAll(all);
    }

    public Map<String, ConnectionConfig> loadAll() {
        if (!Files.exists(FILE_PATH)) {
            return new HashMap<>();
        }
        try {
            byte[] bytes = Files.readAllBytes(FILE_PATH);
            if (bytes.length == 0) {
                return new HashMap<>();
            }
            return new HashMap<>(mapper.readValue(bytes, mapper.getTypeFactory().constructMapType(HashMap.class, String.class, ConnectionConfig.class)));
        } catch (IOException e) {
            return new HashMap<>();
        }
    }

    private void writeAll(Map<String, ConnectionConfig> all) {
        try {
            Files.createDirectories(FILE_PATH.getParent());
            mapper.writeValue(FILE_PATH.toFile(), all);
        } catch (IOException e) {
            // ignore write error
        }
    }

    public record ConnectionConfig(String type, String host, int port, String username, String password, String database) {
    }
}
