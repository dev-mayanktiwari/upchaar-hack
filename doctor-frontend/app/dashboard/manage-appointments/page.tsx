"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { doctorAppointmentService } from "@/lib/api-client";

interface Appointment {
  id: string;
  patientName: string;
  age: number;
  cause: string;
  requestedAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Simulate API response
      const res: any = await doctorAppointmentService.getAllAppointments();
      const appointments = res.data?.appointments;
      // const mockAppointments: Appointment[] = [
      //   {
      //     id: "1",
      //     patientName: "John Doe",
      //     age: 45,
      //     cause: "Chest pain and shortness of breath",
      //     requestedAt: "2025-04-23T10:30:00",
      //     status: "pen",
      //   },
      //   {
      //     id: "2",
      //     patientName: "Sarah Johnson",
      //     age: 32,
      //     cause: "Migraine and dizziness",
      //     requestedAt: "2025-04-23T14:15:00",
      //     status: "pending",
      //   },
      //   {
      //     id: "3",
      //     patientName: "Michael Brown",
      //     age: 58,
      //     cause: "Follow-up for hypertension",
      //     requestedAt: "2025-04-23T16:00:00",
      //     status: "pending",
      //   },
      //   {
      //     id: "4",
      //     patientName: "Emily Wilson",
      //     age: 27,
      //     cause: "Persistent cough and fever",
      //     requestedAt: "2025-04-24T09:45:00",
      //     status: "pending",
      //   },
      //   {
      //     id: "5",
      //     patientName: "Robert Garcia",
      //     age: 62,
      //     cause: "Joint pain and stiffness",
      //     requestedAt: "2025-04-24T11:30:00",
      //     status: "pending",
      //   },
      // ]

      setAppointments(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load appointments. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppointmentAction = async (
    id: string,
    action: "CONFIRMED" | "CANCELLED"
  ) => {
    try {
      // Simulate API call
      const res: any = await doctorAppointmentService.handleAppointment(
        id,
        action
      );
      // Update local state
      setAppointments(
        appointments.filter((appointment) => appointment.id !== id)
      );

      toast({
        title: `Appointment ${
          action === "CONFIRMED" ? "CONFIRMED" : "CANCELLED"
        }`,
        description: `You have successfully ${
          action === "CONFIRMED" ? "CONFIRMED" : "CANCELLED"
        } the appointment.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} appointment. Please try again.`,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Appointments
            </h1>
            <p className="text-muted-foreground">
              Review and manage pending appointment requests
            </p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden shadow-sm">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <CardFooter className="flex justify-between p-6 pt-0 border-t">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mt-2 text-lg font-semibold">
              No pending appointments
            </h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              There are no pending appointment requests for this date.
            </p>
            <Button onClick={() => setDate(undefined)} variant="outline">
              View all dates
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onApprove={() =>
                  handleAppointmentAction(appointment.id, "CONFIRMED")
                }
                onReject={() =>
                  handleAppointmentAction(appointment.id, "CANCELLED")
                }
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function AppointmentCard({
  appointment,
  onApprove,
  onReject,
}: {
  appointment: any;
  onApprove: () => void;
  onReject: () => void;
}) {
  const requestedDate = new Date(appointment.time);

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
            <p className="text-sm text-muted-foreground">
              Age: {appointment.age} years
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Reason for Visit</h4>
            <p className="text-sm">{appointment.title}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Requested Time</h4>
            <p className="text-sm">
              {format(requestedDate, "PPP")} at{" "}
              {format(requestedDate, "h:mm a")}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-[80px] text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 dark:hover:bg-red-950 dark:hover:text-red-300"
          onClick={onReject}
        >
          <X className="mr-1 h-4 w-4" />
          Reject
        </Button>
        <Button
          size="sm"
          className="w-[80px] bg-rose-500 hover:bg-rose-600"
          onClick={onApprove}
        >
          <Check className="mr-1 h-4 w-4" />
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}
