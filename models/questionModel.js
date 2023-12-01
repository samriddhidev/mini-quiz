import mongoose from "mongoose";

const { Schema, model } = mongoose;

const optionSchema = new Schema({
  optionText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const questionSchema = new Schema({
  section: {
    type: String,
    required: true,
  },
  isParagraph: {
    type: Boolean,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [optionSchema],
    default: undefined,
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
  },
});

export default model("Question", questionSchema);
