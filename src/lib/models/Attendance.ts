import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    attended: { type: Boolean, required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);