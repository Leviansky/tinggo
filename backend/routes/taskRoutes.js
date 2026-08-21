const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createTaskSchema, updateTaskSchema } = require('../schemas/taskSchema');

// Apply auth middleware to all task routes
router.use(authMiddleware);

router.get('/summary', taskController.getTaskSummary);
router.get('/', taskController.getTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
