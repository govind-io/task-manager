import supertest from "supertest";
import { app } from "../app";
import { User } from "../db/models/users";
import { setupDb, userOne } from "./fixtures/db";

beforeEach(async () => {
  await setupDb();
});

test("Should signup new user", async () => {
  const response = await supertest(app)
    .post("/users/signup")
    .send({
      name: "govind",
      email: "govindgovind82@gmail.com",
      password: "RitomMuskan@123",
      age: "19",
    })
    .expect(201);

  const responseUser = response.body.user;
  const user = await User.findById(responseUser._id);
  expect(user.password).not.toBe("RitomMuskan@123");

  //expect(user).toMatchObject(responseUser);
});

test("should login new user", async () => {
  const response = await supertest(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);
  const user = await User.findById(response.body.users._id);
  expect(user.tokens[1].token).toBe(response.body.token);
});

test("should not login non existing user", async () => {
  const response = await supertest(app)
    .post("/users/login")
    .send({
      email: "wrongemail@email.com",
      password: userOne.password,
    })
    .expect(400);
});

test("should get profile", async () => {
  const response = await supertest(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("should not get unauthorized profile", async () => {
  const response = await supertest(app)
    .get("/users/me")
    .set("Authorization", `Bearer `)
    .send()
    .expect(400);
});

test("should not delete unauthorized profile", async () => {
  const response = await supertest(app)
    .delete("/users/me")
    .set("Authorization", `Bearer `)
    .send()
    .expect(400);
});

test("should delete profile", async () => {
  const response = await supertest(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user).toBeNull();
});

test("should not delete unauthorized User", async () => {
  await supertest(app).delete("/users/me").expect(400);

  const user = await User.findById(userOne._id);
  expect(user).not.toBeNull();
});

test("should store avatar", async () => {
  await supertest(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .set("Content-Type", "multipart/form-data")
    .attach("avatar", "Src/tests/fixtures/avatar.jpg")
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update user", async () => {
  await supertest(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "pawan",
    })
    .expect(201);
  const user = await User.findById(userOne._id);
  expect(user.name).toBe("pawan");
});

test("Should not update unauthorized user", async () => {
  await supertest(app)
    .patch("/users/me")
    .send({
      name: "pawan",
    })
    .expect(400);
});

test("Should not update invalid fields user", async () => {
  await supertest(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "pawan",
      age: 20,
      email: "govindogi=ad@gmail.com",
    })
    .expect(400);
});
