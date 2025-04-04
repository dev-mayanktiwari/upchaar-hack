import { z } from "zod";

// User registration schema
export const createUserSchema = z.object({
  name: z.string().min(5, "Name must be at least 5 characters long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  age: z.number().min(0, "Age must be a positive number"),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  contact: z.string().regex(/^\d{10}$/, "Contact number must be 10 digits"),
  medicalHistory: z.object({
    chronicDiseases: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    pastSurgeries: z.array(z.string()).optional(),
    currentMedications: z.string().optional(),
    reportUrl: z.string().optional(),
    reportData: z.any().optional(),
    smoking: z.boolean(),
    alcoholConsumption: z.boolean(),
  }),
});

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Appointment booking schema
export const appointmentSchema = z.object({
  hospitalId: z.string().min(1, "Hospital is required"),
  departmentId: z.string().min(1, "Department is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  title: z
    .string()
    .min(5, "Reason must be at least 5 characters")
    .max(200, "Reason must be less than 200 characters"),
  time: z.string().min(1, "Time slot is required"),
  date: z.string().min(1, "Date is required"),
});

// Medication upload schema
export const medicationUploadSchema = z.object({
  name: z.string().min(2, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  startDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Invalid date format"),
  endDate: z.string().optional(),
  prescribedBy: z.string().min(2, "Doctor name is required"),
  notes: z.string().optional(),
  fileUrl: z.string().optional(),
});

// Drug interaction test schema
export const drugInteractionSchema = z.object({
  medications: z
    .array(z.string())
    .min(2, "At least two medications are required for interaction testing"),
});
