import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../../src/server/config/database';
import { TodoModel } from '../../src/server/models/Todo';
import { withAuth, AuthenticatedRequest } from '../../src/middleware/auth';

const handler = async (req: AuthenticatedRequest, res: VercelResponse): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    const { id } = req.query;
    const userId = req.user!.userId;

    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Todo ID is required',
        message: 'TodoのIDが必要です',
      });
      return;
    }

    if (req.method === 'GET') {
      // Get individual todo
      const todo = await TodoModel.findOne({
        $or: [{ _id: id }, { id: id }],
        userId,
      });

      if (!todo) {
        res.status(404).json({
          success: false,
          error: 'Todo not found',
          message: '指定されたTodoが見つかりません',
        });
        return;
      }

      console.log('✅ Todo retrieved:', { id, userId, title: todo.title });

      res.status(200).json({
        success: true,
        data: todo,
        message: 'Todoを取得しました',
      });
    } else if (req.method === 'PUT') {
      // Update todo
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData._id;
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const todo = await TodoModel.findOneAndUpdate(
        {
          $or: [{ _id: id }, { id: id }],
          userId,
        },
        updateData,
        { new: true, runValidators: true }
      );

      if (!todo) {
        res.status(404).json({
          success: false,
          error: 'Todo not found',
          message: '指定されたTodoが見つかりません',
        });
        return;
      }

      console.log('✅ Todo updated:', {
        id,
        userId,
        title: todo.title,
        completed: todo.completed,
        priority: todo.priority,
      });

      res.status(200).json({
        success: true,
        data: todo,
        message: 'Todoを更新しました',
      });
    } else if (req.method === 'DELETE') {
      // Delete todo
      const todo = await TodoModel.findOneAndDelete({
        $or: [{ _id: id }, { id: id }],
        userId,
      });

      if (!todo) {
        res.status(404).json({
          success: false,
          error: 'Todo not found',
          message: '指定されたTodoが見つかりません',
        });
        return;
      }

      console.log('✅ Todo deleted:', {
        id,
        userId,
        title: todo.title,
      });

      res.status(200).json({
        success: true,
        data: { id: todo.id },
        message: 'Todoを削除しました',
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
    }
  } catch (error) {
    console.error('❌ Todo API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Todoの処理中にエラーが発生しました',
    });
  }
};

// Export with authentication
export default withAuth(handler, {
  requireAuth: true,
  requireVerified: false, // Allow unverified users for development
});
