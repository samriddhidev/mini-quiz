import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/userRoute.js";
import questionRouter from "./routes/questionRoute.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 8000 || process.env.PORT;

app.get("/", (req, res) => {
  res.send("Api is working");
});

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log("Error while connecting to database");
  }
};

app.use("/api/user", userRouter);
app.use("/api/question", questionRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`server is running on ${PORT}`);
});
