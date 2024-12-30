const express = require('express');
const { createTask, updateTask, deleteTask, getTask } = require('../controllers/taskController')
const router = express.Router()

router.post('/add-task', createTask)
router.put('/update-task', updateTask)
router.delete('/delete-task', deleteTask)
router.get('/get-task', getTask)
module.exports = router