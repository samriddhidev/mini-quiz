import express from "express";
import { authenticateToken } from "../middleware/verifyToken.js";
import {
  getQuestions,
  submitAnswer,
  postQuestion,
  startQuiz,
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/get-questions", authenticateToken, getQuestions);
router.post("/submit-answer", authenticateToken, submitAnswer);
router.post("/post-question", postQuestion);
router.get("/start-quiz", authenticateToken, startQuiz);

export default router;
