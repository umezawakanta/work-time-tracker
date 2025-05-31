#!/usr/bin/env node
const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');

async function syncDocs() {
  console.log('Syncing docs to Google Drive...');
  // TODO: Implement docs sync
}

if (require.main === module) {
  syncDocs().catch(console.error);
}
