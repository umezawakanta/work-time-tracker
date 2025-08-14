#!/usr/bin/env node

/**
 * Test script for Anthropic API integration
 * Run with: node scripts/test-anthropic-api.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function checkEnvFile() {
    log('\n📁 Checking environment files...', colors.cyan);

    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');

    if (fs.existsSync(envLocalPath)) {
        log('✅ .env.local file found', colors.green);

        const content = fs.readFileSync(envLocalPath, 'utf8');
        if (content.includes('ANTHROPIC_API_KEY')) {
            log('✅ ANTHROPIC_API_KEY found in .env.local', colors.green);

            // Check if it's not the placeholder
            if (!content.includes('your-actual-api-key-here')) {
                log('✅ API key appears to be configured', colors.green);
                return true;
            } else {
                log('⚠️  API key seems to be a placeholder', colors.yellow);
                log('   Please replace it with your actual Anthropic API key', colors.yellow);
                return false;
            }
        } else {
            log('❌ ANTHROPIC_API_KEY not found in .env.local', colors.red);
            return false;
        }
    } else if (fs.existsSync(envPath)) {
        log('⚠️  Found .env file but .env.local is recommended for local development', colors.yellow);

        const content = fs.readFileSync(envPath, 'utf8');
        if (content.includes('ANTHROPIC_API_KEY')) {
            log('✅ ANTHROPIC_API_KEY found in .env', colors.green);
            return true;
        } else {
            log('❌ ANTHROPIC_API_KEY not found in .env', colors.red);
            return false;
        }
    } else {
        log('❌ No environment file found', colors.red);
        log('   Create a .env.local file with your ANTHROPIC_API_KEY', colors.yellow);
        return false;
    }
}

function checkAPIEndpoint() {
    log('\n🌐 Checking API endpoint configuration...', colors.cyan);

    const apiPath = path.join(process.cwd(), 'api', 'ai', 'anthropic.ts');

    if (fs.existsSync(apiPath)) {
        log('✅ API proxy endpoint found at api/ai/anthropic.ts', colors.green);
        return true;
    } else {
        log('❌ API proxy endpoint not found', colors.red);
        log('   Expected location: api/ai/anthropic.ts', colors.yellow);
        return false;
    }
}

function checkFrontendService() {
    log('\n💻 Checking frontend service configuration...', colors.cyan);

    const servicePath = path.join(process.cwd(), 'src', 'services', 'ai', 'anthropicService.ts');

    if (fs.existsSync(servicePath)) {
        log('✅ Frontend service found at src/services/ai/anthropicService.ts', colors.green);

        const content = fs.readFileSync(servicePath, 'utf8');
        if (content.includes('/api/ai/anthropic')) {
            log('✅ Service is configured to use API proxy', colors.green);
            return true;
        } else {
            log('⚠️  Service might not be using the API proxy correctly', colors.yellow);
            return false;
        }
    } else {
        log('❌ Frontend service not found', colors.red);
        return false;
    }
}

async function testAPIConnection() {
    log('\n🔌 Testing API connection...', colors.cyan);

    try {
        // Try to load environment variables
        require('dotenv').config({ path: '.env.local' });
        require('dotenv').config({ path: '.env' });

        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey || apiKey.includes('your-actual-api-key-here')) {
            log('❌ Valid API key not found in environment', colors.red);
            return false;
        }

        log('🔄 Sending test request to Anthropic API...', colors.yellow);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 100,
                messages: [{ role: 'user', content: 'Hello, this is a test. Please respond with "Test successful".' }],
            }),
        });

        if (response.ok) {
            log('✅ API connection successful!', colors.green);
            const data = await response.json();
            if (data.content && data.content[0]) {
                log(`   Response: ${data.content[0].text}`, colors.cyan);
            }
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            log(`❌ API request failed: ${response.status} ${response.statusText}`, colors.red);
            if (errorData.error) {
                log(`   Error: ${errorData.error.message || errorData.error}`, colors.red);
            }
            return false;
        }
    } catch (error) {
        log(`❌ Connection test failed: ${error.message}`, colors.red);
        return false;
    }
}

function printInstructions() {
    log('\n📚 Setup Instructions:', colors.bright + colors.blue);
    log('\n1. Create a .env.local file in the project root:');
    log('   echo "ANTHROPIC_API_KEY=your-api-key-here" > .env.local\n');
    log('2. Get your API key from: https://console.anthropic.com/api-keys\n');
    log('3. Start the development server with Vercel CLI:');
    log('   pnpm dev:vercel');
    log('   or');
    log('   vercel dev\n');
    log('4. Open http://localhost:3000 and navigate to AI Assistant\n');
}

async function main() {
    log('\n' + '='.repeat(60), colors.bright);
    log('🤖 Anthropic API Integration Test', colors.bright + colors.cyan);
    log('='.repeat(60) + '\n', colors.bright);

    const checks = [
        checkEnvFile(),
        checkAPIEndpoint(),
        checkFrontendService(),
    ];

    const allChecksPassed = checks.every(result => result);

    if (allChecksPassed) {
        // Only test connection if all file checks pass
        const connectionOk = await testAPIConnection();

        if (connectionOk) {
            log('\n' + '='.repeat(60), colors.bright);
            log('🎉 All checks passed! Your Anthropic integration is ready.', colors.bright + colors.green);
            log('='.repeat(60), colors.bright);
        } else {
            log('\n' + '='.repeat(60), colors.bright);
            log('⚠️  File setup is correct but API connection failed.', colors.bright + colors.yellow);
            log('   Please check your API key and network connection.', colors.yellow);
            log('='.repeat(60), colors.bright);
            printInstructions();
        }
    } else {
        log('\n' + '='.repeat(60), colors.bright);
        log('❌ Some checks failed. Please fix the issues above.', colors.bright + colors.red);
        log('='.repeat(60), colors.bright);
        printInstructions();
    }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    log('⚠️  This script requires Node.js 18 or higher for fetch support', colors.yellow);
    log('   Alternatively, install node-fetch: npm install -g node-fetch', colors.yellow);
    process.exit(1);
}

// Check if dotenv is available
try {
    require('dotenv');
} catch (e) {
    log('⚠️  dotenv package not found. Installing it will help load environment variables.', colors.yellow);
    log('   Install with: npm install dotenv', colors.yellow);
}

// Run the test
main().catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, colors.red);
    process.exit(1);
});
