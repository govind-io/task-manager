import mongoose from "mongoose";
const url = process.env.MONGOOSE_URL;

export const database = mongoose.connect(url);
