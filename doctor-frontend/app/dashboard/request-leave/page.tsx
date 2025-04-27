"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, isBefore } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const leaveFormSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z
    .date({
      required_error: "End date is required",
    })
    .refine(
      (date) => true, // This will be refined in the form validation
      {
        message: "End date must be after start date",
      },
    ),
  reason: z.string().min(5, {
    message: "Reason must be at least 5 characters",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
  additionalNotes: z.string().optional(),
})

type LeaveFormValues = z.infer<typeof leaveFormSchema>

interface LeaveRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  priority: "low" | "medium" | "high"
  status: "pending" | "approved" | "rejected"
  requestedAt: string
}

export default function RequestLeavePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pastRequests, setPastRequests] = useState<LeaveRequest[]>([
    {
      id: "1",
      startDate: "2025-05-10",
      endDate: "2025-05-15",
      reason: "Annual vacation",
      priority: "medium",
      status: "approved",
      requestedAt: "2025-04-01T10:30:00",
    },
    {
      id: "2",
      startDate: "2025-04-05",
      endDate: "2025-04-07",
      reason: "Medical conference",
      priority: "high",
      status: "approved",
      requestedAt: "2025-03-20T14:15:00",
    },
    {
      id: "3",
      startDate: "2025-06-20",
      endDate: "2025-06-25",
      reason: "Family emergency",
      priority: "high",
      status: "pending",
      requestedAt: "2025-04-15T09:00:00",
    },
  ])

  const { toast } = useToast()

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      reason: "",
      priority: "medium",
      additionalNotes: "",
    },
  })

  const onSubmit = async (data: LeaveFormValues) => {
    // Validate that end date is after start date
    if (isBefore(data.endDate, data.startDate)) {
      form.setError("endDate", {
        type: "manual",
        message: "End date must be after start date",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add to past requests
      const newRequest: LeaveRequest = {
        id: `${Date.now()}`,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        reason: data.reason,
        priority: data.priority as "low" | "medium" | "high",
        status: "pending",
        requestedAt: new Date().toISOString(),
      }

      setPastRequests([newRequest, ...pastRequests])

      toast({
        title: "Leave request submitted",
        description: "Your leave request has been submitted successfully.",
      })

      // Reset form
      form.reset({
        startDate: undefined,
        endDate: undefined,
        reason: "",
        priority: "medium",
        additionalNotes: "",
      })
    } catch (error) {
      console.error("Error submitting leave request:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Leave</h1>
          <p className="text-muted-foreground">Submit a request for time off or vacation</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>New Leave Request</CardTitle>
              <CardDescription>Fill out the form below to request time off</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => isBefore(date, new Date())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues("startDate")
                                  return startDate ? isBefore(date, startDate) : isBefore(date, new Date())
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Leave</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Vacation, Medical, Conference" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>High priority is for urgent or emergency situations</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information about your leave request"
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Past Leave Requests</CardTitle>
              <CardDescription>View the status of your previous leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No past leave requests found</p>
                ) : (
                  pastRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{request.reason}</h4>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.startDate), "MMM d, yyyy")} -{" "}
                          {format(new Date(request.endDate), "MMM d, yyyy")}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Requested on {format(new Date(request.requestedAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <PriorityBadge priority={request.priority} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300",
    approved: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300",
  }

  return (
    <Badge variant="outline" className={cn("capitalize", variants[status])}>
      {status}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: "low" | "medium" | "high" }) {
  const variants = {
    low: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
    medium: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300",
    high: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300",
  }

  return (
    <Badge variant="outline" className={cn("capitalize", variants[priority])}>
      {priority}
    </Badge>
  )
}
