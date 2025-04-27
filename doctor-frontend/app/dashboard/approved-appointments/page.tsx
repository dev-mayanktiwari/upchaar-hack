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
import { CalendarIcon, Clock, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { doctorAppointmentService } from "@/lib/api-client";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  cause: string;
  approvedAt: string;
  status: "approved";
}

export default function ApprovedAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const appointments: any =
        await doctorAppointmentService.getAllAppointments();
      console.log("Appointments:", appointments);
      const approvedAppointments = appointments.data?.appointments.filter(
        (appointment: any) => appointment.status === "CONFIRMED"
      );
      // const mockAppointments: Appointment[] = [
      //   {
      //     id: "1",
      //     patientId: "p1",
      //     patientName: "Alice Smith",
      //     age: 35,
      //     cause: "Annual checkup and blood work",
      //     approvedAt: "2025-04-22T10:30:00",
      //     status: "approved",
      //   },
      //   {
      //     id: "2",
      //     patientId: "p2",
      //     patientName: "David Wilson",
      //     age: 42,
      //     cause: "Persistent headaches and fatigue",
      //     approvedAt: "2025-04-22T14:15:00",
      //     status: "approved",
      //   },
      //   {
      //     id: "3",
      //     patientId: "p3",
      //     patientName: "Maria Rodriguez",
      //     age: 28,
      //     cause: "Pregnancy confirmation and initial consultation",
      //     approvedAt: "2025-04-23T09:00:00",
      //     status: "approved",
      //   },
      //   {
      //     id: "4",
      //     patientId: "p4",
      //     patientName: "James Thompson",
      //     age: 67,
      //     cause: "Follow-up for diabetes management",
      //     approvedAt: "2025-04-23T11:30:00",
      //     status: "approved",
      //   },
      // ];

      setAppointments(approvedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load approved appointments. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleScheduleAppointment = async (id: string) => {
  //   try {
  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 500));

  //     toast({
  //       title: "Appointment scheduled",
  //       description: "You have successfully scheduled the appointment.",
  //     });

  //     // Update local state
  //     setAppointments(
  //       appointments.filter((appointment) => appointment.id !== id)
  //     );
  //   } catch (error) {
  //     console.error("Error scheduling appointment:", error);
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Failed to schedule appointment. Please try again.",
  //     });
  //   }
  // };

  const handleViewPatient = (patientId: string) => {
    router.push(`/dashboard/patients/${patientId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Approved Appointments
            </h1>
            <p className="text-muted-foreground">
              Schedule and manage approved appointment requests
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
                  <Skeleton className="h-9 w-32" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mt-2 text-lg font-semibold">
              No approved appointments
            </h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              There are no approved appointments waiting to be scheduled for
              this date.
            </p>
            <Button onClick={() => setDate(undefined)} variant="outline">
              View all dates
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment) => (
              <ApprovedAppointmentCard
                key={appointment.id}
                appointment={appointment}
                onView={() => handleViewPatient(appointment.patientId)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ApprovedAppointmentCard({
  appointment,
  // onSchedule,
  onView,
}: {
  appointment: any;
  // onSchedule: () => void;
  onView: () => void;
}) {
  // const approvedDate = new Date(appointment.approvedAt)

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {appointment.patient.name}
            </h3>
            {/* <p className="text-sm text-muted-foreground">
              Age: {appointment.age} years
            </p> */}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Cause</h4>
            <p className="text-sm">{appointment.title}</p>
          </div>
          {/* <div className="space-y-1">
            <h4 className="text-sm font-medium">Approved On</h4>
            <p className="text-sm">
              {format(approvedDate, "PPP")} at {format(approvedDate, "h:mm a")}
            </p>
          </div> */}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0 border-t">
        <Button
          variant="outline"
          size="sm"
          className="w-[80px]"
          onClick={onView}
        >
          <Eye className="mr-1 h-4 w-4" />
          View
        </Button>
        {/* <Button
          size="sm"
          className="w-[120px] bg-rose-500 hover:bg-rose-600"
          onClick={onSchedule}
        >
          <Clock className="mr-1 h-4 w-4" />
          Schedule Now
        </Button> */}
      </CardFooter>
    </Card>
  );
}
