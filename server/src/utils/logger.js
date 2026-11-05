/**
 * Simple, colorized application logger
 */
const chalk = {
  blue: (t) => `\x1b[34m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  gray: (t) => `\x1b[90m${t}\x1b[0m`
};

const formatTime = () => new Date().toISOString();

const logger = {
  info: (msg, meta = '') => {
    console.log(`${chalk.gray(formatTime())} ${chalk.blue('[INFO]')} ${msg}`, meta ? meta : '');
  },
  success: (msg, meta = '') => {
    console.log(`${chalk.gray(formatTime())} ${chalk.green('[SUCCESS]')} ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`${chalk.gray(formatTime())} ${chalk.yellow('[WARN]')} ${msg}`, meta ? meta : '');
  },
  error: (msg, meta = '') => {
    console.error(`${chalk.gray(formatTime())} ${chalk.red('[ERROR]')} ${msg}`, meta ? meta : '');
  },
  sms: (msg, meta = '') => {
    console.log(`${chalk.gray(formatTime())} ${chalk.cyan('[SMS-GATEWAY]')} ${msg}`, meta ? meta : '');
  }
};

module.exports = logger;
