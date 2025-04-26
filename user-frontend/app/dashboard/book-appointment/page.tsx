"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fetchDoctorAvailableSlots, fetchHospitals } from "@/lib/api/hospitals";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Steps } from "@/components/steps";
import {
  appointmentService,
  doctorService,
  hospitalService,
} from "@/lib/api-client";

interface Hospital {
  id: string;
  name: string;
  departments: Department[];
}

interface Department {
  id: number;
  name: string;
  doctors: Doctor[];
}

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface DaySchedule {
  date: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

const appointmentSchema = z.object({
  hospitalId: z.string().min(1, { message: "Please select a hospital" }),
  departmentId: z.number({ required_error: "Please select a department" }),
  doctorId: z.string().min(1, { message: "Please select a doctor" }),
  date: z.string().min(1, { message: "Please select a date" }),
  time: z.string().min(1, { message: "Please select a time" }),
  title: z
    .string()
    .min(3, { message: "Please enter a reason for your visit" })
    .max(100),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Data states
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null
  );
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<DaySchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimesForDate, setAvailableTimesForDate] = useState<
    TimeSlot[]
  >([]);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      hospitalId: "",
      departmentId: 0,
      doctorId: "",
      date: "",
      time: "",
      title: "",
    },
  });

  // Fetch hospitals on component mount
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setIsLoading(true);
        const res = await hospitalService.getAllHospitals();
        // @ts-ignore
        const data = res?.data?.hospitals;
        console.log("Data", data);
        // @ts-ignore
        setHospitals(data);

        // Check if hospital ID is in URL params
        const hospitalId = searchParams.get("hospital");
        if (hospitalId) {
          // @ts-ignore
          const hospital = data.find((h) => h.id === hospitalId);
          if (hospital) {
            setSelectedHospital(hospital);
            form.setValue("hospitalId", hospitalId);
          }
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load hospitals. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHospitals();
  }, [searchParams, form, toast]);

  // Fetch doctor's available slots when doctor is selected
  useEffect(() => {
    const loadDoctorSlots = async () => {
      if (!selectedDoctor) return;

      try {
        setIsLoading(true);
        const resSlots = await doctorService.getAvailableSlots(
          selectedDoctor.id
        );
        // @ts-ignore
        const slots = resSlots?.data || [];
        console.log("Doctor slots response:", resSlots);
        // @ts-ignore
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error fetching doctor slots:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to load doctor's availability. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDoctor) {
      loadDoctorSlots();
    }
  }, [selectedDoctor, toast]);

  // Update available times when date is selected
  useEffect(() => {
    if (selectedDate && availableSlots.length > 0) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const daySchedule = availableSlots.find(
        (day) => day.date === formattedDate
      );

      if (daySchedule && daySchedule.isAvailable) {
        setAvailableTimesForDate(daySchedule.slots);
      } else {
        setAvailableTimesForDate([]);
      }
    } else {
      setAvailableTimesForDate([]);
    }
  }, [selectedDate, availableSlots]);

  // Handle hospital selection
  const handleHospitalChange = (hospitalId: string) => {
    const hospital = hospitals.find((h) => h.id === hospitalId) || null;
    setSelectedHospital(hospital);
    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedDate(null);
    setAvailableTimesForDate([]);

    form.setValue("hospitalId", hospitalId);
    form.setValue("departmentId", 0);
    form.setValue("doctorId", "");
    form.setValue("date", "");
    form.setValue("time", "");
  };

  // Handle department selection
  const handleDepartmentChange = (departmentId: string) => {
    if (!selectedHospital) return;

    const department =
      selectedHospital.departments.find(
        (d) => d.id === Number.parseInt(departmentId)
      ) || null;

    setSelectedDepartment(department);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedDate(null);
    setAvailableTimesForDate([]);
    console.log("Selected department:", department);
    form.setValue("departmentId", Number.parseInt(departmentId));
    form.setValue("doctorId", "");
    form.setValue("date", "");
    form.setValue("time", "");
  };

  // Handle doctor selection
  const handleDoctorChange = (doctorId: string) => {
    if (!selectedDepartment) return;

    const doctor =
      selectedDepartment.doctors.find((d) => d.id === doctorId) || null;

    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setAvailableTimesForDate([]);

    form.setValue("doctorId", doctorId);
    form.setValue("date", "");
    form.setValue("time", "");
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(null);
      setAvailableTimesForDate([]);
      form.setValue("date", "");
      form.setValue("time", "");
      return;
    }

    setSelectedDate(date);
    form.setValue("date", format(date, "yyyy-MM-dd"));
    form.setValue("time", "");
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    form.setValue("time", time);
  };

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (isBefore(date, today)) return true;

    // Disable dates more than 7 days in the future
    const maxDate = addDays(today, 7);
    if (isAfter(date, maxDate)) return true;

    // Disable dates that are not available for the doctor
    if (availableSlots.length > 0) {
      const formattedDate = format(date, "yyyy-MM-dd");
      const daySchedule = availableSlots.find(
        (day) => day.date === formattedDate
      );

      // If we have schedule data and the day is not available, disable it
      if (daySchedule && !daySchedule.isAvailable) return true;

      // If we have schedule data and the day has no available slots, disable it
      if (
        daySchedule &&
        daySchedule.isAvailable &&
        daySchedule.slots.every((slot) => !slot.isAvailable)
      ) {
        return true;
      }
    }

    return false;
  };

  // Handle form submission
  const onSubmit = async (data: AppointmentFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await appointmentService.bookAppointment(data);
      // REMOVE THIS LINE
      console.log("Booking response:", response);
      // @ts-ignore
      if (response.success) {
        setIsSuccess(true);
        toast({
          title: "Appointment booked successfully",
          description: `Your appointment has been scheduled for ${format(
            parseISO(data.date),
            "PPP"
          )} at ${data.time}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to book appointment",
          // @ts-ignore
          description: response.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        variant: "destructive",
        title: "Failed to book appointment",
        description: "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    form.reset();
    setSelectedHospital(null);
    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedDate(null);
    setAvailableTimesForDate([]);
    setIsSuccess(false);
    setStep(1);
  };

  // Handle next step
  const handleNextStep = () => {
    if (step === 1) {
      // Validate hospital and department selection
      const hospitalId = form.getValues("hospitalId");
      const departmentId = form.getValues("departmentId");

      if (!hospitalId) {
        form.setError("hospitalId", { message: "Please select a hospital" });
        return;
      }

      if (!departmentId) {
        form.setError("departmentId", {
          message: "Please select a department",
        });
        return;
      }

      setStep(2);
    } else if (step === 2) {
      // Validate doctor selection
      const doctorId = form.getValues("doctorId");

      if (!doctorId) {
        form.setError("doctorId", { message: "Please select a doctor" });
        return;
      }

      setStep(3);
    } else if (step === 3) {
      // Validate date and time selection
      const date = form.getValues("date");
      const time = form.getValues("time");

      if (!date) {
        form.setError("date", { message: "Please select a date" });
        return;
      }

      if (!time) {
        form.setError("time", { message: "Please select a time" });
        return;
      }

      setStep(4);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Book an Appointment
            </h1>
            <p className="text-muted-foreground">
              Schedule a new appointment with a healthcare provider
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
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
                  <Button
                    onClick={() => router.push("/dashboard/appointments")}
                  >
                    View My Appointments
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
                Follow the steps to book your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Steps
                steps={[
                  "Select Hospital & Department",
                  "Select Doctor",
                  "Select Date & Time",
                  "Confirm Details",
                ]}
                currentStep={step}
                className="mb-8"
              />

              {isLoading && step === 1 ? (
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
                    {/* Step 1: Select Hospital & Department */}
                    {step === 1 && (
                      <div className="space-y-6">
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
                                      value={hospital.id}
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
                                defaultValue={field.value.toString()}
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
                    )}

                    {/* Step 2: Select Doctor */}
                    {step === 2 && (
                      <FormField
                        control={form.control}
                        name="doctorId"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Doctor</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={handleDoctorChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {selectedDepartment?.doctors.length ? (
                                  selectedDepartment.doctors.map((doctor) => (
                                    <FormItem
                                      key={doctor.id}
                                      className="flex items-center space-x-3 space-y-0 border rounded-md p-4"
                                    >
                                      <FormControl>
                                        <RadioGroupItem value={doctor.id} />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer flex-1">
                                        <div className="font-medium">
                                          {doctor.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {doctor.email}
                                        </div>
                                      </FormLabel>
                                    </FormItem>
                                  ))
                                ) : (
                                  <div className="text-sm text-muted-foreground py-8 text-center">
                                    No doctors available in this department.
                                    Please select a different department.
                                  </div>
                                )}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Step 3: Select Date & Time */}
                    {step === 3 && (
                      <div className="space-y-6">
                        {isLoading ? (
                          <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">
                              Loading doctor's availability...
                            </span>
                          </div>
                        ) : (
                          <>
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
                                            format(parseISO(field.value), "PPP")
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
                                        selected={selectedDate || undefined}
                                        onSelect={handleDateSelect}
                                        disabled={isDateDisabled}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormDescription>
                                    Only dates with available slots are
                                    selectable.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="time"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Time Slot</FormLabel>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    {availableTimesForDate.length > 0 ? (
                                      availableTimesForDate.map((slot) => (
                                        <Button
                                          key={slot.time}
                                          type="button"
                                          variant={
                                            field.value === slot.time
                                              ? "default"
                                              : "outline"
                                          }
                                          className="flex items-center justify-center"
                                          disabled={!slot.isAvailable}
                                          onClick={() =>
                                            handleTimeSelect(slot.time)
                                          }
                                        >
                                          <Clock className="mr-2 h-4 w-4" />
                                          {slot.time}
                                        </Button>
                                      ))
                                    ) : selectedDate ? (
                                      <div className="col-span-full text-center py-4 text-muted-foreground">
                                        No available time slots for the selected
                                        date.
                                      </div>
                                    ) : (
                                      <div className="col-span-full text-center py-4 text-muted-foreground">
                                        Please select a date to view available
                                        time slots.
                                      </div>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    )}

                    {/* Step 4: Confirm Details */}
                    {step === 4 && (
                      <div className="space-y-6">
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
                                This information helps the doctor prepare for
                                your appointment.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="border rounded-md p-4 space-y-4">
                          <h3 className="font-medium">Appointment Summary</h3>
                          <div className="grid gap-2 text-sm">
                            <div className="grid grid-cols-3">
                              <span className="text-muted-foreground">
                                Hospital:
                              </span>
                              <span className="col-span-2 font-medium">
                                {selectedHospital?.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-muted-foreground">
                                Department:
                              </span>
                              <span className="col-span-2 font-medium">
                                {selectedDepartment?.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-muted-foreground">
                                Doctor:
                              </span>
                              <span className="col-span-2 font-medium">
                                {selectedDoctor?.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-muted-foreground">
                                Date:
                              </span>
                              <span className="col-span-2 font-medium">
                                {form.getValues("date")
                                  ? format(
                                      parseISO(form.getValues("date")),
                                      "PPP"
                                    )
                                  : ""}
                              </span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="text-muted-foreground">
                                Time:
                              </span>
                              <span className="col-span-2 font-medium">
                                {form.getValues("time")}
                              </span>
                            </div>
                          </div>
                        </div>

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
                            "Confirm Appointment"
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={step === 1 || isLoading}
              >
                Previous
              </Button>
              {step < 4 && (
                <Button onClick={handleNextStep} disabled={isLoading}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
