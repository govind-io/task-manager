import express from "express";
import { Task } from "../db/models/tasks.js";
import Auth from "../Utils/Auth.js";
export const taskRoutes = new express.Router();
taskRoutes.post("", Auth, async function (req, res) {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

taskRoutes.get("", Auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed == "true";
    }
    await req.user.populate({
      path: "task",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt((req.query.skip - 1) * req.query.limit || 0),
        sort,
      },
    });
    const tasks = req.user.task;
    res.status(200).send(tasks);
  } catch (error) {
    res.status(400).send(error);
  }
});

taskRoutes.get("/:id", Auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const tasks = await Task.findOne({ _id, owner: req.user._id });

    if (!tasks) {
      return res.status(404).send(tasks);
    }
    res.status(200).send(tasks);
  } catch (error) {
    console.log(`error is ${error}`);
    res.status(400).send(error);
  }
});

taskRoutes.patch("/:id", Auth, async (req, res) => {
  const _id = req.params.id;
  const allowedupdates = ["completed", "description"];
  const updates = Object.keys(req.body);
  const isvalid = updates.every((elem) => {
    if (!allowedupdates.includes(elem)) {
      return false;
    } else {
      return true;
    }
  });

  if (!isvalid) {
    return res.status(400).send("invalid updates");
  }

  try {
    const tasks = await Task.findOne({ _id, owner: req.user._id });

    if (!tasks) {
      return res.status(404).send("task not found");
    }

    updates.forEach((update) => {
      tasks[update] = req.body[update];
    });

    await tasks.save();
    return res.status(200).send(tasks);
  } catch (error) {
    res.status(400).send(error);
  }
});

taskRoutes.delete("/:id", Auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const tasks = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!tasks) {
      return res.status(404).send("not found");
    }
    return res.status(200).send(`Deleted task ${tasks.title}`);
  } catch (error) {
    res.status(400).send(error);
  }
});
