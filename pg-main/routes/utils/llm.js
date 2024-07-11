import OpenAI from 'openai';

var openai = new OpenAI({
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
  apiKey: process.env.OPENAI_API_KEY,
});

async function getLLMReply(text, persona, message) {
  // TODO
  return text + ' NULL';
}

export { getLLMReply };