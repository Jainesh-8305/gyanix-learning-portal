// SuperMemo-2 quality 0-5. Return a new schedule; callers persist it per student.
module.exports = (card, quality, now = new Date()) => {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5)
    throw new Error('Quality must be an integer from zero to five');
  let repetitions = card.repetitions || 0,
    interval = card.interval || 0;
  const ease = Math.max(
    1.3,
    (card.ease || 2.5) + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  );
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    interval =
      repetitions === 0
        ? 1
        : repetitions === 1
          ? 6
          : Math.round(interval * (card.ease || 2.5));
    repetitions++;
  }
  return {
    ease,
    repetitions,
    interval,
    dueAt: new Date(now.getTime() + interval * 86400000),
    reviewedAt: now,
  };
};
