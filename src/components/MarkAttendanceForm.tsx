"use client"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Member {
    _id: string
    name: string
    email?: string
}

interface Event {
    _id: string
    title: string
    date: string
}

interface MarkAttendanceFormProps {
    groupId: string
    members: Member[]
    onAttendanceMarked: () => void
    currentUserId: string
}

export function MarkAttendanceForm({
                                       groupId,
                                       members,
                                       onAttendanceMarked,
                                       currentUserId
                                   }: MarkAttendanceFormProps) {
    const [draftAttendance, setDraftAttendance] = useLocalStorage<{
        date?: string
        presentMembers: Record<string, boolean>
        selectedEventId?: string
    }>(`attendance-draft-${groupId}`, {
        presentMembers: members.reduce((acc, member) => ({
            ...acc,
            [member._id]: true
        }), {})
    })

    const [date, setDate] = useState<Date | undefined>(
        draftAttendance.date ? new Date(draftAttendance.date) : new Date()
    )
    const [presentMembers, setPresentMembers] = useState<Record<string, boolean>>(
        draftAttendance.presentMembers
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState<string>(
        draftAttendance.selectedEventId || ""
    )
    const [isLoadingEvents, setIsLoadingEvents] = useState(false)

    useEffect(() => {
        setDraftAttendance({
            date: date?.toISOString(),
            presentMembers,
            selectedEventId
        })
    }, [date, presentMembers, selectedEventId, setDraftAttendance])

    const fetchEvents = useCallback(async () => {
        if (!groupId) return

        try {
            setIsLoadingEvents(true)
            const response = await fetch(`/api/events?groupId=${groupId}`)

            if (!response.ok) {
                const error = await response.json().catch(() => ({}))
                return Promise.reject(new Error(error.message || "Failed to fetch events"))
            }

            const data = await response.json()
            const now = new Date()
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

            setEvents(
                data.events.filter((event: Event) => {
                    const eventDate = new Date(event.date)
                    return eventDate >= thirtyDaysAgo
                }).sort((a: Event, b: Event) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
            )
        } catch (error) {
            console.error("Error fetching events:", error)
            toast.error("Failed to load events. Please try again.")
        } finally {
            setIsLoadingEvents(false)
        }
    }, [groupId])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const handleCheckboxChange = (memberId: string) => {
        setPresentMembers(prev => ({
            ...prev,
            [memberId]: !prev[memberId]
        }))
    }

    const handleSelectAll = (select: boolean) => {
        const newPresentMembers = members.reduce((acc, member) => ({
            ...acc,
            [member._id]: select
        }), {})

        setPresentMembers(newPresentMembers)
    }

    const handleSubmit = async () => {
        if (!date) {
            toast.error("Please select a date")
            return
        }

        if (date > new Date()) {
            toast.error("Attendance date cannot be in the future")
            return
        }

        const presentCount = Object.values(presentMembers).filter(Boolean).length
        if (presentCount === 0) {
            toast.error("Please mark at least one member as present")
            return
        }

        try {
            setIsSubmitting(true)

            const presentIds = Object.entries(presentMembers)
                .filter(([, isPresent]) => isPresent)
                .map(([id]) => id)

            const absentIds = members
                .filter(member => !presentIds.includes(member._id))
                .map(member => member._id)

            const payload = {
                date: date.toISOString(),
                groupId,
                presentMembers: presentIds,
                absentMembers: absentIds,
                recordedBy: currentUserId,
                ...(selectedEventId && { eventId: selectedEventId })
            }

            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({}))
                throw new Error(error.message || "Failed to mark attendance")
            }

            setPresentMembers(members.reduce((acc, member) => ({
                ...acc,
                [member._id]: true
            }), {}))
            setSelectedEventId("")
            setDraftAttendance({ presentMembers: {} })

            toast.success("Attendance recorded successfully")
            onAttendanceMarked()

        } catch (error) {
            console.error("Error marking attendance:", error)
            toast.error(error instanceof Error ? error.message : "Failed to mark attendance")
        } finally {
            setIsSubmitting(false)
        }
    }

    const presentCount = Object.values(presentMembers).filter(Boolean).length
    const attendancePercentage = members.length > 0
        ? Math.round((presentCount / members.length) * 100)
        : 0

    return (
        <div className="space-y-6">
            {/* ... rest of your JSX remains the same ... */}
        </div>
    )
}