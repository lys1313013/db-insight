package com.dbinsight.service;

import com.dbinsight.model.ColumnInfo;
import com.dbinsight.model.TableInfo;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SchemaServiceTest {

    @Test
    void tableInfoCreation() {
        TableInfo table = new TableInfo();
        table.setTableName("users");
        table.setTableComment("用户表");
        table.setColumnCount(4);
        table.setColumnNames("id, username, email, created_at");

        assertEquals("users", table.getTableName());
        assertEquals("用户表", table.getTableComment());
        assertEquals(4, table.getColumnCount());
        assertEquals("id, username, email, created_at", table.getColumnNames());
    }

    @Test
    void columnInfoCreation() {
        ColumnInfo column = new ColumnInfo();
        column.setColumnName("id");
        column.setDataType("bigint");
        column.setColumnKey("PRI");
        column.setIsNullable("NO");
        column.setColumnDefault(null);
        column.setColumnComment("主键ID");

        assertEquals("id", column.getColumnName());
        assertEquals("bigint", column.getDataType());
        assertEquals("PRI", column.getColumnKey());
        assertEquals("NO", column.getIsNullable());
        assertNull(column.getColumnDefault());
        assertEquals("主键ID", column.getColumnComment());
    }

    @Test
    void tableInfoWithColumnsAndIndexes() {
        TableInfo table = new TableInfo();
        table.setTableName("orders");

        ColumnInfo col1 = new ColumnInfo();
        col1.setColumnName("id");
        col1.setDataType("bigint");
        col1.setColumnKey("PRI");

        ColumnInfo col2 = new ColumnInfo();
        col2.setColumnName("user_id");
        col2.setDataType("bigint");
        col2.setColumnKey("MUL");

        table.setColumns(List.of(col1, col2));
        table.setColumnCount(table.getColumns().size());

        assertEquals(2, table.getColumnCount());
        assertEquals(2, table.getColumns().size());
        assertEquals("id", table.getColumns().get(0).getColumnName());
        assertEquals("user_id", table.getColumns().get(1).getColumnName());
    }
}
