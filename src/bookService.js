const db = require('./db');
const { buildBook } = require('./bookLogic');

async function listBooks() {
  // Mọi truy vấn đọc chỉ đi qua tài khoản read-only.
  return db.readBooksCollection().find({}).sort({ createdAt: -1 }).toArray();
}

async function createBook(input) {
  const book = buildBook(input);
  // Mọi truy vấn ghi chỉ đi qua tài khoản write-only.
  const result = await db.writeBooksCollection().insertOne(book);
  return { ...book, _id: result.insertedId };
}

module.exports = { listBooks, createBook };
