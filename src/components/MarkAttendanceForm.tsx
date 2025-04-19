"use client"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
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
import { Toaster } from "@/components/ui/sonner"


interface Member {
    _id: string
    name: string
}

interface MarkAttendanceFormProps {
    groupId: string
    members: Member[]
    onAttendanceMarked: () => void
}

export function MarkAttendanceForm({
                                       groupId,
                                       members,
                                       onAttendanceMarked,
                                   }: MarkAttendanceFormProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [presentMembers, setPresentMembers] = useState<Record<string, boolean>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCheckboxChange = (memberId: string) => {
        setPresentMembers(prev => ({
            ...prev,
            [memberId]: !prev[memberId]
        }))
    }

    const handleSubmit = async () => {
        if (!date) return

        try {
            setIsSubmitting(true)

            const presentIds = Object.entries(presentMembers)
                .filter(([, isPresent]) => isPresent)  // Using comma to ignore first param
                .map(([id]) => id)

            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: date.toISOString(),
                    groupId,
                    presentIds,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to mark attendance")
            }

            // Reset form
            setPresentMembers({})
            onAttendanceMarked()

            Toaster({
                title: "Success",
                description: "Attendance marked successfully",
                variant: "default",
            })

        } catch (error) {
            console.error("Error marking attendance:", error)
            Toaster({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to mark attendance",
                variant: "error",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                                isSubmitting && "opacity-50"
                            )}
                            disabled={isSubmitting}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) => date > new Date() || isSubmitting}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <Label>Mark Present Members</Label>
                <div className="space-y-3">
                    {members.map(member => (
                        <div key={member._id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`member-${member._id}`}
                                checked={!!presentMembers[member._id]}
                                onCheckedChange={() => handleCheckboxChange(member._id)}
                                disabled={isSubmitting}
                            />
                            <label
                                htmlFor={`member-${member._id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {member.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !date || members.length === 0}
                className="w-full sm:w-auto"
            >
                {isSubmitting ? (
                    <>
                        <span className="animate-spin mr-2">↻</span>
                        Submitting...
                    </>
                ) : "Mark Attendance"}
            </Button>
        </div>
    )
}