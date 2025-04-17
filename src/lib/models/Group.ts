// lib/models/Group.ts
import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
}, { timestamps: true });

export default mongoose.models.Group || mongoose.model('Group', GroupSchema);