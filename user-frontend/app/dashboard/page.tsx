"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ClipboardList,
  MessageSquare,
  Pill,
  AlertTriangle,
  ArrowRight,
  Hospital,
} from "lucide-react";
import Link from "next/link";
import { appointmentService } from "@/lib/api-client";
import { format } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
interface User {
  name: string;
}

// interface Appointment {
//   id: string;
//   date: string;
//   timeSlot: string;
//   doctorName: string;
//   hospitalName: string;
//   status: string;
// }

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch upcoming appointments
    const fetchAppointments = async () => {
      try {
        // This would normally come from the API
        // const response = await appointmentService.getAllAppointments()
        // setUpcomingAppointments(response.data.appointments)

        // Mock data for demonstration
        const response = await appointmentService.getAllAppointments();
        // @ts-ignore
        if (response.success) {
          // @ts-ignore
          setUpcomingAppointments(response.data);
          // console.log("response", response.data);
        }
        // setUpcomingAppointments([
        //   {
        //     id: "1",
        //     date: "2023-08-25",
        //     timeSlot: "10:00 AM",
        //     doctorName: "Dr. Sarah Johnson",
        //     hospitalName: "City General Hospital",
        //     status: "Confirmed",
        //   },
        //   {
        //     id: "2",
        //     date: "2023-09-02",
        //     timeSlot: "2:30 PM",
        //     doctorName: "Dr. Michael Chen",
        //     hospitalName: "Riverside Medical Center",
        //     status: "Pending",
        //   },
        // ])
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your health dashboard
          </p>
        </div>

        {/* Quick Actions */}
        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="View Partnered Hospitals"
            description="View available hospitals for appointments"
            icon={<Hospital className="h-6 w-6" />}
            href="/hospitals"
          />
          <QuickActionCard
            title="Book Appointment"
            description="Schedule a new appointment with a doctor"
            icon={<Calendar className="h-6 w-6" />}
            href="/dashboard/book-appointment"
          />
          <QuickActionCard
            title="My Appointments"
            description="View and manage your appointments"
            icon={<ClipboardList className="h-6 w-6" />}
            href="/dashboard/appointments"
          />
          <QuickActionCard
            title="Medications"
            description="Manage your medications and prescriptions"
            icon={<Pill className="h-6 w-6" />}
            href="/dashboard/medications"
          />
          <QuickActionCard
            title="MedAI Bot"
            description="Get answers to your medical questions"
            icon={<MessageSquare className="h-6 w-6" />}
            href="/dashboard/medai-bot"
          />
        </div> */}

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </div>
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-center">
                  <div className="h-4 w-32 bg-muted rounded mb-2 mx-auto"></div>
                  <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
                </div>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">
                        {appointment.hospital?.name || "Hospital not specified"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.doctor?.name || "Doctor not specified"} •{" "}
                        {appointment.department?.name &&
                          `${appointment.department.name} • `}
                        {format(new Date(appointment.time), "MMM dd, yyyy")} •{" "}
                        {dayjs(appointment.time)
                          .tz("Asia/Kolkata")
                          .format("h:mm A")}
                      </div>
                      {appointment.title && (
                        <div className="text-sm italic">
                          {appointment.title}
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        appointment.status === "CONFIRMED"
                          ? "text-green-600 dark:text-green-500"
                          : appointment.status === "PENDING"
                          ? "text-amber-600 dark:text-amber-500"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {appointment.status.charAt(0) +
                        appointment.status.slice(1).toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  No upcoming appointments
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any appointments scheduled yet.
                </p>
                <Link href="/dashboard/book-appointment">
                  <Button>Book an Appointment</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drug Interaction Test */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Drug Interaction Test</h3>
                  <p className="text-sm text-muted-foreground">
                    Check if your medications have any potential interactions
                  </p>
                </div>
              </div>
              <Link href="/dashboard/drug-interaction">
                <Button className="w-full md:w-auto">
                  Start Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="rounded-full bg-primary/10 p-3 w-fit">{icon}</div>
            <div className="space-y-1">
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
