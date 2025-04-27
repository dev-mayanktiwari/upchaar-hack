// API utility functions for the Upchaar Doctor Portal

interface Appointment {
  id: string
  patientId: string
  patientName: string
  age: number
  cause: string
  requestedAt: string
  approvedAt?: string
  status: "pending" | "approved" | "rejected"
}

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  email: string
  phone: string
  bloodType: string
  height: number
  weight: number
  bmi: number
  allergies: string[]
  pastSurgeries: {
    procedure: string
    date: string
    hospital: string
  }[]
  chronicConditions: string[]
}

interface LeaveRequest {
  id?: string
  startDate: string
  endDate: string
  reason: string
  priority: "low" | "medium" | "high"
  additionalNotes?: string
  status?: "pending" | "approved" | "rejected"
  requestedAt?: string
}

interface DashboardStats {
  pendingAppointments: number
  approvedAppointments: number
  totalPatients: number
  upcomingLeaves: number
}

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.upchaar.com/v1"

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "An error occurred while fetching data")
  }
  return response.json()
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem("accessToken")
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

/**
 * Authenticate a doctor with email and password
 * @param email Doctor's email
 * @param password Doctor's password
 * @returns Authentication response with token and user data
 */
export async function loginDoctor(credentials: { email: string; password: string }) {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  return handleResponse(response)
}

/**
 * Fetch the doctor's profile information
 * @returns Doctor profile data
 */
export async function fetchDoctorProfile() {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/doctors/profile`, {
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}

/**
 * Fetch dashboard statistics
 * @returns Dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}

/**
 * Fetch appointments based on status and date range
 * @param status Appointment status (pending, approved)
 * @param from Start date (optional)
 * @param to End date (optional)
 * @returns List of appointments
 */
export async function fetchAppointments(
  status: "pending" | "approved",
  from?: string,
  to?: string,
): Promise<Appointment[]> {
  // TODO: Implement actual API call
  const params = new URLSearchParams()
  params.append("status", status)
  if (from) params.append("from", from)
  if (to) params.append("to", to)

  const response = await fetch(`${API_BASE_URL}/appointments?${params.toString()}`, {
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}

/**
 * Update an appointment's status
 * @param id Appointment ID
 * @param action Action to perform (approve, reject, schedule)
 */
export async function updateAppointment(id: string, action: "approve" | "reject" | "schedule"): Promise<void> {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/appointments/${id}/${action}`, {
    method: "POST",
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}

/**
 * Submit a leave request
 * @param payload Leave request data
 * @returns Created leave request
 */
export async function requestLeave(payload: LeaveRequest): Promise<LeaveRequest> {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/leaves`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

/**
 * Fetch leave requests
 * @returns List of leave requests
 */
export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/leaves`, {
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}

/**
 * Fetch a patient's details
 * @param id Patient ID
 * @returns Patient details
 */
export async function fetchPatient(id: string): Promise<Patient> {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}

/**
 * Suggest medicine for a patient
 * @param patientId Patient ID
 * @param medicineData Medicine data
 */
export async function suggestMedicine(
  patientId: string,
  medicineData: {
    name: string
    dosage: string
    frequency: string
    duration: string
    notes?: string
  },
): Promise<void> {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medicines`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(medicineData),
  })

  return handleResponse(response)
}

/**
 * Fetch a patient's medicine history
 * @param patientId Patient ID
 * @returns Medicine history
 */
export async function fetchMedicineHistory(patientId: string): Promise<any[]> {
  // TODO: Implement actual API call
  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/medicines`, {
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}
