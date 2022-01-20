import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
import { Task } from "../../db/models/tasks";
import { User } from "../../db/models/users";

const userOneID = new mongoose.Types.ObjectId();
const userTwoID = new mongoose.Types.ObjectId();
const taskOneID = new mongoose.Types.ObjectId();
const taskTwoID = new mongoose.Types.ObjectId();
const taskThreeID = new mongoose.Types.ObjectId();
export const taskOne = {
  title: "Testing task main",
  description: "Testing task description",
  _id: taskOneID,
  completed: false,
  owner: userOneID,
};

export const taskTwo = {
  title: "Testing task main",
  description: "Testing task description",
  _id: taskTwoID,
  completed: false,
  owner: userTwoID,
};

export const taskThree = {
  title: "Testing task main",
  description: "Testing task description",
  _id: taskThreeID,
  completed: false,
  owner: userOneID,
};

export const userOne = {
  name: "govind",
  email: "govindgovind852@gmail.com",
  password: "Govind@100Billion",
  age: "19",
  _id: userOneID,
  tokens: [
    {
      token: jsonwebtoken.sign(
        { id: userOneID.toString() },
        process.env.JSON_SECRET_KEY
      ),
    },
  ],
};

export const userTwo = {
  name: "govind 2",
  email: "govindgovind853@gmail.com",
  password: "Govind@100Billion",
  age: "19",
  _id: userTwoID,
  tokens: [
    {
      token: jsonwebtoken.sign(
        { id: userTwoID.toString() },
        process.env.JSON_SECRET_KEY
      ),
    },
  ],
};

export const setupDb = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};
