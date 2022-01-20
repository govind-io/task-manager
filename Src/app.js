import express from "express";
import "./db/Mongoose.js";
import { taskRoutes } from "./routes/task.js";
import { userRoutes } from "./routes/user.js";
export const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.get("*", async (req, res) => {
  res.status(404).send("Not found");
});
