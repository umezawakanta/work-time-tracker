import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import inquirer from 'inquirer';

const execAsync = promisify(exec);

async function initProject() {
    // ... existing code ...
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
    initProject().catch(console.error);
} 