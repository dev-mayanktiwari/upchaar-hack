// Hospitals API functions

interface Department {
  id: number;
  name: string;
  hospitalId: string;
  headDoctorId: string | null;
  doctors?: Doctor[];
}

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface BedCounts {
  id: number;
  totalBed: number;
  availableBed: number;
  bedCountId: number;
}

interface Beds {
  id: number;
  hospitalId: string;
  totalBeds: number;
  totalAvailableBeds: number;
  icu: BedCounts;
  general: BedCounts;
  premium: BedCounts;
}

interface Hospital {
  id: string;
  name: string;
  type: string;
  registrationNumber: string;
  phone: string;
  email: string;
  address: string;
  zipcode: number;
  rating: number;
  nearestParteneredHospital: string;
  departments: Department[];
  beds: Beds;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface DaySchedule {
  date: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

// Mock function to fetch hospitals (replace with actual API call)
export async function fetchHospitals(): Promise<Hospital[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data for demo purposes
      resolve([
        {
          id: "cm9u0ntzj0000qpmu89nqicgz",
          name: "Harmony Multispeciality Hospital",
          type: "Private",
          registrationNumber: "HMH20250423",
          phone: "+1-555-123-4567",
          email: "admin@harmonymed.org",
          address: "123 Vitality Boulevard, Medcity Central",
          zipcode: 94107,
          rating: 4,
          nearestParteneredHospital: "St. Mary's General",
          departments: [
            {
              id: 2,
              name: "Orthopedics",
              hospitalId: "cm9u0ntzj0000qpmu89nqicgz",
              headDoctorId: null,
              doctors: [
                {
                  id: "doc123",
                  name: "Dr. John Smith",
                  email: "john.smith@harmonymed.org",
                },
                {
                  id: "doc124",
                  name: "Dr. Sarah Johnson",
                  email: "sarah.johnson@harmonymed.org",
                },
              ],
            },
            {
              id: 3,
              name: "Pediatrics",
              hospitalId: "cm9u0ntzj0000qpmu89nqicgz",
              headDoctorId: null,
              doctors: [
                {
                  id: "doc125",
                  name: "Dr. Michael Chen",
                  email: "michael.chen@harmonymed.org",
                },
              ],
            },
            {
              id: 4,
              name: "Radiology",
              hospitalId: "cm9u0ntzj0000qpmu89nqicgz",
              headDoctorId: null,
              doctors: [
                {
                  id: "doc126",
                  name: "Dr. Emily Rodriguez",
                  email: "emily.rodriguez@harmonymed.org",
                },
              ],
            },
            {
              id: 1,
              name: "Cardiology",
              hospitalId: "cm9u0ntzj0000qpmu89nqicgz",
              headDoctorId: "cm9u0nu2z0001qpmuyabexw4o",
              doctors: [
                {
                  id: "cm9u0nu2z0001qpmuyabexw4o",
                  name: "Dr. Robert Williams",
                  email: "robert.williams@harmonymed.org",
                },
              ],
            },
          ],
          beds: {
            id: 1,
            hospitalId: "cm9u0ntzj0000qpmu89nqicgz",
            totalBeds: 500,
            totalAvailableBeds: 230,
            icu: {
              id: 1,
              totalBed: 60,
              availableBed: 18,
              bedCountId: 1,
            },
            general: {
              id: 1,
              totalBed: 280,
              availableBed: 140,
              bedCountId: 1,
            },
            premium: {
              id: 1,
              totalBed: 160,
              availableBed: 72,
              bedCountId: 1,
            },
          },
        },
        {
          id: "cm9u0ntzj0001qpmu89nqicgz",
          name: "City General Hospital",
          type: "Public",
          registrationNumber: "CGH20250423",
          phone: "+1-555-987-6543",
          email: "info@citygeneral.org",
          address: "456 Healthcare Avenue, Downtown",
          zipcode: 94108,
          rating: 3,
          nearestParteneredHospital: "Harmony Multispeciality",
          departments: [
            {
              id: 5,
              name: "Emergency Medicine",
              hospitalId: "cm9u0ntzj0001qpmu89nqicgz",
              headDoctorId: null,
              doctors: [
                {
                  id: "doc127",
                  name: "Dr. James Wilson",
                  email: "james.wilson@citygeneral.org",
                },
              ],
            },
            {
              id: 6,
              name: "Internal Medicine",
              hospitalId: "cm9u0ntzj0001qpmu89nqicgz",
              headDoctorId: null,
              doctors: [
                {
                  id: "doc128",
                  name: "Dr. Lisa Brown",
                  email: "lisa.brown@citygeneral.org",
                },
              ],
            },
          ],
          beds: {
            id: 2,
            hospitalId: "cm9u0ntzj0001qpmu89nqicgz",
            totalBeds: 300,
            totalAvailableBeds: 120,
            icu: {
              id: 2,
              totalBed: 40,
              availableBed: 10,
              bedCountId: 2,
            },
            general: {
              id: 2,
              totalBed: 200,
              availableBed: 90,
              bedCountId: 2,
            },
            premium: {
              id: 2,
              totalBed: 60,
              availableBed: 20,
              bedCountId: 2,
            },
          },
        },
        {
          id: "cm9u0ntzj0002qpmu89nqicgz",
          name: "Metro Medical Center",
          type: "Private",
          registrationNumber: "MMC20250423",
          phone: "+1-555-456-7890",
          email: "contact@metromedical.com",
          address: "789 Health Street, Uptown",
          zipcode: 94109,
          rating: 5,
          nearestParteneredHospital: "City General Hospital",
          departments: [
            {
              id: 7,
              name: "Neurology",
              hospitalId: "cm9u0ntzj0002qpmu89nqicgz",
              headDoctorId: null,
              doctors: [
                {
                  id: "doc129",
                  name: "Dr. David Kim",
                  email: "david.kim@metromedical.com",
                },
              ],
            },
            {
              id: 8,
              name: "Oncology",
              hospitalId: "cm9u0ntzj0002qpmu89nqicgz",
              headDoctorId: null,
              doctors: [
                {
                  id: "doc130",
                  name: "Dr. Jennifer Lee",
                  email: "jennifer.lee@metromedical.com",
                },
              ],
            },
          ],
          beds: {
            id: 3,
            hospitalId: "cm9u0ntzj0002qpmu89nqicgz",
            totalBeds: 400,
            totalAvailableBeds: 180,
            icu: {
              id: 3,
              totalBed: 50,
              availableBed: 15,
              bedCountId: 3,
            },
            general: {
              id: 3,
              totalBed: 250,
              availableBed: 120,
              bedCountId: 3,
            },
            premium: {
              id: 3,
              totalBed: 100,
              availableBed: 45,
              bedCountId: 3,
            },
          },
        },
      ]);
    }, 1500);
  });
}

