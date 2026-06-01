package com.dbinsight.model;

public class ColumnInfo {
    private String columnName;
    private String dataType;
    private String columnKey;
    private String isNullable;
    private String columnDefault;
    private String columnComment;

    public String getColumnName() { return columnName; }
    public void setColumnName(String columnName) { this.columnName = columnName; }
    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }
    public String getColumnKey() { return columnKey; }
    public void setColumnKey(String columnKey) { this.columnKey = columnKey; }
    public String getIsNullable() { return isNullable; }
    public void setIsNullable(String isNullable) { this.isNullable = isNullable; }
    public String getColumnDefault() { return columnDefault; }
    public void setColumnDefault(String columnDefault) { this.columnDefault = columnDefault; }
    public String getColumnComment() { return columnComment; }
    public void setColumnComment(String columnComment) { this.columnComment = columnComment; }
}
