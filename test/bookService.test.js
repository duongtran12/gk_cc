const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/db');
const bookService = require('../src/bookService');

test('listBooks chỉ dùng collection của tài khoản đọc', async () => {
  const originalRead = db.readBooksCollection;
  const originalWrite = db.writeBooksCollection;
  let writeWasCalled = false;
  const expected = [{ productCode: '042-001' }];

  db.readBooksCollection = () => ({
    find: () => ({
      sort: () => ({ toArray: async () => expected }),
    }),
  });
  db.writeBooksCollection = () => {
    writeWasCalled = true;
    throw new Error('Không được gọi luồng ghi');
  };

  try {
    assert.deepEqual(await bookService.listBooks(), expected);
    assert.equal(writeWasCalled, false);
  } finally {
    db.readBooksCollection = originalRead;
    db.writeBooksCollection = originalWrite;
  }
});

test('createBook chỉ dùng collection của tài khoản ghi', async () => {
  const originalRead = db.readBooksCollection;
  const originalWrite = db.writeBooksCollection;
  let readWasCalled = false;
  let insertedDocument;

  db.readBooksCollection = () => {
    readWasCalled = true;
    throw new Error('Không được gọi luồng đọc');
  };
  db.writeBooksCollection = () => ({
    insertOne: async (document) => {
      insertedDocument = document;
      return { insertedId: 'new-id' };
    },
  });

  try {
    const result = await bookService.createBook({
      productCode: '042-002',
      title: 'Cloud Native',
      author: 'Tác giả',
      priceBeforeTax: 200000,
    });

    assert.equal(readWasCalled, false);
    assert.equal(insertedDocument.priceAfterTax, 216000);
    assert.equal(result._id, 'new-id');
  } finally {
    db.readBooksCollection = originalRead;
    db.writeBooksCollection = originalWrite;
  }
});
