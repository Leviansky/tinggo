const db = require('../config/db');

class TaskModel {
    static async findAllByUser(userId, status, search, page, limit, sort) {
        let query = 'SELECT * FROM tasks WHERE user_id = ?';
        let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
        let queryParams = [userId];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            countQuery += ' AND status = ?';
            queryParams.push(status);
        }

        if (search) {
            query += ' AND title LIKE ?';
            countQuery += ' AND title LIKE ?';
            queryParams.push(`%${search}%`);
        }

        const sortDir = sort === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY (deadline IS NULL) ASC, deadline ${sortDir}, created_at DESC`;

        const [countResult] = await db.query(countQuery, queryParams);
        const total = countResult[0].total;

        if (page && limit) {
            const offset = (page - 1) * limit;
            query += ' LIMIT ? OFFSET ?';
            queryParams.push(parseInt(limit), parseInt(offset));
        }

        const [tasks] = await db.query(query, queryParams);
        return { data: tasks, total };
    }

    static async getSummaryByUser(userId) {
        const [rows] = await db.query('SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY status', [userId]);
        return rows;
    }

    static async findByIdAndUser(taskId, userId) {
        const [tasks] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
        return tasks.length > 0 ? tasks[0] : null;
    }

    static async create(userId, title, description, status, deadline) {
        const [result] = await db.query(
            'INSERT INTO tasks (user_id, title, description, status, deadline) VALUES (?, ?, ?, ?, ?)',
            [userId, title, description || null, status || 'pending', deadline || null]
        );
        return { id: result.insertId, title, description, status: status || 'pending', deadline };
    }

    static async update(taskId, userId, updateData) {
        const { title, description, status, deadline } = updateData;
        const [result] = await db.query(
            'UPDATE tasks SET title = ?, description = ?, status = ?, deadline = ? WHERE id = ? AND user_id = ?',
            [title, description, status, deadline, taskId, userId]
        );
        return result.affectedRows > 0;
    }

    static async delete(taskId, userId) {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
        return result.affectedRows > 0;
    }
}

module.exports = TaskModel;
