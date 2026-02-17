const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Helper to confirm action
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => readline.question(query, resolve));

// Models
const App = require('../src/models/App');
const Device = require('../src/models/Device');
const Notification = require('../src/models/Notification');
const User = require('../src/models/User');
const OTP = require('../src/models/OTP');

const models = { App, Device, Notification, User, OTP };

async function migrate() {
    console.log('--- MongoDB Migration Script ---');
    console.log('This script will copy data from your LOCAL database to a REMOTE database.');

    // 1. Connection Strings
    const localUri = process.env.MONGODB_URI || "mongodb://localhost:27017/push-notification";
    console.log(`\nLocal URI: ${localUri}`);

    const remoteUri = await askQuestion('\nEnter your REMOTE MongoDB URI (e.g., from Atlas): ');

    if (!remoteUri) {
        console.error('Remote URI is required!');
        process.exit(1);
    }

    console.log('\nReading data from LOCAL database...');

    // 2. Connect Local and Read
    await mongoose.connect(localUri);
    console.log('Connected to Local DB.');

    const dataBuffer = {};

    for (const [name, model] of Object.entries(models)) {
        const count = await model.countDocuments();
        console.log(`Reading ${name}: ${count} documents`);
        dataBuffer[name] = await model.find().lean();
    }

    await mongoose.disconnect();
    console.log('Disconnected from Local DB.');

    // 3. Connect Remote and Write
    console.log('\nConnecting to REMOTE database...');
    try {
        await mongoose.connect(remoteUri);
        console.log('Connected to Remote DB.');
    } catch (err) {
        console.error('Failed to connect to Remote DB:', err.message);
        process.exit(1);
    }

    console.log('\nWriting data to Remote DB...');

    for (const [name, docs] of Object.entries(dataBuffer)) {
        if (docs.length === 0) continue;

        const model = models[name];

        // Option to verify before writing?
        // For now, let's use insertMany with ordered: false to continue if some exist
        try {
            console.log(`Inserting ${docs.length} documents into ${name}...`);
            // We strip _id if we want new IDs, but usually for migration we want SAME IDs.
            // insertMany will fail on duplicate _id, which is good (avoids duplicates).
            // But if user wants to "sync", maybe upsert?
            // Simple migration: insertMany.

            const result = await model.insertMany(docs, { ordered: false });
            console.log(`  Successfully inserted ${result.length} documents.`);
        } catch (e) {
            if (e.code === 11000) {
                // Duplicate key error
                console.log(`  Some documents already existed (duplicates skipped).`);
                // Count how many actually inserted? insertMany throws on first error if ordered: true (default).
                // With ordered: false, it tries all. Result is inserted docs.
            } else {
                console.error(`  Error inserting ${name}:`, e.message);
            }
        }
    }

    console.log('\nMigration Complete!');
    await mongoose.disconnect();
    readline.close();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
