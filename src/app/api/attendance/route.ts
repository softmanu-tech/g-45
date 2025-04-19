// src/app/api/attendance/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import {Attendance} from '@/lib/models/Attendance'
import {Group} from '@/lib/models/Group'
import type { NextApiRequest } from 'next'

interface AttendanceRequest {
    date: string
    groupId: string
    presentIds: string[]
}

export async function POST(request: Request) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Validate request body
        const { date, groupId, presentIds }: AttendanceRequest = await request.json()

        if (!date || !groupId || !presentIds) {
            return NextResponse.json(
                { error: 'Date, group ID and present IDs are required' },
                { status: 400 }
            )
        }

        // Validate date format
        const attendanceDate = new Date(date)
        if (isNaN(attendanceDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            )
        }

        await dbConnect()

        // Verify group exists and user is leader
        const group = await Group.findById(groupId)
        if (!group) {
            return NextResponse.json(
                { error: 'Group not found' },
                { status: 404 }
            )
        }

        if (group.leader.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'Only group leaders can record attendance' },
                { status: 403 }
            )
        }

        // Validate all present IDs are group members
        const invalidMembers = presentIds.filter(id =>
            !group.members.some(memberId => memberId.toString() === id)
        )
        if (invalidMembers.length > 0) {
            return NextResponse.json(
                {
                    error: `Invalid members: ${invalidMembers.join(', ')}`,
                    validMembers: group.members.map(m => m.toString())
                },
                { status: 400 }
            )
        }

        // Check for existing attendance record
        const existingAttendance = await Attendance.findOne({
            date: attendanceDate,
            group: groupId
        })
        if (existingAttendance) {
            return NextResponse.json(
                { error: 'Attendance already recorded for this date' },
                { status: 400 }
            )
        }

        // Create new attendance record
        const attendance = new Attendance({
            date: attendanceDate,
            group: groupId,
            presentCount: presentIds.length,
            absentCount: group.members.length - presentIds.length,
            presentMembers: presentIds,
            recordedBy: session.user.id
        })

        await attendance.save()

        return NextResponse.json({
            message: 'Attendance recorded successfully',
            data: {
                id: attendance._id.toString(),
                date: attendance.date.toISOString().split('T')[0],
                group: group.name,
                presentCount: attendance.presentCount,
                absentCount: attendance.absentCount
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Attendance recording error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}