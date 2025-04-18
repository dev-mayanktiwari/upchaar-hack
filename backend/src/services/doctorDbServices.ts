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
};
