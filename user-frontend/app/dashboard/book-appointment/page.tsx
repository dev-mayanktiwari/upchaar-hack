"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { appointmentSchema } from "@/lib/schemas";
import axios from "axios";

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

// Time slots for appointment
const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

interface Hospital {
  id: number;
  name: string;
  departments: Department[];
}

interface Department {
  id: number;
  name: string;
  doctors: Doctor[];
}

interface Doctor {
  id: number;
  name: string;
  email: string;
}

export default function BookAppointmentPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Data states
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      hospitalId: "",
      departmentId: "",
      doctorId: "",
      title: "",
      time: "",
      date: "",
    },
  });

  // Fetch hospitals on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:6969/api/v1/hospital/get-all-hospitals"
        );

        if (response.data.success) {
          setHospitals(response.data.data.hospitals);
        } else {
          toast({
            title: "Error fetching hospitals",
            description: response.data.message || "Failed to load hospitals",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        toast({
          title: "Error fetching hospitals",
          description:
            error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitals();
  }, [toast]);

  // Handle hospital selection
  const handleHospitalChange = (hospitalId: string) => {
    const hospital =
      hospitals.find((h) => h.id.toString() === hospitalId) || null;
    setSelectedHospital(hospital);
    setSelectedDepartment(null);

    form.setValue("hospitalId", hospitalId);
    form.setValue("departmentId", "");
    form.setValue("doctorId", "");
  };

  // Handle department selection
  const handleDepartmentChange = (departmentId: string) => {
    if (!selectedHospital) return;

    const department =
      selectedHospital.departments.find(
        (d) => d.id.toString() === departmentId
      ) || null;
    setSelectedDepartment(department);

    form.setValue("departmentId", departmentId);
    form.setValue("doctorId", "");
  };

  // When date changes, update the form
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue("date", format(date, "yyyy-MM-dd"));
    } else {
      form.setValue("date", "");
    }
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      setIsSubmitting(true);

      // Call the API to book appointment
      const response = await axios.post(
        "http://localhost:6969/api/v1/user/book-appointment",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data.success) {
        setIsSuccess(true);
        toast({
          title: "Appointment booked successfully",
          description: `Your appointment has been scheduled for ${format(
            new Date(data.date),
            "PPP"
          )} at ${data.time}`,
        });
      } else {
        toast({
          title: "Failed to book appointment",
          description: response.data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Failed to book appointment",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedDate(undefined);
    setSelectedHospital(null);
    setSelectedDepartment(null);
    setIsSuccess(false);
  };

  // Calculate date range (today to 5 days from now)
  const today = new Date();
  const maxDate = addDays(today, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Book an Appointment
          </h1>
          <p className="text-muted-foreground">
            Schedule a new appointment with a healthcare provider
          </p>
        </div>

        {isSuccess ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold">
                  Appointment Booked Successfully
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Your appointment has been scheduled. You can view and manage
                  your appointments in the My Appointments section.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button onClick={resetForm} variant="outline">
                    Book Another Appointment
                  </Button>
                  <Button asChild>
                    <a href="/dashboard/appointments">View My Appointments</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                Select a date, time, and provider for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading hospitals...</span>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Hospital Selection */}
                      <FormField
                        control={form.control}
                        name="hospitalId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                handleHospitalChange(value)
                              }
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a hospital" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {hospitals.map((hospital) => (
                                  <SelectItem
                                    key={hospital.id}
                                    value={hospital.id.toString()}
                                  >
                                    {hospital.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Department Selection */}
                      <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                handleDepartmentChange(value)
                              }
                              defaultValue={field.value}
                              disabled={!selectedHospital}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={
                                      selectedHospital
                                        ? "Select a department"
                                        : "Select a hospital first"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedHospital?.departments.map(
                                  (department) => (
                                    <SelectItem
                                      key={department.id}
                                      value={department.id.toString()}
                                    >
                                      {department.name}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Doctor Selection */}
                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Doctor</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-1"
                              disabled={!selectedDepartment}
                            >
                              {selectedDepartment ? (
                                selectedDepartment.doctors.map((doctor) => (
                                  <FormItem
                                    key={doctor.id}
                                    className="flex items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <RadioGroupItem
                                        value={doctor.id.toString()}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {doctor.name}
                                      <span className="text-xs text-muted-foreground ml-2">
                                        ({doctor.email})
                                      </span>
                                    </FormLabel>
                                  </FormItem>
                                ))
                              ) : (
                                <div className="text-sm text-muted-foreground py-2">
                                  Please select a department to view available
                                  doctors
                                </div>
                              )}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Date Selection */}
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Appointment Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value
                                        ? "text-muted-foreground"
                                        : ""
                                    }`}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP")
                                    ) : (
                                      <span>Select a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={handleDateSelect}
                                  disabled={(date) =>
                                    date < today ||
                                    date > maxDate ||
                                    date.getDay() === 0 ||
                                    date.getDay() === 6
                                  }
                                  fromDate={today}
                                  toDate={maxDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Appointments are available for the next 5 days,
                              excluding weekends.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Time Slot Selection */}
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Slot</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeSlots.map((slot) => (
                                  <SelectItem key={slot} value={slot}>
                                    <div className="flex items-center">
                                      <Clock className="mr-2 h-4 w-4" />
                                      {slot}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Reason for Visit */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Visit</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please briefly describe the reason for your appointment"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This information helps the doctor prepare for your
                            appointment.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Booking Appointment...
                        </>
                      ) : (
                        "Book Appointment"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
