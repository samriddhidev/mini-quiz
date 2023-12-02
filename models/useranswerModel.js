import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userAnswerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: "Question", // Reference to the Question model
    required: true,
  },
  selectedOption: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

export default model("UserAnswer", userAnswerSchema);
