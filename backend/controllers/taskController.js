const TaskModel = require('../models/taskModel');

exports.getTasks = async (req, res) => {
    const userId = req.user.id;
    const { status, search, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const { data: tasks, total } = await TaskModel.findAllByUser(userId, status, search, page, limit, sort);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.status(200).json({ 
        code: 200, 
        status: true, 
        message: 'Tasks retrieved successfully', 
        data: tasks,
        meta: {
            current_page: page,
            per_page: limit,
            total_items: total,
            total_pages: totalPages
        }
    });
};

exports.getTaskSummary = async (req, res) => {
    const userId = req.user.id;
    const summaryData = await TaskModel.getSummaryByUser(userId);
    
    const counts = {
        all: 0,
        pending: 0,
        'in-progress': 0,
        done: 0
    };

    summaryData.forEach(row => {
        counts[row.status] = row.count;
        counts.all += row.count;
    });

    res.status(200).json({
        code: 200,
        status: true,
        message: 'Task summary retrieved successfully',
        data: counts
    });
};

exports.createTask = async (req, res) => {
    const userId = req.user.id;
    const { title, description, status, deadline } = req.body;

    const task = await TaskModel.create(userId, title, description, status, deadline);

    res.status(201).json({
        code: 201,
        status: true,
        message: 'Task created successfully',
        data: task
    });
};

exports.updateTask = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, status, deadline } = req.body;

    const existingTask = await TaskModel.findByIdAndUser(taskId, userId);
    if (!existingTask) {
        return res.status(404).json({ code: 404, status: false, message: 'Task not found', data: null });
    }

    await TaskModel.update(taskId, userId, {
        title: title || existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        status: status || existingTask.status,
        deadline: deadline !== undefined ? deadline : existingTask.deadline
    });

    res.status(200).json({ code: 200, status: true, message: 'Task updated successfully', data: null });
};

exports.deleteTask = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;

    const deleted = await TaskModel.delete(taskId, userId);
    if (!deleted) {
        return res.status(404).json({ code: 404, status: false, message: 'Task not found', data: null });
    }

    res.status(200).json({ code: 200, status: true, message: 'Task deleted successfully', data: null });
};
