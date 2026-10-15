// Explicit local migration. Historical gateway order collections are not read by
// the application and are left untouched for backup/audit purposes.
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
(async () => {
  const uri = process.env.MONGODB_URI || '';
  if (!/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\//.test(uri))
    throw Error(
      'Migration requires an explicit loopback database URI and a backup',
    );
  await mongoose.connect(uri);
  await Promise.all([
    mongoose.connection
      .collection('courses')
      .updateMany(
        {},
        { $unset: { price: '', discountPrice: '', totalRevenue: '' } },
      ),
    mongoose.connection
      .collection('enrollments')
      .updateMany({}, { $unset: { paymentId: '', amountPaid: '' } }),
  ]);
  console.log('Free-access migration complete; learning records retained.');
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
