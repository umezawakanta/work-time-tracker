// TypeScript import assignment to re-export CJS handler without ESM default
import handler = require('./whoami.js');
export = handler;
