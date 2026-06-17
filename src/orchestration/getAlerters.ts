import { AlertService } from "../shared/types";
import { createEmailAlerter } from "../services/alert/email";
import axios from "axios";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import { createSlackAlerter } from "../services/alert/slack";
import { logArticles } from "../services/alert/alert";

dotenv.config();

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_TO } =
  process.env;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT) || 587,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM || !EMAIL_TO) {
  throw new Error(
    "EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_TO must be set in .env to run email integration tests",
  );
}

const emailAlerter = createEmailAlerter(transporter, {
  from: EMAIL_FROM,
  to: EMAIL_TO,
});
const { SLACK_WEBHOOK_URL } = process.env;

if (!SLACK_WEBHOOK_URL) {
  throw new Error(
    "SLACK_WEBHOOK_URL must be set in .env to run Slack integration tests",
  );
}

const poster = async (url: string, data: object) => {
  await axios.post(url, data);
};
const slackAlerter = createSlackAlerter(SLACK_WEBHOOK_URL, poster);

export const alerts: AlertService[] = [logArticles, emailAlerter, slackAlerter];
