import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';
import Member from '@/lib/models/Member';
import Group from '@/lib/models/Group'; // Added missing import
import dbConnect from '@/lib/dbConnect';
import { Types } from 'mongoose'; // For TypeScript type safety

interface SessionUser {
    id: string;
    name?: string;
    email?: string;
    role: 'bishop' | 'leader';
    group?: string | Types.ObjectId;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!session || !user || user.role !== 'leader') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    dbConnect();

    try {
        if (!user.group) {
            return NextResponse.json({ error: 'Leader not assigned to a group' }, { status: 400 });
        }

        const members = await Member.find({ group: user.group }).populate('group');
        return NextResponse.json({ success: true, data: members });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;

    if (!session || !user || user.role !== 'leader') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

     dbConnect();

    try {
        const { name, phone } = await request.json();

        if (!name || !phone) {
            return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
        }

        if (!user.group) {
            return NextResponse.json({ error: 'Leader not assigned to a group' }, { status: 400 });
        }

        const member = new Member({
            name,
            phone,
            group: user.group,
            createdBy: user.id
        });

        await member.save();

        // Add member to group
        await Group.findByIdAndUpdate(user.group, {
            $push: { members: member._id }
        });

        return NextResponse.json({
            success: true,
            data: {
                _id: member._id,
                name: member.name,
                phone: member.phone,
                group: member.group
            }
        }, { status: 201 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}