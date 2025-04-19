// src/lib/models/Attendance.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Event } from './Event';
import { User } from './User';
import { Group } from './Group';

// TypeScript interface for the Attendance document
export interface IAttendance extends Document {
    event: mongoose.Types.ObjectId | typeof Event;
    group: mongoose.Types.ObjectId | typeof Group;
    date: Date;
    presentMembers: mongoose.Types.ObjectId[] | typeof User[];
    absentMembers: mongoose.Types.ObjectId[] | typeof User[];
    recordedBy: mongoose.Types.ObjectId | typeof User;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema definition
const AttendanceSchema: Schema<IAttendance> = new Schema(
    {
        event: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event reference is required'],
        },
        group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: [true, 'Group reference is required'],
        },
        date: {
            type: Date,
            required: [true, 'Attendance date is required'],
            default: Date.now,
        },
        presentMembers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        absentMembers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        recordedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recorder information is required'],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for better query performance
AttendanceSchema.index({ event: 1 });
AttendanceSchema.index({ group: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ recordedBy: 1 });
AttendanceSchema.index({ 'presentMembers': 1 });
AttendanceSchema.index({ 'absentMembers': 1 });

// Pre-save hooks for data validation
AttendanceSchema.pre<IAttendance>('save', async function (next) {
    // Validate event exists
    const event = await Event.findById(this.event);
    if (!event) {
        throw new Error('Referenced event does not exist');
    }

    // Validate group exists
    const group = await Group.findById(this.group);
    if (!group) {
        throw new Error('Referenced group does not exist');
    }

    // Validate recordedBy user exists
    const recorder = await User.findById(this.recordedBy);
    if (!recorder) {
        throw new Error('Referenced user does not exist');
    }

    // Validate all present members exist and belong to the group
    for (const memberId of this.presentMembers) {
        const member = await User.findById(memberId);
        if (!member || !group.members.includes(memberId)) {
            throw new Error(`Member ${memberId} not found in group`);
        }
    }

    // Validate all absent members exist and belong to the group
    for (const memberId of this.absentMembers) {
        const member = await User.findById(memberId);
        if (!member || !group.members.includes(memberId)) {
            throw new Error(`Member ${memberId} not found in group`);
        }
    }

    next();
});

// Static methods
interface AttendanceModel extends Model<IAttendance> {
    findByEvent(eventId: string): Promise<IAttendance[]>;
    findByGroup(groupId: string): Promise<IAttendance[]>;
    findByMember(memberId: string): Promise<IAttendance[]>;
}

AttendanceSchema.statics.findByEvent = async function (eventId: string) {
    return this.find({ event: eventId }).sort({ date: -1 });
};

AttendanceSchema.statics.findByGroup = async function (groupId: string) {
    return this.find({ group: groupId }).sort({ date: -1 });
};

AttendanceSchema.statics.findByMember = async function (memberId: string) {
    return this.find({
        $or: [
            { presentMembers: memberId },
            { absentMembers: memberId }
        ]
    }).sort({ date: -1 });
};

// Instance methods
AttendanceSchema.methods.getAttendancePercentage = function (): number {
    const totalMembers = this.presentMembers.length + this.absentMembers.length;
    return totalMembers > 0
        ? Math.round((this.presentMembers.length / totalMembers) * 100)
        : 0;
};

// Create and export the model
export const Attendance: AttendanceModel = mongoose.models.Attendance as AttendanceModel ||
    mongoose.model<IAttendance, AttendanceModel>('Attendance', AttendanceSchema);