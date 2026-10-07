const { PRODUCT_PREFIX, VAT_RATE } = require('./config');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildBook(input) {
  const productCode = String(input.productCode || '').trim();
  const title = String(input.title || '').trim();
  const author = String(input.author || '').trim();
  const priceBeforeTax = Number(input.priceBeforeTax);

  if (!productCode.startsWith(PRODUCT_PREFIX)) {
    throw new ValidationError(`Mã sản phẩm phải bắt đầu bằng ${PRODUCT_PREFIX}.`);
  }
  if (productCode.length > 64) throw new ValidationError('Mã sản phẩm tối đa 64 ký tự.');
  if (!title) throw new ValidationError('Tên sách không được để trống.');
  if (title.length > 200) throw new ValidationError('Tên sách tối đa 200 ký tự.');
  if (!author) throw new ValidationError('Tác giả không được để trống.');
  if (author.length > 200) throw new ValidationError('Tên tác giả tối đa 200 ký tự.');
  if (input.priceBeforeTax === '' || input.priceBeforeTax == null
    || !Number.isFinite(priceBeforeTax) || priceBeforeTax < 0) {
    throw new ValidationError('Giá trước thuế phải là số không âm.');
  }

  return {
    productCode,
    title,
    author,
    priceBeforeTax: roundCurrency(priceBeforeTax),
    vatRate: VAT_RATE,
    priceAfterTax: roundCurrency(priceBeforeTax * (1 + VAT_RATE / 100)),
    createdAt: new Date(),
  };
}

module.exports = { ValidationError, buildBook, roundCurrency };
