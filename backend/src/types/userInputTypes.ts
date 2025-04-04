import z from "zod";

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

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const appointmentSchema = z.object({
  hospitalId: z.string(),
  departmentId: z.string(),
  doctorId: z.string(),
  title: z.string(),
  time: z.string(),
  date: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
