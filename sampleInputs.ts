const hospitalData = {
  name: "Zenith Care Hospital",
  type: "Private",
  registrationNumber: "ZCH20250425",
  phone: "+1-555-987-6543",
  email: "info@zenithcare.org",
  password: "ZenithSecure@2025",
  address: "789 Wellness Street, Healthtown Heights",
  zipcode: 10001,
  rating: 4.6,
  nearestParteneredHospital: "Hope Medical Center",
  departments: [
    {
      name: "Cardiology",
      doctors: [
        {
          name: "Dr. Anjali Mehra",
          email: "anjali.mehra@zenithcare.org",
          phone: "+1-555-111-2233",
          password: "HeartDoc@2025",
          dateOfBirth: "1975-04-12T00:00:00.000Z",
          experience: 22,
          availability: true,
          doctorSchedule: [
            {
              day: 1,
              startTime: "2025-04-28T08:00:00.000Z",
              endTime: "2025-04-28T09:30:00.000Z",
            },
            {
              day: 3,
              startTime: "2025-04-30T14:00:00.000Z",
              endTime: "2025-04-30T15:30:00.000Z",
            },
          ],
        },
        {
          name: "Dr. Kevin White",
          email: "kevin.white@zenithcare.org",
          phone: "+1-555-111-2244",
          password: "CardioKing#22",
          dateOfBirth: "1980-10-21T00:00:00.000Z",
          experience: 18,
          availability: true,
          doctorSchedule: [
            {
              day: 2,
              startTime: "2025-04-29T11:00:00.000Z",
              endTime: "2025-04-29T12:30:00.000Z",
            },
          ],
        },
      ],
    },
    {
      name: "Neurology",
      doctors: [
        {
          name: "Dr. Maya Iyer",
          email: "maya.iyer@zenithcare.org",
          phone: "+1-555-222-3344",
          password: "BrainyMaya22!",
          dateOfBirth: "1983-07-09T00:00:00.000Z",
          experience: 15,
          availability: true,
          doctorSchedule: [
            {
              day: 1,
              startTime: "2025-04-28T16:00:00.000Z",
              endTime: "2025-04-28T17:30:00.000Z",
            },
            {
              day: 4,
              startTime: "2025-05-01T09:00:00.000Z",
              endTime: "2025-05-01T10:30:00.000Z",
            },
          ],
        },
        {
          name: "Dr. Alan Chen",
          email: "alan.chen@zenithcare.org",
          phone: "+1-555-222-4455",
          password: "NeuroPro@88",
          dateOfBirth: "1978-12-03T00:00:00.000Z",
          experience: 20,
          availability: true,
          doctorSchedule: [
            {
              day: 3,
              startTime: "2025-04-30T07:30:00.000Z",
              endTime: "2025-04-30T09:00:00.000Z",
            },
          ],
        },
      ],
    },
    {
      name: "Pediatrics",
      doctors: [
        {
          name: "Dr. Sarah Khan",
          email: "sarah.khan@zenithcare.org",
          phone: "+1-555-333-5566",
          password: "PediaDoc@25",
          dateOfBirth: "1990-02-14T00:00:00.000Z",
          experience: 10,
          availability: true,
          doctorSchedule: [
            {
              day: 1,
              startTime: "2025-04-28T13:00:00.000Z",
              endTime: "2025-04-28T14:45:00.000Z",
            },
          ],
        },
        {
          name: "Dr. Liam Wilson",
          email: "liam.wilson@zenithcare.org",
          phone: "+1-555-333-6677",
          password: "ChildCareLiam",
          dateOfBirth: "1987-06-23T00:00:00.000Z",
          experience: 12,
          availability: true,
          doctorSchedule: [
            {
              day: 2,
              startTime: "2025-04-29T10:00:00.000Z",
              endTime: "2025-04-29T11:30:00.000Z",
            },
          ],
        },
      ],
    },
    {
      name: "Orthopedics",
      doctors: [
        {
          name: "Dr. Priya Singh",
          email: "priya.singh@zenithcare.org",
          phone: "+1-555-444-7788",
          password: "BoneCare@123",
          dateOfBirth: "1981-11-11T00:00:00.000Z",
          experience: 16,
          availability: true,
          doctorSchedule: [
            {
              day: 4,
              startTime: "2025-05-01T08:30:00.000Z",
              endTime: "2025-05-01T10:00:00.000Z",
            },
          ],
        },
        {
          name: "Dr. Mark Evans",
          email: "mark.evans@zenithcare.org",
          phone: "+1-555-444-8899",
          password: "OrthoMark@22",
          dateOfBirth: "1976-03-18T00:00:00.000Z",
          experience: 24,
          availability: true,
          doctorSchedule: [
            {
              day: 3,
              startTime: "2025-04-30T17:00:00.000Z",
              endTime: "2025-04-30T18:30:00.000Z",
            },
          ],
        },
      ],
    },
  ],
};
