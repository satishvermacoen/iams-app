const { connectDB } = require('../src/lib/db');
const Program = require('../src/models/Program');
const mongoose = require('mongoose');

// Mock environment variables since we are running this script directly
process.env.MONGODB_URI = 'mongodb://localhost:27017';

async function seedProgram() {
    try {
        // We need to connect using the same logic as the app, but since we are outside Next.js context,
        // we might need to adjust the db connection logic or just use mongoose directly here.
        // However, src/lib/db.js uses process.env.MONGODB_URI.
        // Let's just use mongoose directly for this script to be safe and simple.

        await mongoose.connect('mongodb://localhost:27017/iams_db');
        console.log('Connected to DB');

        const existing = await Program.findOne({ code: 'CS101' });
        if (existing) {
            console.log('Program CS101 already exists:', existing._id);
        } else {
            const prog = await Program.create({
                name: 'Computer Science',
                code: 'CS101',
                description: 'B.Tech in Computer Science',
                durationSemesters: 8,
                isActive: true
            });
            console.log('Created Program:', prog._id);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Seed error:', err);
    }
}

seedProgram();
