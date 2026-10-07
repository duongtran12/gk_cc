require('dotenv').config();

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const { engine } = require('express-handlebars');
const db = require('./db');
const { sessionMiddleware } = require('./session');
const booksRouter = require('./routes/books');
const { STUDENT_NAME, MSSV, VAT_RATE } = require('./config');

function createApp() {
  const app = express();
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

  app.engine('handlebars', engine({
    helpers: {
      currency(value) {
        return Number(value).toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        });
      },
      dateTime(value) {
        return value ? new Date(value).toLocaleString('vi-VN') : '';
      },
    },
  }));
  app.set('view engine', 'handlebars');
  app.set('views', path.join(__dirname, 'views'));

  app.use(helmet());
  app.use(express.urlencoded({ extended: false, limit: '16kb' }));
  app.use(express.json({ limit: '16kb' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(sessionMiddleware());

  app.locals.studentName = STUDENT_NAME;
  app.locals.studentId = MSSV;
  app.locals.vatRate = VAT_RATE;

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use(booksRouter);
  app.use((req, res) => res.status(404).render('error', {
    statusCode: 404,
    message: 'Không tìm thấy trang.',
  }));
  app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    return res.status(500).render('error', {
      statusCode: 500,
      message: 'Hệ thống đang bận. Vui lòng thử lại sau.',
    });
  });

  return app;
}

async function start() {
  await db.connectDatabases();
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại cổng ${port}`);
  });

  async function shutdown(signal) {
    console.log(`Nhận ${signal}, đang dừng ứng dụng...`);
    server.close(async () => {
      await db.closeConnections();
      process.exit(0);
    });
  }
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Không thể khởi động ứng dụng:', error);
    process.exit(1);
  });
}

module.exports = { createApp, start };
