const STUDENT_NAME = 'Trần Đức Dương';
const MSSV = '23IT042';

const DB_NAME = `DB_${MSSV}`;
const numericStudentId = MSSV.replace(/\D/g, '');
const PRODUCT_PREFIX = numericStudentId.slice(-3);
const VAT_RATE = Number(numericStudentId.slice(-1)) + 6;
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

module.exports = {
  STUDENT_NAME,
  MSSV,
  DB_NAME,
  PRODUCT_PREFIX,
  VAT_RATE,
  SESSION_MAX_AGE_MS,
};
