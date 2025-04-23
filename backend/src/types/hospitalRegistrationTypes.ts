import { z } from "zod";

export const DoctorScheduleSchema = z.object({
  day: z.number().min(0).max(6),
  startTime: z.string().transform((val) => new Date(val)),
  endTime: z.string().transform((val) => new Date(val)),
});

export const DoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  experience: z.number().nonnegative(),
  availability: z.boolean().default(true),
  doctorSchedule: z.array(DoctorScheduleSchema).optional(),
});

export const DepartmentSchema = z.object({
  name: z.string().min(2),
  doctors: z.array(DoctorSchema).optional(),
});

export const BedCountSchema = z.object({
  totalBeds: z.number().positive(),
  totalAvailableBeds: z.number().positive(),
  icu: z.object({
    totalBed: z.number().positive().default(50),
    availableBed: z.number().positive().default(20),
  }),
  general: z.object({
    totalBed: z.number().positive().default(200),
    availableBed: z.number().positive().default(120),
  }),
  premium: z.object({
    totalBed: z.number().positive().default(80),
    availableBed: z.number().positive().default(20),
  }),
});

export const MedicineInventorySchema = z.object({
  name: z.string().min(2),
  quantity: z.number().nonnegative(),
  threshold: z.number().nonnegative(),
  expiryDate: z.string().transform((val) => new Date(val)),
});

export const HospitalRegistrationSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  registrationNumber: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  password: z.string().min(6),
  address: z.string().min(5),
  zipcode: z.number().positive(),
  rating: z.number().min(1).max(5).default(4),
  nearestParteneredHospital: z.string(),
  departments: z.array(DepartmentSchema).optional(),
  beds: BedCountSchema.optional(),
  medicineInventories: z.array(MedicineInventorySchema).optional(),
});

export const DepartmentHeadSchema = z.object({
  departmentId: z.number().positive(),
  doctorId: z.string().min(5),
});

export type HospitalRegistrationType = z.infer<
  typeof HospitalRegistrationSchema
>;
export type DepartmentHeadType = z.infer<typeof DepartmentHeadSchema>;
export type DoctorType = z.infer<typeof DoctorSchema>;
export type DepartmentType = z.infer<typeof DepartmentSchema>;
export type BedCountType = z.infer<typeof BedCountSchema>;
export type MedicineInventoryType = z.infer<typeof MedicineInventorySchema>;
export type DoctorScheduleType = z.infer<typeof DoctorScheduleSchema>;
