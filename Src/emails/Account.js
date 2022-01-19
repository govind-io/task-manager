/*Importing env variables using dotenv module*/
import mail from "@sendgrid/mail";
import { config } from "dotenv";
config();
const KEY = process.env.SEND_GRID_KEY;
const sgMail = mail;
sgMail.setApiKey(KEY);

export async function SendMail(email, name, type) {
  const msg = {
    welcome: {
      to: email,
      from: "gobind@mindrops.com",
      subject: `Welcome ${name} to task manager by Mindrops`,
      text: `Thanks ${name} for joining in the revolutionary task manager app by Mindrops. Now Manage all your task from here`,
    },
    goodbye: {
      to: email,
      from: "gobind@mindrops.com",
      subject: `We are sorry to see you go.`,
      text: `Can we please know why are you leaving us so that we can improve and we can see ${name} again on our platform`,
    },
  };
  try {
    await sgMail.send(msg[type]);
  } catch (error) {
    return error;
  }
}
