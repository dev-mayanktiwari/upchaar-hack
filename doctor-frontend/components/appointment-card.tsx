"use client"

import { format } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Clock, Eye, X } from "lucide-react"

interface Appointment {
  id: string
  patientId?: string
  patientName: string
  age: number
  cause: string
  requestedAt: string
  approvedAt?: string
  status: "pending" | "approved" | "rejected"
}

interface AppointmentCardProps {
  appointment: Appointment
  type: "pending" | "approved"
  onApprove?: () => void
  onReject?: () => void
  onSchedule?: () => void
  onView?: () => void
}

export function AppointmentCard({ appointment, type, onApprove, onReject, onSchedule, onView }: AppointmentCardProps) {
  const dateToShow =
    type === "pending" ? new Date(appointment.requestedAt) : new Date(appointment.approvedAt || appointment.requestedAt)

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
            <p className="text-sm text-muted-foreground">Age: {appointment.age} years</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Reason for Visit</h4>
            <p className="text-sm">{appointment.cause}</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">{type === "pending" ? "Requested Time" : "Approved On"}</h4>
            <p className="text-sm">
              {format(dateToShow, "PPP")} at {format(dateToShow, "h:mm a")}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0 border-t">
        {type === "pending" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-[80px] text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 dark:hover:bg-red-950 dark:hover:text-red-300"
              onClick={onReject}
            >
              <X className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button size="sm" className="w-[80px] bg-rose-500 hover:bg-rose-600" onClick={onApprove}>
              <Check className="mr-1 h-4 w-4" />
              Approve
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" className="w-[80px]" onClick={onView}>
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
            <Button size="sm" className="w-[120px] bg-rose-500 hover:bg-rose-600" onClick={onSchedule}>
              <Clock className="mr-1 h-4 w-4" />
              Schedule Now
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
