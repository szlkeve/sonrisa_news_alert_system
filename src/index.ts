import * as dotenv from "dotenv";
import { createFetcher } from "./services/api/api";
import { poll } from "./services/poller/poller";
import { logArticles } from "./services/alert/alert";
import { AlertService } from "./shared/types";
import { createEmailAlerter } from "./services/alert/email";
import nodemailer from "nodemailer";
import { createSlackAlerter } from "./services/alert/slack";
import axios from "axios";

dotenv.config();

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 60_000;

if (!NEWSAPI_KEY) {
  console.error("Missing NEWSAPI_KEY in environment");
  process.exit(1);
}

let seen = new Set<string>();
const fetcher = createFetcher(NEWSAPI_KEY);
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

const alerts: AlertService[] = [logArticles, emailAlerter, slackAlerter];

async function tick(): Promise<void> {
  try {
    const { newArticles, seen: updatedSeen } = await poll(seen, fetcher);
    seen = updatedSeen;
    for (const alert of alerts) await alert(newArticles);
  } catch (err) {
    console.error("Poll failed:", err instanceof Error ? err.message : err);
  }
}

void tick();
setInterval(() => void tick(), POLL_INTERVAL_MS);
