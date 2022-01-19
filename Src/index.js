import express from "express";
import "./db/Mongoose.js";
import { taskRoutes } from "./routes/task.js";
import { userRoutes } from "./routes/user.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.get("*", async (req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log("app started at " + port);
});
