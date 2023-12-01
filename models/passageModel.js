import mongoose from "mongoose";

const { Schema, model } = mongoose;

const passageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
});

export default model("Passage", passageSchema);
