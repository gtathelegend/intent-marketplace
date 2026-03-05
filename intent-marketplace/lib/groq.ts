import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable. Please set it in your .env file.");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;
