import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';

const router = Router();

// All task routes require authentication
router.use(protect);

// GET /tasks
router.get('/', getTasks);

// POST /tasks
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Task title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  ],
  createTask
);

// PATCH /tasks/:id
router.patch(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty().withMessage('Title cannot be empty')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('completed')
      .optional()
      .isBoolean().withMessage('Completed must be a boolean'),
  ],
  updateTask
);

// DELETE /tasks/:id
router.delete('/:id', deleteTask);

export default router;
