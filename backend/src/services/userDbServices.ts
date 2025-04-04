import { AppointmentInput, CreateUserInput } from "../types/userInputTypes";
import prisma from "../utils/getPrismaClient";

export default {
  findUniqueUser: (email: string) => {
    return prisma.patient.findUnique({
      where: {
        email,
      },
      //   select: {
      //     name: true,
      //     email: true,
      //     age: true,
      //     gender: true,
      //     bloodGroup: true,
      //     contact: true,
      //     medicalHistory: true,
      //   },
    });
  },

  getUserById: (id: string) => {
    return prisma.patient.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        email: true,
        age: true,
        gender: true,
        bloodGroup: true,
        contact: true,
        medicalHistory: true,
      },
    });
  },

  createUser: (input: CreateUserInput, hashedPassword: string) => {
    const { name, email, age, gender, bloodGroup, contact, medicalHistory } =
      input;

    return prisma.patient.create({
      data: {
        name,
        email,
        password: hashedPassword,
        age,
        gender,
        bloodGroup,
        contact,
        medicalHistory: {
          create: {
            chronicDiseases: medicalHistory.chronicDiseases,
            allergies: medicalHistory.allergies,
            pastSurgeries: medicalHistory.pastSurgeries,
            currentMedications: medicalHistory.currentMedications,
            reportUrl: [String(medicalHistory.reportUrl)],
            smoking: medicalHistory.smoking,
            reportData: medicalHistory.reportData,
            alcoholConsumption: medicalHistory.alcoholConsumption,
          },
        },
      },
      select: {
        name: true,
        id: true,
        email: true,
        age: true,
        gender: true,
        bloodGroup: true,
        contact: true,
        medicalHistory: true,
      },
    });
  },

  createAppointment: (
    input: AppointmentInput,
    patientId: string,
    date: string
  ) => {
    const { hospitalId, departmentId, doctorId, title, time } = input;
    return prisma.appointment.create({
      data: {
        title,
        time: date,
        status: "PENDING",
        patientId,
        hospitalId: parseInt(hospitalId, 10),
        departmentId: parseInt(departmentId, 10),
        doctorId: parseInt(doctorId, 10),
      },
    });
  },

  getAppointments: (patientId: string) => {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        hospital: {
          select: {
            name: true,
          },
        },
        doctor: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
    });
  },

  trackAppointment: (appointmentId: number, userId: string) => {
    return prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: userId,
      },
    });
  },

  updateUserMedicalHistory: (patientId: string, medicalData: string) => {
    return prisma.patient.update({
      where: {
        id: patientId,
      },
      data: {
        medicalHistory: {
          update: {
            reportData: {
              push: medicalData,
            },
          },
        },
      },
      select: {
        name: true,
        email: true,
        age: true,
        gender: true,
        bloodGroup: true,
        contact: true,
        medicalHistory: true,
        id: true,
      },
    });
  },

  addMedication: (patientId: string, reportUrl: string) => {
    return prisma.medicalHistory.update({
      where: {
        patientId,
      },
      data: {
        reportUrl: {
          push: reportUrl,
        },
      },
    });
  },
};
