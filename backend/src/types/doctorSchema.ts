import { z } from "zod";

export const ApproveAppointmentSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export type TApproveAppointmentType = z.infer<typeof ApproveAppointmentSchema>;
