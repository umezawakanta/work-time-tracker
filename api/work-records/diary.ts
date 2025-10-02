import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// データベース接続
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI || '', {
      dbName: 'workTimeTracker'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// 日記のスキーマ
const WorkDiarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, enum: ['1', '2', '3', '4', '5'], default: '3' },
  tags: [{ type: String }],
  isPrivate: { type: Boolean, default: true },
  // 新しい項目
  activities: [{ type: String }],
  workSummary: { type: String, default: '' },
  achievements: [{ type: String }],
  challenges: [{ type: String }],
  learnings: [{ type: String }],
  nextGoals: [{ type: String }],
  energyLevel: { type: Number, min: 1, max: 10, default: 5 },
  stressLevel: { type: Number, min: 1, max: 10, default: 5 },
  workHours: { type: Number, default: 0 },
  breakTime: { type: Number, default: 0 },
  productivity: { type: Number, min: 1, max: 10, default: 5 },
  notes: { type: String, default: '' },
  gratitude: { type: String, default: '' },
  reflection: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WorkDiary = mongoose.models.WorkDiary || mongoose.model('WorkDiary', WorkDiarySchema);

// JWT認証ヘルパー関数
type JWTRequest = { headers: { authorization?: string } };

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

const verifyJWT = (req: JWTRequest): JWTPayload | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  // トークンの基本検証
  if (!token || token.length === 0) {
    console.error('Empty or malformed token');
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set. Refusing to verify JWT.');
      return null;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // 型安全性のための検証
    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      console.error('Invalid JWT payload structure');
      return null;
    }

    // トークンの有効期限をチェック
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      console.error('JWT token has expired');
      return null;
    }

    // 必須フィールドの検証
    if (!decoded.email || !decoded.role) {
      console.error('JWT payload missing required fields');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? /^https:\/\/.*\.vercel\.app$/.test(req.headers.origin) ? req.headers.origin : 'https://work-time-tracker-five.vercel.app'
    : '*'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  try {
    if (req.method === 'GET') {
      // 日記一覧を取得
      const { userId, isPrivate } = req.query;
      
      // セキュリティのため、JWT認証を優先してユーザーIDを取得
      const user = verifyJWT(req);
      let actualUserId = null;
      
      if (user && user.id) {
        // JWT認証が成功した場合、JWTのユーザーIDを使用
        actualUserId = user.id;
        console.log('User ID obtained from JWT token:', actualUserId);
      } else if (userId) {
        // JWT認証が失敗した場合のみ、クエリパラメータをフォールバックとして使用
        console.warn('JWT authentication failed, falling back to query parameter');
        actualUserId = userId;
      }
      
      if (!actualUserId) {
        console.warn('User ID not available from JWT token or query parameters');
        return res.status(400).json({ 
          success: false, 
          message: '認証が必要です' 
        });
      }

      const query: any = { userId: actualUserId };
      if (isPrivate !== undefined) {
        query.isPrivate = isPrivate === 'true';
      }

      const diaries = await WorkDiary.find(query)
        .sort({ date: -1 })
        .limit(50);


      res.status(200).json({
        success: true,
        diaries
      });

    } else if (req.method === 'POST') {
      // 新しい日記を作成
      const { 
        userId, date, title, content, mood, tags, isPrivate,
        activities, workSummary, achievements, challenges, learnings, nextGoals,
        energyLevel, stressLevel, workHours, breakTime, productivity,
        notes, gratitude, reflection
      } = req.body;

      console.log('Received diary creation request:', {
        userId, date, title, content, mood, energyLevel, stressLevel, productivity
      });

      // セキュリティのため、JWT認証を優先してユーザーIDを取得
      const user = verifyJWT(req);
      let actualUserId = null;
      
      if (user && user.id) {
        // JWT認証が成功した場合、JWTのユーザーIDを使用
        actualUserId = user.id;
        console.log('User ID obtained from JWT token for POST:', actualUserId);
      } else if (userId) {
        // JWT認証が失敗した場合のみ、リクエストボディのユーザーIDをフォールバックとして使用
        console.warn('JWT authentication failed for POST, falling back to request body');
        actualUserId = userId;
      }

      if (!actualUserId || !date || !title || !content) {
        console.error('Missing required fields:', { actualUserId, date, title, content });
        return res.status(400).json({
          success: false,
          message: '必須フィールドが不足しています'
        });
      }

      // 日本時間で保存するため、UTC時間に変換
      const jstDate = new Date(date);
      const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
      
      const diaryData = {
        userId: actualUserId,
        date: utcDate,
        title,
        content,
        mood: mood || '3',
        tags: tags || [],
        isPrivate: isPrivate !== undefined ? isPrivate : true,
        // 新しい項目
        activities: activities || [],
        workSummary: workSummary || '',
        achievements: achievements || [],
        challenges: challenges || [],
        learnings: learnings || [],
        nextGoals: nextGoals || [],
        energyLevel: energyLevel || 5,
        stressLevel: stressLevel || 5,
        workHours: workHours || 0,
        breakTime: breakTime || 0,
        productivity: productivity || 5,
        notes: notes || '',
        gratitude: gratitude || '',
        reflection: reflection || ''
      };

      console.log('Creating diary with data:', diaryData);

      const diary = new WorkDiary(diaryData);

      try {
        await diary.save();
        console.log('Diary saved successfully:', diary._id);
      } catch (saveError) {
        console.error('Error saving diary:', saveError);
        throw saveError;
      }

      res.status(201).json({
        success: true,
        message: '日記が作成されました',
        diary
      });

    } else if (req.method === 'PUT') {
      // 日記を更新
      const { 
        id, userId, date, title, content, mood, tags, isPrivate,
        activities, workSummary, achievements, challenges, learnings, nextGoals,
        energyLevel, stressLevel, workHours, breakTime, productivity,
        notes, gratitude, reflection
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '日記IDが必要です'
        });
      }

      // セキュリティのため、JWT認証を優先してユーザーIDを取得
      const user = verifyJWT(req);
      let actualUserId = null;
      
      if (user && user.id) {
        // JWT認証が成功した場合、JWTのユーザーIDを使用
        actualUserId = user.id;
        console.log('User ID obtained from JWT token for PUT:', actualUserId);
      } else if (userId) {
        // JWT認証が失敗した場合のみ、リクエストボディのユーザーIDをフォールバックとして使用
        console.warn('JWT authentication failed for PUT, falling back to request body');
        actualUserId = userId;
      }

      const updateData: any = {
        updatedAt: new Date()
      };

      if (date) {
        const jstDate = new Date(date);
        const utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
        updateData.date = utcDate;
      }
      if (title) {
        updateData.title = title;
      }
      if (content) {
        updateData.content = content;
      }
      if (mood) {
        updateData.mood = mood;
      }
      if (tags) {
        updateData.tags = tags;
      }
      if (isPrivate !== undefined) {
        updateData.isPrivate = isPrivate;
      }
      
      // 新しい項目の処理
      if (activities) { updateData.activities = activities; }
      if (workSummary !== undefined) { updateData.workSummary = workSummary; }
      if (achievements) { updateData.achievements = achievements; }
      if (challenges) { updateData.challenges = challenges; }
      if (learnings) { updateData.learnings = learnings; }
      if (nextGoals) { updateData.nextGoals = nextGoals; }
      if (energyLevel !== undefined) { updateData.energyLevel = energyLevel; }
      if (stressLevel !== undefined) { updateData.stressLevel = stressLevel; }
      if (workHours !== undefined) { updateData.workHours = workHours; }
      if (breakTime !== undefined) { updateData.breakTime = breakTime; }
      if (productivity !== undefined) { updateData.productivity = productivity; }
      if (notes !== undefined) { updateData.notes = notes; }
      if (gratitude !== undefined) { updateData.gratitude = gratitude; }
      if (reflection !== undefined) { updateData.reflection = reflection; }

      // ユーザーIDが提供されている場合は、そのユーザーの日記のみ更新可能にする
      const query: any = { _id: id };
      if (actualUserId) {
        query.userId = actualUserId;
      }

      const diary = await WorkDiary.findOneAndUpdate(
        query,
        updateData,
        { new: true }
      );

      if (!diary) {
        return res.status(404).json({
          success: false,
          message: '日記が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: '日記が更新されました',
        diary
      });

    } else if (req.method === 'DELETE') {
      // 日記を削除
      const { id, userId } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: '日記IDが必要です'
        });
      }

      // セキュリティのため、JWT認証を優先してユーザーIDを取得
      const user = verifyJWT(req);
      let actualUserId = null;
      
      if (user && user.id) {
        // JWT認証が成功した場合、JWTのユーザーIDを使用
        actualUserId = user.id;
        console.log('User ID obtained from JWT token for DELETE:', actualUserId);
      } else if (userId) {
        // JWT認証が失敗した場合のみ、クエリパラメータのユーザーIDをフォールバックとして使用
        console.warn('JWT authentication failed for DELETE, falling back to query parameter');
        actualUserId = userId;
      }

      // ユーザーIDが提供されている場合は、そのユーザーの日記のみ削除可能にする
      const query: any = { _id: id };
      if (actualUserId) {
        query.userId = actualUserId;
      }

      const diary = await WorkDiary.findOneAndDelete(query);

      if (!diary) {
        return res.status(404).json({
          success: false,
          message: '日記が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        message: '日記が削除されました'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Work diary API error:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
