import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Attendance from "@/lib/models/Attendance"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect()
        const attendance = await Attendance.findById(params.id)
            .populate("group", "name")
            .populate("recordedBy", "firstName lastName")

        if (!attendance) {
            return NextResponse.json({ message: "Attendance record not found" }, { status: 404 })
        }

        return NextResponse.json({
            record: {
                id: attendance._id.toString(),
                group: attendance.group.name,
                groupId: attendance.group._id.toString(),
                date: attendance.date.toISOString().split("T")[0],
                presentCount: attendance.presentCount,
                absentCount: attendance.absentCount,
                attendancePercentage: attendance.attendancePercentage,
                recordedBy: `${attendance.recordedBy.firstName} ${attendance.recordedBy.lastName}`,
                recordedById: attendance.recordedBy._id.toString(),
                notes: attendance.notes,
            },
        })
    } catch (error) {
        console.error("Error fetching attendance record:", error)
        return NextResponse.json({ message: "Failed to fetch attendance record" }, { status: 500 })
    }
}
