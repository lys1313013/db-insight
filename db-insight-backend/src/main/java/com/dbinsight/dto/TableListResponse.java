package com.dbinsight.dto;

import java.util.List;

public class TableListResponse {
    private boolean success;
    private List<TableItem> data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public List<TableItem> getData() { return data; }
    public void setData(List<TableItem> data) { this.data = data; }

    public static class TableItem {
        private String tableName;
        private String tableComment;
        private int columnCount;

        public String getTableName() { return tableName; }
        public void setTableName(String tableName) { this.tableName = tableName; }
        public String getTableComment() { return tableComment; }
        public void setTableComment(String tableComment) { this.tableComment = tableComment; }
        public int getColumnCount() { return columnCount; }
        public void setColumnCount(int columnCount) { this.columnCount = columnCount; }
    }
}
