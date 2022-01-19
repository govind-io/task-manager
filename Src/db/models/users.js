import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { Task } from "./tasks.js";
const secretkey = process.env.JSON_SECRET_KEY;

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 18) {
          throw new Error("Age must be greater than 18");
        }
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email not appropriate");
        }
      },
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Passowrd is not strong");
        } else if (value.toLowerCase().includes("password")) {
          throw new Error("Password should not contain 'Password'");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.virtual("task", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

/*use defined instance methods*/
UserSchema.methods.generatetoken = async function () {
  const user = this;

  const token = jsonwebtoken.sign({ id: user._id.toString() }, secretkey);

  return token;
};

UserSchema.methods.toJSON = function () {
  const user = this;
  const userobject = user.toObject();
  delete userobject.password;
  delete userobject.tokens;
  delete userobject.avatar;
  return userobject;
};

/*user defined methods*/
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }

  const ismatch = await bcrypt.compare(password, user.password);

  if (!ismatch) {
    throw new Error("unable to login");
  }
  return user;
};

/*function to be called pre saving the user instance*/
UserSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

export const User = mongoose.model("User", UserSchema);
