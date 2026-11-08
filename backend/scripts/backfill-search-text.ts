import mongoose from 'mongoose';
import { extractSearchText } from '../src/sites/html-text-extractor.js';

async function backfill() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const collection = mongoose.connection.collection('sites');
  const sites = await collection
    .find({
      $or: [
        { searchText: { $exists: false } },
        { searchText: null },
        { searchText: '' },
      ],
    })
    .toArray();

  if (sites.length === 0) {
    console.log('All sites already have searchText');
    await mongoose.disconnect();
    return;
  }

  for (const site of sites) {
    const searchText = extractSearchText(String(site.html ?? ''));
    await collection.updateOne({ _id: site._id }, { $set: { searchText } });
  }

  console.log(`Backfilled searchText on ${sites.length} sites`);
  await mongoose.disconnect();
}

await backfill();
