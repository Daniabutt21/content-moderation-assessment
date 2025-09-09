import { Router } from 'express';
import { ModerationController } from '../controllers/moderationController';
import { ContentModerator } from '../services/contentModerator';
import { GeminiService } from '../services/geminiService';

const router = Router();

// Initialize services - this will be called after dotenv.config() in app.ts
const geminiService = new GeminiService(process.env.GEMINI_API_KEY || '');
const contentModerator = new ContentModerator(geminiService);
const moderationController = new ModerationController(contentModerator);

router.post('/', moderationController.moderateContent.bind(moderationController));
router.post('/batch', moderationController.moderateBatch.bind(moderationController));
router.get('/categories', moderationController.getCategories.bind(moderationController));

export default router;
