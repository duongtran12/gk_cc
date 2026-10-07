const session = require('express-session');
const MongoStore = require('connect-mongo');
const { DB_NAME, SESSION_MAX_AGE_MS } = require('./config');
const { normalizeMongoUri } = require('./mongoUri');

function sessionMiddleware() {
  const secret = process.env.SESSION_SECRET;
  const mongoUrl = process.env.MONGO_SESSION_URI || process.env.MONGO_WRITE_URI;

  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET phải có ít nhất 32 ký tự');
  }
  if (!mongoUrl) {
    throw new Error('Thiếu MONGO_SESSION_URI (hoặc MONGO_WRITE_URI dự phòng)');
  }

  return session({
    name: 'book.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
      mongoUrl: normalizeMongoUri(mongoUrl),
      dbName: DB_NAME,
      collectionName: 'sessions',
      ttl: Math.floor(SESSION_MAX_AGE_MS / 1000),
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE_MS,
    },
  });
}

module.exports = { sessionMiddleware };
