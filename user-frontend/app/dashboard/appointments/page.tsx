"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  X,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import axios from "axios";
import { appointmentService } from "@/lib/api-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface Appointment {
  id: number;
  title: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  patientId: string;
  hospitalId: number;
  departmentId: number;
  doctorId: number;
  hospital: {
    name: string;
  };
  doctor: {
    name: string;
  };
  department: {
    name: string;
  };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Check if we're in the browser environment before accessing localStorage
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No authentication token found");
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      // Use relative URL or environment variable for API endpoint
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969";
      const response = await appointmentService.getAllAppointments();
      // console.log("Response data:", response.data);
      // @ts-ignore
      if (response.success) {
        // @ts-ignore
        setAppointments(response.data);
        // @ts-ignore
        setFilteredAppointments(response.data);
      } else {
        // @ts-ignore
        console.error("Failed to fetch appointments:", response.message);
        // @ts-ignore
        setError(response.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);

      // Enhanced error logging and user feedback
      // @ts-ignore
      if (error.response) {
        // @ts-ignore
        console.error("Response data:", error.response.data);
        // @ts-ignore
        console.error("Response status:", error.response.status);
        setError(
          // @ts-ignore
          `Error ${error.response.status}: ${
            // @ts-ignore
            error.response.data?.message || "Failed to fetch appointments"
          }`
        );
        // @ts-ignore
      } else if (error.request) {
        console.error("Request sent but no response received");
        setError(
          "Network error: No response received from server. Please check your connection."
        );
      } else {
        // @ts-ignore
        console.error("Error setting up request:", error.message);
        // @ts-ignore
        setError("Error making request: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAppointments(appointments);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = appointments.filter(
        (appointment) =>
          appointment.doctor.name.toLowerCase().includes(query) ||
          appointment.hospital.name.toLowerCase().includes(query) ||
          appointment.title.toLowerCase().includes(query)
      );
      setFilteredAppointments(filtered);
    }
  }, [searchQuery, appointments]);

  // Get upcoming and past appointments
  const today = new Date();
  const upcomingAppointments = filteredAppointments.filter(
    (appointment) =>
      new Date(appointment.time) >= today && appointment.status !== "CANCELLED"
  );
  const pastAppointments = filteredAppointments.filter(
    (appointment) =>
      new Date(appointment.time) < today || appointment.status === "CANCELLED"
  );

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">{status}</Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
        );
      case "CANCELLED":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Content for the error state
  const ErrorContent = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <X className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-medium">Error loading appointments</h3>
      <p className="text-sm text-muted-foreground mb-4">{error}</p>
      <Button onClick={() => fetchAppointments()}>Try Again</Button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              My Appointments
            </h1>
            <p className="text-muted-foreground">
              View and manage your appointments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchAppointments}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
            <Button asChild>
              <Link href="/dashboard/book-appointment">
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search appointments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-9 w-9 rounded-l-none"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingAppointments.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {upcomingAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              Past
              {pastAppointments.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {pastAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>
                  Your scheduled appointments that are coming up
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-4 w-full">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <ErrorContent />
                ) : upcomingAppointments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Hospital</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="font-medium">
                                {format(
                                  new Date(appointment.time),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {format(new Date(appointment.time), "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>{appointment.doctor.name}</TableCell>
                            <TableCell>{appointment.hospital.name}</TableCell>
                            <TableCell>{appointment.title}</TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                    <Button asChild>
                      <Link href="/dashboard/book-appointment">
                        Book an Appointment
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Appointments</CardTitle>
                <CardDescription>
                  Your previous appointments and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-4 w-full">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <ErrorContent />
                ) : pastAppointments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Hospital</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pastAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="font-medium">
                                {format(
                                  new Date(appointment.time),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {dayjs(appointment.time)
                                  .tz("Asia/Kolkata")
                                  .format("h:mm A")}
                              </div>
                            </TableCell>
                            <TableCell>{appointment.doctor.name}</TableCell>
                            <TableCell>{appointment.hospital.name}</TableCell>
                            <TableCell>{appointment.title}</TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      No past appointments
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any past appointments to display.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
