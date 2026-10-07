const test = require('node:test');
const assert = require('node:assert/strict');
const { buildBook } = require('../src/bookLogic');

test('tính VAT 8% và giá sau thuế từ MSSV 23IT042', () => {
  const book = buildBook({
    productCode: '042-001',
    title: 'Điện toán đám mây',
    author: 'Tác giả',
    priceBeforeTax: '100000',
  });

  assert.equal(book.vatRate, 8);
  assert.equal(book.priceAfterTax, 108000);
});

test('từ chối mã sản phẩm không có tiền tố 042', () => {
  assert.throws(() => buildBook({
    productCode: '041-001',
    title: 'Sai tiền tố',
    author: 'Tác giả',
    priceBeforeTax: 100,
  }), /bắt đầu bằng 042/);
});

test('từ chối giá thiếu, âm hoặc không phải số', () => {
  for (const priceBeforeTax of ['', undefined, -1, 'abc']) {
    assert.throws(() => buildBook({
      productCode: '042-X',
      title: 'Tên sách',
      author: 'Tác giả',
      priceBeforeTax,
    }), /số không âm/);
  }
});
