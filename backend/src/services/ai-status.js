const { AsyncLocalStorage } = require('node:async_hooks');
const context = new AsyncLocalStorage();
const middleware = (req, res, next) =>
  context.run(
    {
      mode: 'offline',
      modelEngine: 'Offline study templates (not a language model)',
    },
    next,
  );
const set = (live) => {
  const state = context.getStore();
  if (state)
    Object.assign(state, {
      mode: live ? 'live' : 'offline',
      modelEngine: live
        ? 'OpenAI gpt-4o-mini'
        : 'Offline study templates (not a language model)',
    });
};
const metadata = () =>
  context.getStore() || {
    mode: 'offline',
    modelEngine: 'Offline study templates (not a language model)',
  };
module.exports = { middleware, set, metadata };
