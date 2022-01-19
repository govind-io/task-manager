import mongoose from "mongoose";
import { config } from "dotenv";
config();
const url = process.env.MONGOOSE_URL;

export const database = mongoose.connect(url);
