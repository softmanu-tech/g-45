'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {CalendarIcon, Layers, Users} from 'lucide-react';

interface DashboardStats {
    leaders: number;
    groups: number;
    members: number;
    totalAttendance: number;
}

interface Event {
    _id: string;
    title: string;
    date: string;
    createdBy: {
        _id: string;
        name: string;
    };
    group: {
        _id: string;
        name: string;
    };
}

interface AttendanceRecord {
    _id: string;
    date: string;
    count: number;
    group: {
        _id: string;
        name: string;
    };
    leader: {
        _id: string;
        name: string;
    };
}

interface Member {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    group: {
        _id: string;
        name: string;
    };
}

export default function BishopDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        leaders: 0,
        groups: 0,
        members: 0,
        totalAttendance: 0
    });
    const [events, setEvents] = useState<Event[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch stats
                const statsRes = await fetch('/api/bishop');
                if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats');
                const statsData = await statsRes.json();

                // Fetch events
                const eventsRes = await fetch('/api/events');
                if (!eventsRes.ok) throw new Error('Failed to fetch events');
                const eventsData = await eventsRes.json();

                // Fetch attendance
                const attendanceRes = await fetch('/api/attendance');
                if (!attendanceRes.ok) throw new Error('Failed to fetch attendance');
                const attendanceData = await attendanceRes.json();

                // Fetch members
                const membersRes = await fetch('/api/members');
                if (!membersRes.ok) throw new Error('Failed to fetch members');
                const membersData = await membersRes.json();

                setStats({
                    leaders: statsData.leaders || 0,
                    groups: statsData.groups || 0,
                    members: statsData.members || 0,
                    totalAttendance: statsData.totalAttendance || 0
                });
                setEvents(eventsData.events || []);
                setAttendance(attendanceData.attendance || []);
                setMembers(membersData.members || []);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData().then( );
    }, []);

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto bg-blue-500 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Bishop Dashboard</h1>
                <div className="space-x-2">
                    <Link href="/bishop/leaders" className="btn bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-950">
                        Manage Leaders
                    </Link>
                    <Link href="/bishop/groups" className="btn bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-950">
                        Manage Groups
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">Loading dashboard data...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-slate-50 border-l-4 border-l-purple-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-gray-600">Leaders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-purple-700">{stats.leaders}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-50 border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-gray-600">Groups</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-blue-700">{stats.groups}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-50 border-l-4 border-l-green-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-gray-600">Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-green-700">{stats.members}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-50 border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-gray-600">Total Attendance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-amber-700">{stats.totalAttendance}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="attendance" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="attendance" className="flex items-center gap-2">
                                <Users className="h-4 w-4" /> Attendance
                            </TabsTrigger>
                            <TabsTrigger value="events" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" /> Events
                            </TabsTrigger>
                            <TabsTrigger value="members" className="flex items-center gap-2">
                                <Layers className="h-4 w-4" /> Members
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="attendance" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attendance Records</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leader</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {attendance.length > 0 ? (
                                                attendance.map((record) => (
                                                    <tr key={record._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(record.date)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.group.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{record.leader.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{record.count}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No attendance records found</td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="events" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Events</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {events.length > 0 ? (
                                                events.map((event) => (
                                                    <tr key={event._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{event.title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(event.date)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{event.group.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{event.createdBy.name}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No events found</td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="members" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Members</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {members.length > 0 ? (
                                                members.map((member) => (
                                                    <tr key={member._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{member.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{member.phone || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{member.email || '-'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{member.group.name}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No members found</td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}