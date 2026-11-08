import mongoose from 'mongoose';

const names = ['Alice Johnson', 'Bob Smith', 'Carol Williams'];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const collection = mongoose.connection.collection('people');
  const existing = await collection.countDocuments();
  if (existing > 0) {
    console.log(`Skipped: ${existing} people already in database`);
    await mongoose.disconnect();
    return;
  }

  await collection.insertMany(names.map((name) => ({ name })));
  console.log(`Inserted ${names.length} people`);
  await mongoose.disconnect();
}

await seed();
