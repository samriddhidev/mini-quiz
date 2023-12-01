import Question from "../models/questionModel.js";
import Passage from "../models/passageModel.js";

export const getQuestions = async (req, res) => {};

export const submitAnswer = async (req, res) => {};

export const postQuestion = async (req, res) => {
  const { questions } = req.body;

  try {
    const questionPromises = questions.map(async (questionData) => {
      const {
        section,
        isParagraph,
        questionText,
        options,
        correctAnswerIndex,
      } = questionData;

      let passageId = null;
      if (isParagraph) {
        const { passageContent } = questionData;
        const newPassage = new Passage({ content: passageContent });
        await newPassage.save();
        passageId = newPassage._id;
      }

      const newQuestion = new Question({
        section,
        isParagraph,
        questionText,
        options,
        correctAnswerIndex,
        passage: passageId,
      });

      await newQuestion.save();
    });

    await Promise.all(questionPromises);

    res
      .status(201)
      .json({ success: true, message: "Questions posted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to post questions" });
  }
};

export const startQuiz = async (req, res) => {
  const sections = ["verbal", "reasoning", "other", "quantitative"];
  const selectedQuestions = [];

  try {
    for (const section of sections) {
      const questions = await Question.aggregate([
        { $match: { section } },
        { $sample: { size: 5 } },
      ]);
      selectedQuestions.push(...questions);
    }

    res.json({ questions: selectedQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
