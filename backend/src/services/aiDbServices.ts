import prisma from "../utils/getPrismaClient";

export default {
  checkMedicineAvailability: (
    medicineName: string,
    strength: string,
    hospitalId: string
  ) => {
    return prisma.medicineInventory.findFirst({
      where: {
        name: medicineName,
        strength: strength,
        hospitalId: hospitalId,
      },
    });
  },

  getAllMedicines: (hospitalId: string) => {
    return prisma.medicineInventory.findMany({
      where: {
        hospitalId: hospitalId,
      },
    });
  },

  getHospitalId: (doctorId: string) => {
    return prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      select: {
        hospitalId: true,
      },
    });
  },
};
