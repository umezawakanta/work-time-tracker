import express, { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { TodoItem, ITodoItem } from "../models/TodoItem.js";

const router = express.Router();

const validateTodoItem = [
  body("task").notEmpty().withMessage("タスクは必須です"),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("completedはブール値である必要があります"),
];

router.post(
  "/",
  validateTodoItem,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const todoData: ITodoItem = new TodoItem({
        task: req.body.task,
        completed: req.body.completed,
      });

      const savedTodo = await todoData.save();
      res.status(201).json({
        message: "ToDoアイテムが正常に作成されました",
        todo: savedTodo,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const todos = await TodoItem.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  validateTodoItem,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedTodo = await TodoItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedTodo) {
        return res
          .status(404)
          .json({ message: "指定されたToDoアイテムが見つかりません" });
      }
      res.json({
        message: "ToDoアイテムが正常に更新されました",
        todo: updatedTodo,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deletedTodo = await TodoItem.findByIdAndDelete(req.params.id);
      if (!deletedTodo) {
        return res
          .status(404)
          .json({ message: "指定されたToDoアイテムが見つかりません" });
      }
      res.json({
        message: "ToDoアイテムが正常に削除されました",
        todo: deletedTodo,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
