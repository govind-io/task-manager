import supertest from "supertest";
import { app } from "../app";
import { Task } from "../db/models/tasks";
import { setupDb, taskOne, taskTwo, userOne, userTwo } from "./fixtures/db";

beforeEach(async () => {
  await setupDb();
});

test("Should create a task for user", async () => {
  const response = await supertest(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "Testing task",
      description: "Testing task description",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
  expect(task.title).toBe("Testing task");
});

test("Should return only self created tasks", async () => {
  const response = await supertest(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.length).toBe(2);
});

test("Should not be able to delete task of another user but able to delete self created task", async () => {
  await supertest(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  let task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();

  await supertest(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  task = await Task.findById(taskOne._id);
  expect(task).toBeNull();
});
