const OpenAI = require('openai');
const { fail } = require('../utils/http');
let cachedKey, client;
const configured = () => Boolean(process.env.OPENAI_API_KEY?.trim());
function getClient() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  if (cachedKey !== key) {
    cachedKey = key;
    client = new OpenAI({ apiKey: key,
      baseURL: 'https://api.openai.com/v1', timeout: 20000, maxRetries: 0 });
  }
  return client;
}
const model = () => process.env.CHAT_MODEL || 'gpt-5.4-mini';
const embeddingModel = () =>
  process.env.CHAT_EMBEDDING_MODEL || 'text-embedding-3-small';
async function embed(texts, signal) {
  const response = await getClient().embeddings.create(
    { model: embeddingModel(), input: texts, dimensions: 512 },
    { signal, timeout: 6000 },
  );
  const data = [...response.data].sort((a, b) => a.index - b.index);
  if (
    data.length !== texts.length ||
    data.some(
      (item) =>
        item.embedding?.length !== 512 ||
        item.embedding.some((n) => !Number.isFinite(n)),
    )
  )
    throw new Error('Invalid embedding response');
  return data.map((item) => item.embedding);
}
async function generate({ instructions, messages, signal }) {
  const api = getClient();
  if (!api) throw fail(503, 'Chat model is not configured');
  const response = await api.responses.create(
    {
      model: model(),
      store: false,
      max_output_tokens: 1800,
      ...(/^gpt-[56]/.test(model()) ? { reasoning: { effort: 'low' } } : {}),
      instructions,
      input: messages,
      text: {
        format: {
          type: 'json_schema',
          name: 'portal_answer',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              answer: { type: 'string' },
              sourceIds: { type: 'array', items: { type: 'string' } },
              language: { type: 'string' },
            },
            required: ['answer', 'sourceIds', 'language'],
          },
        },
      },
    },
    { signal, timeout: 20000 },
  );
  let answer;
  try {
    answer = JSON.parse(response.output_text);
  } catch {
    throw fail(502, 'Chat model returned an unreadable answer');
  }
  if (
    !answer ||
    typeof answer.answer !== 'string' ||
    !answer.answer.trim() ||
    answer.answer.length > 9000 ||
    !Array.isArray(answer.sourceIds) ||
    answer.sourceIds.some((x) => typeof x !== 'string')
  )
    throw fail(502, 'Chat model returned an invalid answer');
  return answer;
}
module.exports = { configured, model, embeddingModel, embed, generate };
