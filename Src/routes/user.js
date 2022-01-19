import express from "express";
import multer from "multer";
import sharp from "sharp";
import { User } from "../db/models/users.js";
import { SendMail } from "../emails/Account.js";
import Auth from "../Utils/Auth.js";
export const userRoutes = new express.Router();

userRoutes.post("/signup", async function (req, res) {
  const user = new User(req.body);
  try {
    const token = await user.generatetoken();
    user.tokens = user.tokens.concat({ token });
    await user.save();
    await SendMail(user.email, user.name, "welcome");
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

userRoutes.post("/login", async (req, res) => {
  try {
    const users = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await users.generatetoken();
    users.tokens = users.tokens.concat({ token });
    await users.save();

    res.status(200).send({ users, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

userRoutes.post("/logout", Auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("Logged out");
  } catch (e) {
    res.status(400).send(e);
  }
});

userRoutes.post("/logoutall", Auth, async (req, res) => {
  try {
    req.user.tokens = [{ token: req.token }];
    await req.user.save();
    res.send("Logged out");
  } catch (e) {
    res.status(400).send(e);
  }
});

userRoutes.get("/me", Auth, async (req, res) => {
  try {
    res.status(200).send({ user: req.user, token: req.token });
  } catch (error) {
    res.status(400).send(error);
  }
});

userRoutes.patch("/me", Auth, async (req, res) => {
  const allowedupdates = ["name", "password", "age"];
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
    const users = req.user;
    updates.forEach((update) => {
      users[update] = req.body[update];
    });
    await users.save();
    res.status(201).send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

userRoutes.delete("/me", Auth, async (req, res) => {
  try {
    await req.user.remove();
    await SendMail(req.user.email, req.user.name, "goodbye");
    return res.status(200).send(`Deleted user ${req.user.name}`);
  } catch (error) {
    res.status(400).send(error);
  }
});

const avatar = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, callcb) {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      return callcb(undefined, true);
    } else {
      return callcb(new Error("Only jpeg files are allowed"));
    }
  },
});

userRoutes.post(
  "/me/avatar",
  Auth,
  avatar.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .jpeg()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

userRoutes.delete("/me/avatar", Auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(400).send(error);
  }
});

userRoutes.get("/me/avatar", Auth, async (req, res) => {
  try {
    if (!req.user.avatar) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-type", "image/jpeg").send(req.user.avatar);
  } catch (error) {
    res.status(400).send(error);
  }
});
