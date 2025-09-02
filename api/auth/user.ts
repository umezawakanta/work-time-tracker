// CJS-friendly re-export without require() linter violations
import whoami from './whoami.js';
module.exports = whoami as any;
