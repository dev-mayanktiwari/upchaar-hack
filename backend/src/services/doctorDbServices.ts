import prisma from "../utils/getPrismaClient";

export default {
  addLeaveDate: (doctorId: string, leaveDate: Date, reason: string) => {
    return prisma.doctorLeave.create({
      data: {
        doctorId: doctorId,
        leaveDate,
        reason,
      },
    });
  },

  isOnLeave: (doctorId: string, date: Date) => {
    return prisma.doctorLeave.findFirst({
      where: {
        doctorId,
        leaveDate: date,
      },
    });
  },

  getDoctorById: (doctorId: string) => {
    return prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        hospital: true,
        department: true,
        doctorSchedule: true,
      },
    });
  },

  getDoctorByEmail: (email: string) => {
    return prisma.doctor.findUnique({
      where: {
        email,
      },
    });
  },

  getDoctorSchedule: (doctorId: string, startDate: Date, endDate: Date) => {
    return prisma.doctorSchedule.findMany({
      where: {
        doctorId,
      },
    });
  },

  getDoctorAppointments: (doctorId: string, startDate: Date, endDate: Date) => {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        time: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },

      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            contact: true,
          },
        },
        hospital: true,
      },
    });
  },

  getLeaveDates: (doctorId: string, startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
  
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);
  
    return prisma.doctorLeave.findMany({
      where: {
        doctorId,
        leaveDate: {
          gte: start,
          lte: end,
        },
      },
    });
  }
};
