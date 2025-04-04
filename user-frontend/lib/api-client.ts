import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// Create a base axios instance
const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://api.healthcare-example.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Generic API request function
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Extract error message from API response if available
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

// API service functions
export const authService = {
  signup: (userData: any) =>
    apiRequest({
      method: "POST",
      url: "/register",
      data: userData,
    }),
  login: (credentials: { email: string; password: string }) =>
    apiRequest({
      method: "POST",
      url: "/login",
      data: credentials,
    }),
  getPresignedUrl: () =>
    apiRequest({
      method: "GET",
      url: "/get-presigned-url",
    }),
};

export const appointmentService = {
  getAvailableSlots: (date: string) =>
    apiRequest({
      method: "GET",
      url: `/appointments/available-slots?date=${date}`,
    }),
  bookAppointment: (appointmentData: any) =>
    apiRequest({
      method: "POST",
      url: "/appointments/book",
      data: appointmentData,
    }),
  getAllAppointments: () =>
    apiRequest({
      method: "GET",
      url: "/appointments",
    }),
};

export const medicationService = {
  getUploadUrl: (fileName: string, fileType: string) =>
    apiRequest({
      method: "POST",
      url: "/medications/get-upload-url",
      data: { fileName, fileType },
    }),
  uploadToUrl: (url: string, file: File) =>
    axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    }),
  confirmUpload: (fileData: any) =>
    apiRequest({
      method: "POST",
      url: "/medications/confirm-upload",
      data: fileData,
    }),
  getAllMedications: () =>
    apiRequest({
      method: "GET",
      url: "/medications",
    }),
  testDrugInteraction: (medications: string[]) =>
    apiRequest({
      method: "POST",
      url: "/medications/drug-interaction",
      data: { medications },
    }),
};

export default apiClient;