// Mock function to fetch hospital by ID (replace with actual API call)
export async function fetchHospitalById(id: string): Promise<Hospital | null> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(async () => {
      const hospitals = await fetchHospitals();
      const hospital = hospitals.find((h) => h.id === id) || null;
      resolve(hospital);
    }, 1000);
  });
}

// Mock function to fetch doctor's available slots (replace with actual API call)
export async function fetchDoctorAvailableSlots(
  doctorId: string
): Promise<DaySchedule[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data for demo purposes
      resolve([
        {
          date: "2025-04-24",
          isAvailable: true,
          slots: [
            {
              time: "13:30",
              isAvailable: true,
            },
            {
              time: "13:50",
              isAvailable: true,
            },
            {
              time: "14:10",
              isAvailable: true,
            },
          ],
        },
        {
          date: "2025-04-25",
          isAvailable: false,
          slots: [],
        },
        {
          date: "2025-04-26",
          isAvailable: true,
          slots: [
            {
              time: "16:30",
              isAvailable: true,
            },
            {
              time: "16:50",
              isAvailable: true,
            },
            {
              time: "17:10",
              isAvailable: true,
            },
          ],
        },
        {
          date: "2025-04-27",
          isAvailable: true,
          slots: [
            {
              time: "13:30",
              isAvailable: true,
            },
            {
              time: "13:50",
              isAvailable: true,
            },
            {
              time: "14:10",
              isAvailable: true,
            },
          ],
        },
        {
          date: "2025-04-28",
          isAvailable: true,
          slots: [
            {
              time: "14:30",
              isAvailable: true,
            },
            {
              time: "14:50",
              isAvailable: true,
            },
            {
              time: "15:10",
              isAvailable: true,
            },
          ],
        },
        {
          date: "2025-04-29",
          isAvailable: true,
          slots: [
            {
              time: "17:30",
              isAvailable: true,
            },
            {
              time: "17:50",
              isAvailable: true,
            },
            {
              time: "18:10",
              isAvailable: true,
            },
          ],
        },
        {
          date: "2025-04-30",
          isAvailable: true,
          slots: [
            {
              time: "15:30",
              isAvailable: true,
            },
            {
              time: "15:50",
              isAvailable: true,
            },
            {
              time: "16:10",
              isAvailable: true,
            },
          ],
        },
      ]);
    }, 1500);
  });
}
