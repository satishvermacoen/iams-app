import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://satishvermacoen:feCSPEAhzsI4rbfy@cluster0.gf20g57.mongodb.net/iams_db';

// Define schemas inline to avoid import issues with Next.js specific paths (@/models...)
const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }
});
const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

const programSchema = new mongoose.Schema({
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    durationYears: { type: Number, required: true }
});
const Program = mongoose.models.Program || mongoose.model('Program', programSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // 1. Create Department
        let dept = await Department.findOne({ code: 'CSE' });
        if (!dept) {
            dept = await Department.create({ name: 'Computer Science & Engineering', code: 'CSE' });
            console.log('Created Department:', dept.name);
        } else {
            console.log('Department exists:', dept.name);
        }

        // 2. Create Program
        let prog = await Program.findOne({ code: 'BTECH-CS' });
        if (!prog) {
            prog = await Program.create({
                department: dept._id,
                name: 'B.Tech Computer Science',
                code: 'BTECH-CS',
                durationYears: 4
            });
            console.log('Created Program:', prog.name);
        } else {
            console.log('Program exists:', prog.name);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Seed error:', err);
    }
}

seed();
