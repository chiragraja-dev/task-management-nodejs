const { DateTime } = require('mssql');
const { connectToDb, sql } = require('../config/db');
const { request, query } = require('express');

const createTask = async (req, res) => {
    try {
        const pool = await connectToDb();
        const request = await pool.request();
        const { title, description, status, priority, assignee_id, due_date, project_id } = req.body;

        if (!title || !status || !priority || !due_date || !project_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        request.input('title', sql.NVarChar(255), title);
        request.input('description', sql.NVarChar(sql.MAX), description);
        request.input('status', sql.NVarChar(50), status);
        request.input('priority', sql.NVarChar(10), priority);
        request.input('assignee_id', sql.Int, assignee_id);
        request.input('due_date', sql.Date, due_date);
        request.input('project_id', sql.Int, project_id);
        const query = `
            INSERT INTO tasks (title, description, status, priority, assignee_id, due_date, project_id)
            VALUES (@title, @description, @status, @priority, @assignee_id, @due_date, @project_id)
        `;
        await request.query(query)
        res.status(201).json({ message: "Task added successfully" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to add task', details: error.message });
    }
}

const updateTask = async (req, res) => {
    try {
        const pool = await connectToDb();
        const request = pool.request();
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Task ID is required to update a task' });
        }
        const { title, description, status, priority, assignee_id, due_date, project_id } = req.body;
        const updates = { title, description, status, priority, assignee_id, due_date, project_id }
        updates.updated_at = new Date();
        const updateField = Object.entries(updates).filter(([key, value]) => value !== undefined)

        if (updateField.length === 0) {
            return res.status(400).json({ error: 'No fields provided for update' });
        }
        updateField.forEach(([key, value]) => {
            if (typeof value === "string") {
                request.input(key, sql.NVarChar, value);
            } else if (typeof value === "number") {
                request.input(key, sql.Int, value);
            } else if (value instanceof Date) {
                request.input(key, sql.DateTime, value);
            } else if (value === null) {
                request.input(key, sql.NVarChar, null);
            }
        })

        request.input('id', sql.Int, id);

        const query = `
        UPDATE tasks 
        SET ${updateField?.map(([key]) => `${key}=@${key}`).join(', ')}
        where task_id = @id
        `
        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task', details: error.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const pool = await connectToDb();
        const request = pool.request();
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Task ID is required to delete a task' });
        }
        request.input('id', sql.Int, id);
        const query = `DELETE FROM tasks WHERE task_id = @id`;
        const result = await request.query(query);
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task', details: error.message });
    }
}

const getTask = async (req, res) => {
    try {
        const pool = await connectToDb();
        const request = pool.request();
        const { status, priority } = req.query;

        let query = `SELECT * FROM tasks`;

        const filter = []

        if (status) {
            filter.push(`status =@status`)
            request.input('status', sql.NVarChar(50), status);
        }

        if (priority) {
            filter.push(`priority=@priority`);
            request.input('priority', sql.NVarChar(10), priority);
        }

        if (filter.length > 0) {
            query += ` WHERE ` + filter.json(' AND ')
        }
        const result = await request.query(query);

        res.status(200).json({ tasks: result.recordsets })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks', details: error.message });
    }
}
module.exports = { createTask, updateTask, deleteTask, getTask }