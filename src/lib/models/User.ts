

// lib/models/User.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'bishop' | 'leader';
    group?: mongoose.Types.ObjectId;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['bishop', 'leader'], required: true },
        group: { type: Schema.Types.ObjectId, ref: 'Group' },
    },
    { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
