import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models/User';
import { Group } from '@/lib/models/Group';

export async function GET() {
    await dbConnect();

    const leaders = await User.find({ role: 'leader' }).populate('group');
    const groups = await Group.find().populate('leader');

    return NextResponse.json({
        message: 'Bishop dashboard overview',
        totalLeaders: leaders.length,
        totalGroups: groups.length,
        leaders,
        groups,
    });
}
