import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const gmail = google.gmail({ version: "v1", auth: oauth2Client });

/**
 * Interface for simplified email data
 */
export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  from: string;
  date: string;
}

/**
 * Fetches the latest 10 emails from the inbox
 */
export async function fetchLatestEmails(accessToken: string): Promise<EmailMessage[]> {
  oauth2Client.setCredentials({ access_token: accessToken });

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
    q: "label:INBOX",
  });

  const messages = response.data.messages || [];
  const emailDetails: EmailMessage[] = [];

  for (const message of messages) {
    if (!message.id) continue;

    const details = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    const headers = details.data.payload?.headers;
    const subject = headers?.find((h) => h.name === "Subject")?.value || "No Subject";
    const from = headers?.find((h) => h.name === "From")?.value || "Unknown Sender";
    const date = headers?.find((h) => h.name === "Date")?.value || "";

    // Simplified body extraction (handling plain text)
    let body = "";
    const parts = details.data.payload?.parts;
    if (parts) {
      const textPart = parts.find((p) => p.mimeType === "text/plain");
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    } else if (details.data.payload?.body?.data) {
      body = Buffer.from(details.data.payload.body.data, "base64").toString("utf-8");
    }

    emailDetails.push({
      id: message.id,
      subject,
      from,
      date,
      body: body.substring(0, 1000), // Limit body size for LLM
    });
  }

  return emailDetails;
}
