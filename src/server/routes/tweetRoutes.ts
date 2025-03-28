import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTweet, getTweets, updateTweet } from '../controllers/tweetController';
import { authMiddleware } from '../middleware/authMiddleware';
import { CustomRequest } from '../types/express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ファイルアップロードのためのmulter設定
const storage = multer.diskStorage({
  destination: (_req: CustomRequest, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, '../../../uploads/'));
  },
  filename: (_req: CustomRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// コントローラーの型が2引数であることを前提とした場合
const createTweetHandler = (req: CustomRequest, res: Response) => 
  createTweet(req, res);

const getTweetsHandler = (req: CustomRequest, res: Response) => 
  getTweets(req, res);

const updateTweetHandler = (req: CustomRequest, res: Response) => 
  updateTweet(req, res);

router.post('/', authMiddleware, upload.single('image'), createTweetHandler);
router.get('/', authMiddleware, getTweetsHandler);
router.put('/:id', authMiddleware, updateTweetHandler);

export default router;