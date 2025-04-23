import { NextFunction, Request, Response } from "express";
import { EErrorStatusCode, EResponseStatusCode } from "../constant/application";
import httpError from "../utils/httpError";
import httpResponse from "../utils/httpResponse";
import prisma from "../utils/getPrismaClient";
import bcrypt from "bcrypt";
import {
  DepartmentHeadSchema,
  DoctorScheduleSchema,
  HospitalRegistrationSchema,
} from "../types/hospitalRegistrationTypes";
import { z } from "zod";
import logger from "../utils/logger";

export default {
  // Register a new hospital
  registerHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate input data
      const validationResult = HospitalRegistrationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return httpError(
          next,
          new Error("Validation failed"),
          req,
          EErrorStatusCode.BAD_REQUEST,
          validationResult.error.format()
        );
      }

      const {
        name,
        email,
        password,
        address,
        phone,
        type,
        registrationNumber,
        zipcode,
        nearestParteneredHospital,
        rating,
        departments,
        beds,
        medicineInventories,
      } = validationResult.data;

      // Check for existing hospital
      const existingHospital = await prisma.hospital.findUnique({
        where: { email },
      });

      if (existingHospital) {
        return httpError(
          next,
          new Error("Hospital with this email already exists"),
          req,
          EErrorStatusCode.CONFLICT
        );
      }

      // Hash hospital password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create hospital first (without nested relations)
      const hospital = await prisma.hospital.create({
        data: {
          name,
          email,
          password: hashedPassword,
          address,
          phone,
          type,
          registrationNumber,
          zipcode,
          nearestParteneredHospital,
          rating,
        },
      });

      // Now create departments for the hospital
      if (departments && departments.length > 0) {
        for (const dept of departments) {
          // Create department
          const department = await prisma.department.create({
            data: {
              name: dept.name,
              hospital: {
                connect: { id: hospital.id },
              },
            },
          });

          // Create doctors for each department
          if (dept.doctors && dept.doctors.length > 0) {
            for (const doc of dept.doctors) {
              // Create the doctor with direct connection to hospital and department
              const doctor = await prisma.doctor.create({
                data: {
                  name: doc.name,
                  email: doc.email,
                  phone: doc.phone,
                  password: bcrypt.hashSync(doc.password, 10),
                  dateOfBirth: doc.dateOfBirth,
                  experience: doc.experience,
                  availability: doc.availability,
                  // Connect to hospital
                  hospital: {
                    connect: { id: hospital.id },
                  },
                  // Connect to department
                  department: {
                    connect: { id: department.id },
                  },
                  // Create doctor schedules if provided
                  doctorSchedule: doc.doctorSchedule
                    ? {
                        create: doc.doctorSchedule.map((schedule) => ({
                          day: schedule.day,
                          startTime: schedule.startTime,
                          endTime: schedule.endTime,
                        })),
                      }
                    : undefined,
                },
              });
            }
          }
        }
      }

      // Create bed counts if provided
      if (beds) {
        await prisma.bedCount.create({
          data: {
            totalBeds: beds.totalBeds,
            totalAvailableBeds: beds.totalAvailableBeds,
            hospital: {
              connect: { id: hospital.id },
            },
            icu: {
              create: {
                totalBed: beds.icu.totalBed,
                availableBed: beds.icu.availableBed,
              },
            },
            general: {
              create: {
                totalBed: beds.general.totalBed,
                availableBed: beds.general.availableBed,
              },
            },
            premium: {
              create: {
                totalBed: beds.premium.totalBed,
                availableBed: beds.premium.availableBed,
              },
            },
          },
        });
      }

      // Create medicine inventories if provided
      if (medicineInventories && medicineInventories.length > 0) {
        await prisma.medicineInventory.createMany({
          data: medicineInventories.map((medicine) => ({
            name: medicine.name,
            quantity: medicine.quantity,
            threshold: medicine.threshold,
            expiryDate: medicine.expiryDate,
            hospitalId: hospital.id,
          })),
        });
      }

      // Fetch the fully populated hospital data to return
      const completeHospitalData = await prisma.hospital.findUnique({
        where: { id: hospital.id },
        include: {
          departments: {
            include: {
              doctors: true,
            },
          },
          doctors: true,
          beds: {
            include: {
              icu: true,
              general: true,
              premium: true,
            },
          },
          medicineInventories: true,
        },
      });

      return httpResponse(
        req,
        res,
        EResponseStatusCode.CREATED,
        "Hospital registered successfully",
        { hospital: completeHospitalData }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  // Set department head (separate endpoint)
  setDepartmentHead: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Validate input data
      const validationResult = DepartmentHeadSchema.safeParse(req.body);

      if (!validationResult.success) {
        return httpError(
          next,
          new Error("Invalid input data"),
          req,
          EErrorStatusCode.BAD_REQUEST,
          validationResult.error.format()
        );
      }

      const { departmentId, doctorId } = validationResult.data;

      // Verify department exists
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        return httpError(
          next,
          new Error("Department not found"),
          req,
          EErrorStatusCode.NOT_FOUND
        );
      }

      // Verify doctor exists
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
      });

      if (!doctor) {
        return httpError(
          next,
          new Error("Doctor not found"),
          req,
          EErrorStatusCode.NOT_FOUND
        );
      }

      // Check if doctor belongs to the same hospital as the department
      if (doctor.hospitalId !== department.hospitalId) {
        return httpError(
          next,
          new Error(
            "Doctor does not belong to the same hospital as the department"
          ),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      // Check if doctor belongs to the same department
      if (doctor.departmentId !== departmentId) {
        return httpError(
          next,
          new Error("Doctor does not belong to the specified department"),
          req,
          EErrorStatusCode.BAD_REQUEST
        );
      }

      // Update department with head doctor
      const updatedDepartment = await prisma.department.update({
        where: { id: departmentId },
        data: { headDoctorId: doctorId },
        include: {
          headDoctor: true,
          doctors: true,
        },
      });

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Department head set successfully",
        { department: updatedDepartment }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  // Add doctor schedule (separate endpoint)
  addDoctorSchedule: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { doctorId, schedules } = req.body;

      // Validate input
      const schedulesValidation = z
        .array(DoctorScheduleSchema)
        .safeParse(schedules);

      if (!schedulesValidation.success) {
        return httpError(
          next,
          new Error("Invalid schedule data"),
          req,
          EErrorStatusCode.BAD_REQUEST,
          { errors: schedulesValidation.error.format() }
        );
      }

      // Verify doctor exists
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
      });

      if (!doctor) {
        return httpResponse(
          req,
          res,
          EErrorStatusCode.NOT_FOUND,
          "Doctor not found"
        );
      }

      // Create doctor schedules
      const createdSchedules = await Promise.all(
        schedulesValidation.data.map((schedule) =>
          prisma.doctorSchedule.upsert({
            where: {
              doctorId_day: {
                doctorId,
                day: schedule.day,
              },
            },
            update: {
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
            create: {
              doctorId,
              day: schedule.day,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
          })
        )
      );

      // Get updated doctor with schedules
      const updatedDoctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
        include: {
          doctorSchedule: true,
        },
      });

      return httpResponse(
        req,
        res,
        EResponseStatusCode.CREATED,
        "Doctor schedules added successfully",
        { doctor: updatedDoctor }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  // Get all hospitals
  getAllHospitals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitals = await prisma.hospital.findMany({
        include: {
          departments: true,
          beds: {
            include: {
              icu: true,
              general: true,
              premium: true,
            },
          },
        },
      });

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Hospitals retrieved successfully",
        { hospitals }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  // Get hospital by ID
  getHospitalById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const hospital = await prisma.hospital.findUnique({
        where: { id },
        include: {
          departments: {
            include: {
              headDoctor: true,
              doctors: {
                include: {
                  doctorSchedule: true,
                },
              },
            },
          },
          beds: {
            include: {
              icu: true,
              general: true,
              premium: true,
            },
          },
          medicineInventories: true,
        },
      });

      if (!hospital) {
        return httpResponse(
          req,
          res,
          EErrorStatusCode.NOT_FOUND,
          "Hospital not found"
        );
      }

      return httpResponse(
        req,
        res,
        EResponseStatusCode.OK,
        "Hospital retrieved successfully",
        { hospital }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },
};

export const validateHospitalRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    HospitalRegistrationSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return httpResponse(
        req,
        res,
        EErrorStatusCode.BAD_REQUEST,
        "Validation failed",
        { errors: error.format() }
      );
    }
    httpError(next, error, req);
  }
};
