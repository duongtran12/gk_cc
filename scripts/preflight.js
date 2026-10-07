require('dotenv').config();

const { MongoClient } = require('mongodb');
const { DB_NAME } = require('../src/config');
const { configureDns } = require('../src/dns');
const { normalizeMongoUri } = require('../src/mongoUri');

function requireMongoUri(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) throw new Error(`Thiếu ${name}`);
  if (value.includes('<') || value.includes('>')) {
    throw new Error(`${name} vẫn đang chứa placeholder`);
  }
  if (!/^mongodb(?:\+srv)?:\/\//.test(value)) {
    throw new Error(`${name} không phải MongoDB URI hợp lệ`);
  }
  return value;
}

async function main() {
  configureDns();
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32 || secret.includes('replace-with')) {
    throw new Error('SESSION_SECRET phải là chuỗi ngẫu nhiên có ít nhất 32 ký tự');
  }

  const rawReadUri = requireMongoUri('MONGO_READ_URI');
  const rawWriteUri = requireMongoUri('MONGO_WRITE_URI');
  const rawSessionUri = requireMongoUri('MONGO_SESSION_URI', rawWriteUri);
  const readUri = normalizeMongoUri(rawReadUri);
  const writeUri = normalizeMongoUri(rawWriteUri);
  const sessionUri = normalizeMongoUri(rawSessionUri);
  const options = { serverSelectionTimeoutMS: 10000 };
  const readClient = new MongoClient(readUri, options);
  const writeClient = new MongoClient(writeUri, options);
  const sessionClient = new MongoClient(sessionUri, options);

  try {
    await Promise.all([
      readClient.connect(),
      writeClient.connect(),
      sessionClient.connect(),
    ]);
    console.log('✓ Đăng nhập thành công cả ba kết nối MongoDB');

    await readClient.db(DB_NAME).collection('books').findOne({});
    console.log(`✓ Tài khoản đọc truy cập được ${DB_NAME}.books`);

    await writeClient.db(DB_NAME).command({ ping: 1 });
    console.log('✓ Tài khoản ghi kết nối thành công');

    const sessions = sessionClient.db(DB_NAME).collection('sessions');
    await sessions.findOne({});
    await sessions.createIndex(
      { expires: 1 },
      { background: true, expireAfterSeconds: 0 },
    );
    console.log(`✓ Session store đọc được và có TTL index trên ${DB_NAME}.sessions`);
    console.log('Preflight hoàn tất. Có thể chạy npm start.');
  } finally {
    await Promise.allSettled([
      readClient.close(),
      writeClient.close(),
      sessionClient.close(),
    ]);
  }
}

main().catch((error) => {
  console.error(`Preflight thất bại: ${error.message}`);
  process.exitCode = 1;
});
