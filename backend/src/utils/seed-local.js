// Explicit local-only sample setup. Existing users/passwords are never modified.
const fs = require('fs'),
  path = require('path'),
  crypto = require('crypto');
require('dotenv').config({ quiet: true });
const { connectDB } = require('../config/db');
const User = require('../models/User');
(async () => {
  if (
    !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\//.test(
      process.env.MONGODB_URI || '',
    )
  )
    throw new Error(
      'Seed command is restricted to an explicit loopback MongoDB URI',
    );
  await connectDB();
  const data = {};
  for (const role of ['admin', 'instructor', 'student']) {
    const email = `${role}@gyanix.example.test`;
    const user = await User.findOne({ email });
    if (!user) {
      const password = crypto.randomBytes(24).toString('base64url');
      await User.create({ name: `Local ${role}`, email, password, role });
      data[role] = { email, password };
    }
  }
  const folder = path.resolve(__dirname, '../../../.audit-runtime');
  fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
  fs.chmodSync(folder, 0o700);
  if (Object.keys(data).length) {
    const file = path.join(folder, `local-accounts-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o600 });
    console.log(
      'New local account credentials saved in the private runtime folder.',
    );
  }
  await require('./seedData')();
  await require('mongoose').disconnect();
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
  require('mongoose').disconnect();
});
