import Question from "../models/questionModel.js";
import Passage from "../models/passageModel.js";
import UserAnswer from "../models/useranswerModel.js";

export const getQuestions = async (req, res) => {};

export const submitAnswer = async (req, res) => {
  try {
    const user = req.user;
    const { questionId, selectedOption } = req.body;

    // Fetch the question based on the provided questionId
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if the selectedOption is correct
    const isCorrect =
      question.correctAnswerIndex === parseInt(selectedOption, 10);

    // Save the user's answer to the database
    const userAnswer = new UserAnswer({
      user: user._id,
      question: question._id,
      selectedOption,
      isCorrect,
    });
    await userAnswer.save();

    // Provide the appropriate message based on correctness
    const message = isCorrect
      ? "Your answer is correct!"
      : "Incorrect answer. Try again.";

    res.status(200).json({
      message,
      // You might include additional information in the response based on your needs
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit answer" });
  }
};

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

const excludeIsCorrectField = (questions) => {
  return questions.map((question) => {
    const { isCorrect, ...questionWithoutIsCorrect } = question;
    return {
      questionText: questionWithoutIsCorrect.questionText,
      options: questionWithoutIsCorrect.options,
    };
  });
};

export const startQuiz = async (req, res) => {
  const sections = ["verbal", "reasoning", "other", "quantitative"];
  const selectedQuestions = [];

  try {
    for (const section of sections) {
      const questions = await Question.aggregate([
        { $match: { section } },
        { $sample: { size: 5 } },
        {
          $project: {
            isParagraph: 0, // Exclude isParagraph field
            correctAnswerIndex: 0, // Exclude correctAnswerIndex field
            "options.isCorrect": 0, // Exclude isCorrect field from options array
            __v: 0, // Exclude version field
          },
        },
      ]);
      selectedQuestions.push(...questions);
    }

    res.json({ questions: selectedQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
