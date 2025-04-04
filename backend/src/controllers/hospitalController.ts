import { NextFunction, Request, Response } from "express";
import { EErrorStatusCode, EResponseStatusCode } from "../constant/application";
import httpError from "../utils/httpError";
import httpResponse from "../utils/httpResponse";
import prisma from "../utils/getPrismaClient";
import bcrypt from "bcrypt";

export default {
  self: (req: Request, res: Response, next: NextFunction) => {
    try {
      httpResponse(req, res, EResponseStatusCode.OK, "Hello World", {
        name: "Mayank Tiwari",
      });
    } catch (error) {
      httpError(next, error, req);
    }
  },

  registerHospital: async (req: Request, res: Response, next: NextFunction) => {
    try {
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
        departments, // Array of departments with doctors
      } = req.body;

      // Check if hospital with the same email already exists
      const existingHospital = await prisma.hospital.findUnique({
        where: { email },
      });

      if (existingHospital) {
        return httpResponse(
          req,
          res,
          EErrorStatusCode.CONFLICT,
          "Hospital with this email already exists"
        );
      }

      // Hash hospital password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create hospital with departments and doctors
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
          rating: rating || 4, // Default rating if not provided
          departments: {
            create:
              departments?.map((dept: any) => ({
                name: dept.name,
                doctors: {
                  create:
                    dept.doctors?.map((doc: any) => ({
                      name: doc.name,
                      email: doc.email,
                      phone: doc.phone,
                      password: bcrypt.hashSync(doc.password, 10), // Hash doctor password
                      dateOfBirth: new Date(doc.dateOfBirth),
                      experience: doc.experience,
                      availability: doc.availability,
                    })) || [],
                },
              })) || [],
          },
        },
        include: {
          departments: {
            include: {
              doctors: true, // Include doctors in response
            },
          },
        },
      });

      return httpResponse(
        req,
        res,
        EResponseStatusCode.CREATED,
        "Hospital registered successfully",
        { hospital }
      );
    } catch (error) {
      httpError(next, error, req);
    }
  },

  getAllHospitals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitals = await prisma.hospital.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          phone: true,
          type: true,
          registrationNumber: true,
          zipcode: true,
          nearestParteneredHospital: true,
          departments: {
            select: {
              id: true,
              name: true,
              doctors: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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
};
