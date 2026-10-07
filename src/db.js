const { MongoClient } = require('mongodb');
const { DB_NAME } = require('./config');
const { configureDns } = require('./dns');
const { normalizeMongoUri } = require('./mongoUri');

let readClient;
let writeClient;
let connectionPromise;

function requireUri(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name}`);
  return value;
}

function createClients() {
  if (!readClient) {
    configureDns();
    // Hai MongoClient tạo hai connection pool độc lập và dùng hai tài khoản khác nhau.
    readClient = new MongoClient(normalizeMongoUri(requireUri('MONGO_READ_URI')), {
      serverSelectionTimeoutMS: 10000,
    });
    writeClient = new MongoClient(normalizeMongoUri(requireUri('MONGO_WRITE_URI')), {
      serverSelectionTimeoutMS: 10000,
    });
  }
}

async function connectDatabases() {
  createClients();
  if (!connectionPromise) {
    connectionPromise = Promise.all([readClient.connect(), writeClient.connect()]);
  }
  await connectionPromise;
}

function readBooksCollection() {
  if (!readClient) throw new Error('Kết nối đọc chưa được khởi tạo');
  return readClient.db(DB_NAME).collection('books');
}

function writeBooksCollection() {
  if (!writeClient) throw new Error('Kết nối ghi chưa được khởi tạo');
  return writeClient.db(DB_NAME).collection('books');
}

async function closeConnections() {
  const clients = [readClient, writeClient].filter(Boolean);
  await Promise.allSettled(clients.map((client) => client.close()));
  readClient = undefined;
  writeClient = undefined;
  connectionPromise = undefined;
}

module.exports = {
  connectDatabases,
  readBooksCollection,
  writeBooksCollection,
  closeConnections,
};
