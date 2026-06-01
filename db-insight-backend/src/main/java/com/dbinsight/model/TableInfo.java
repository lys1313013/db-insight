package com.dbinsight.model;

import java.util.List;

public class TableInfo {
    private String tableName;
    private String tableComment;
    private int columnCount;
    private String columnNames;
    private List<ColumnInfo> columns;
    private List<IndexInfo> indexes;

    public String getTableName() { return tableName; }
    public void setTableName(String tableName) { this.tableName = tableName; }
    public String getTableComment() { return tableComment; }
    public void setTableComment(String tableComment) { this.tableComment = tableComment; }
    public int getColumnCount() { return columnCount; }
    public void setColumnCount(int columnCount) { this.columnCount = columnCount; }
    public String getColumnNames() { return columnNames; }
    public void setColumnNames(String columnNames) { this.columnNames = columnNames; }
    public List<ColumnInfo> getColumns() { return columns; }
    public void setColumns(List<ColumnInfo> columns) { this.columns = columns; }
    public List<IndexInfo> getIndexes() { return indexes; }
    public void setIndexes(List<IndexInfo> indexes) { this.indexes = indexes; }
}
