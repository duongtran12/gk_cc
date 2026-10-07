const express = require('express');
const bookService = require('../bookService');
const { ValidationError } = require('../bookLogic');
const { PRODUCT_PREFIX, VAT_RATE } = require('../config');

const router = express.Router();

function saveSession(req) {
  return new Promise((resolve, reject) => req.session.save((error) => (
    error ? reject(error) : resolve()
  )));
}

router.get('/', async (req, res) => {
  const books = await bookService.listBooks();
  const flash = req.session.flash;
  delete req.session.flash;
  req.session.pageViews = (req.session.pageViews || 0) + 1;

  res.render('books', {
    books,
    flash,
    pageViews: req.session.pageViews,
    productPrefix: PRODUCT_PREFIX,
    vatRate: VAT_RATE,
  });
});

router.post('/books', async (req, res) => {
  try {
    const book = await bookService.createBook(req.body);
    req.session.flash = {
      type: 'success',
      message: `Đã thêm “${book.title}” với giá sau thuế ${book.priceAfterTax.toLocaleString('vi-VN')} ₫.`,
    };
    await saveSession(req);
    res.redirect(303, '/');
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;

    const books = await bookService.listBooks();
    res.status(error.statusCode).render('books', {
      books,
      form: req.body,
      error: error.message,
      pageViews: req.session.pageViews || 0,
      productPrefix: PRODUCT_PREFIX,
      vatRate: VAT_RATE,
    });
  }
});

module.exports = router;
