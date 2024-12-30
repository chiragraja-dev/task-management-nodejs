const sql = require('mssql');

const tasksColumnMapping = {
    title: sql.NVarChar(255),
    description: sql.NVarChar(sql.MAX),
    status: sql.NVarChar(50),
    priority: sql.NVarChar(10),
    assignee_id: sql.Int,
    due_date: sql.Date,
    created_at: sql.DateTime,
    updated_at: sql.DateTime,
    project_id: sql.Int,
};

module.exports = {
    tasksColumnMapping,
};
