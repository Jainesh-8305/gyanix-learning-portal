const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const { fail, objectIds } = require('../utils/http');
const Conversation = require('../models/ChatConversation');
const chat = require('../services/chat.service');
const knowledge = require('../services/knowledge.service');
const provider = require('../services/chat-provider');
const router = express.Router();
router.use(protect);
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
router.param('id', (req, res, next) => objectIds(req, res, next));
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    next(e);
  }
};
const quota = rateLimit({
  windowMs: 60000,
  max: 20,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Please wait a moment before sending more chat messages.',
  },
});
router.get(
  '/status',
  wrap(async (req, res) =>
    res.json({
      success: true,
      data: {
        configured: provider.configured(),
        model: provider.configured() ? provider.model() : null,
        retentionDays: 30,
        mode: provider.configured() ? 'llm-configured' : 'retrieval-only',
      },
    }),
  ),
);
router.get(
  '/knowledge',
  wrap(async (req, res) =>
    res.json({
      success: true,
      data: knowledge
        .documents(req.user)
        .map(({ id, title, url, text, translations }) => ({
          id,
          title,
          url,
          text,
          translations,
        })),
    }),
  ),
);
router.get(
  '/threads',
  wrap(async (req, res) =>
    res.json({
      success: true,
      data: await Conversation.find({
        owner: req.user._id,
        ownerRole: req.user.role,
        expiresAt: { $gt: new Date() },
      })
        .select('title updatedAt')
        .sort('-updatedAt')
        .limit(20)
        .lean(),
    }),
  ),
);
router.get(
  '/threads/:id',
  wrap(async (req, res) => {
    const thread = await Conversation.findOne({
      _id: req.params.id,
      owner: req.user._id,
      ownerRole: req.user.role,
      expiresAt: { $gt: new Date() },
    })
      .select('title messages updatedAt')
      .lean();
    if (!thread) throw fail(404, 'Conversation not found');
    res.json({ success: true, data: thread });
  }),
);
router.delete(
  '/threads/:id',
  wrap(async (req, res) => {
    const result = await Conversation.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
        ownerRole: req.user.role,
        busyUntil: { $lte: new Date() },
      },
      { $set: { expiresAt: new Date() } },
      { new: true },
    ).select('_id');
    if (!result) throw fail(404, 'Conversation unavailable');
    res.json({ success: true });
  }),
);
const handle = wrap(async (req, res) => {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });
  const data = await chat.answer(req.user, req.body, controller.signal);
  if (!res.destroyed) res.json({ success: true, data });
});
router.post('/', quota, handle);
module.exports = router;
