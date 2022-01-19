import { config } from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import { User } from "../db/models/users.js";
config();
const secretkey = process.env.JSON_SECRET_KEY;
export default async function Auth(req, res, next) {
  try {
    let token = req.header("Authorization").replace("Bearer ", "");
    let data = jsonwebtoken.verify(token, secretkey);
    let user = await User.findOne({ _id: data.id, "tokens.token": token });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(400).send("Authorization failed");
  }
}
