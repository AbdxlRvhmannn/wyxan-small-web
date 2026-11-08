import mongoose from 'mongoose';

const sites = [
  {
    address: 'wyxan://home',
    title: 'Home',
    html: '<h1>Home</h1><p>Welcome to Wyxan. This is the home page.</p>',
  },
  {
    address: 'wyxan://about',
    title: 'About',
    html: '<h1>About</h1><p>About Wyxan Small Web.</p><p><strong>Static HTML only.</strong></p>',
  },
  {
    address: 'wyxan://contact',
    title: 'Contact',
    html: '<h1>Contact</h1><p>Contact details for Wyxan.</p>',
  },
  {
    address: 'wyxan://security-test',
    title: 'Security test',
    html: `<h1>Malicious payload (should be neutralized)</h1>
<script>window.parent.document.body.innerHTML='hacked'</script>
<img src="x" onerror="window.parent.alert('xss')">
<a href="javascript:window.parent.alert('js url')">javascript link</a>
<iframe src="https://example.com"></iframe>
<link rel="stylesheet" href="https://example.com/evil.css">
<style>body{background:url('https://example.com/track.png')}</style>
<object data="https://example.com"></object>`,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }

  const force = process.argv.includes('--force');

  await mongoose.connect(uri);

  const collection = mongoose.connection.collection('sites');
  const existing = await collection.countDocuments();
  if (existing > 0 && !force) {
    console.log(`Skipped: ${existing} sites already in database (use --force to replace)`);
    await mongoose.disconnect();
    return;
  }

  if (existing > 0 && force) {
    await collection.deleteMany({});
  }

  await collection.insertMany(sites);
  console.log(`Inserted ${sites.length} sites`);
  await mongoose.disconnect();
}

await seed();
