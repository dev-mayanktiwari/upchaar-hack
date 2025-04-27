"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { doctorAppointmentService } from "@/lib/api-client";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    approvedAppointments: 0,
    totalPatients: 0,
    upcomingLeaves: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res: any = await doctorAppointmentService.getAllAppointments();
        const pat: any = await doctorAppointmentService.getPatientCount();
        const leaves: any = await doctorAppointmentService.getUpcomingLeaves();
        // console.log("Patient Count:", pat);
        // Mock data
        setStats({
          pendingAppointments: res.data.pending,
          approvedAppointments: res.data.approved,
          totalPatients: pat.data.patients,
          upcomingLeaves: leaves.data,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Doctor. Here&apos;s an overview of your appointments
            and activities.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pending Appointments"
            value={stats.pendingAppointments}
            description="Awaiting your approval"
            icon={<Calendar className="h-5 w-5 text-rose-500" />}
            isLoading={isLoading}
            href="/dashboard/manage-appointments"
          />
          <StatsCard
            title="Approved Appointments"
            value={stats.approvedAppointments}
            description="Ready to be scheduled"
            icon={<ClipboardList className="h-5 w-5 text-rose-500" />}
            isLoading={isLoading}
            href="/dashboard/approved-appointments"
          />
          <StatsCard
            title="Total Patients"
            value={stats.totalPatients}
            description="Under your care"
            icon={<Users className="h-5 w-5 text-rose-500" />}
            isLoading={isLoading}
            href="/dashboard/patients"
          />
          <StatsCard
            title="Upcoming Leaves"
            value={stats.upcomingLeaves}
            description="Scheduled time off"
            icon={<Clock className="h-5 w-5 text-rose-500" />}
            isLoading={isLoading}
            href="/dashboard/request-leave"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/dashboard/manage-appointments">
                  <Button className="w-full justify-start bg-rose-500 hover:bg-rose-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Pending Appointments
                  </Button>
                </Link>
                <Link href="/dashboard/request-leave">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Request Leave
                  </Button>
                </Link>
                <Link href="/dashboard/medai-bot">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    Ask MedAI Bot
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <ActivityItem
                  title="Appointment Approved"
                  description="You approved John Doe's appointment request"
                  time="2 hours ago"
                />
                <ActivityItem
                  title="Leave Request Approved"
                  description="Your leave request for next week was approved"
                  time="Yesterday"
                />
                <ActivityItem
                  title="New Patient Assigned"
                  description="Sarah Johnson was assigned to you"
                  time="2 days ago"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
  isLoading,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20 p-2">
              {icon}
            </div>
            <div className="flex items-center justify-center rounded-full bg-muted p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <h3 className="font-medium tracking-tight text-sm">{title}</h3>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="text-2xl font-bold">{value}</div>
            )}
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActivityItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-xs text-muted-foreground">{time}</div>
    </div>
  );
}
