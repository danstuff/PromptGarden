import OpenAI from 'openai';
import { appError, appLog, appTry } from './log.js';

var openai = new OpenAI({
  organization: process.env.TEST_OPENAI_ORG_ID,
  project: process.env.TEST_OPENAI_PROJECT_ID,
  apiKey: process.env.TEST_OPENAI_API_KEY,
});

async function getLLMResponse(text, persona, prompts, query) {
  var res = null;
  var prompt_str = query;
  
  if (text) {
    prompt_str += `\nPerform this task on the following text: "${text}"`;
  }

  if (prompts.length > 0) { 
    prompt_str += '\nRefer to the following points for context:';
    for (var i in prompts) {
      prompt_str += `\n - ${prompts[i].header}: ${prompts[i].description}`;
    }
  }

  await appTry(async function() {
      res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      response_format: { 'type': 'json_object' },
      messages: [
        { 'role': 'system', 'content' : 'You are designed to output JSON. Format the JSON as a single value named "text". ' + persona },
        { 'role': 'user', 'content' : prompt_str },
      ],
    })
  });
  
  if (res?.choices[0]?.message?.content) {
    var message = JSON.parse(res.choices[0].message.content);

    if (message.error) {
      appError(message.error);
      return { status_code: 400, text: text };
      
    } else if (message.text) {
      appLog(`Got LLM response "${message.text}"`);
      return { status_code: 200, text: message.text };
    }
  }

  return { status_code: 400, text: text };
}

export { getLLMResponse };