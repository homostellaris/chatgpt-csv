import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  maxRetries: 5,
});

export default async function chat(prompt, context) {
  let message = prompt;
  if (context) message += `\n\n${context}`;

  if (process.env.NODE_ENV === "test") return prompt;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: message }],
    model: "gpt-3.5-turbo",
  });

  // console.debug(`${JSON.stringify(completion, null, 2)}`);

  const response = completion.choices[0].message.content;
  return response;
}
