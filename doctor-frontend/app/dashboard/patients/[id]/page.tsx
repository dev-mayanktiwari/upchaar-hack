"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  FileText,
  Pill,
  Download,
  ExternalLink,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { patientService } from "@/lib/api-client";

// Interface matching the actual API response structure
interface MedicalHistory {
  id: number;
  patientId: string;
  chronicDiseases: string[];
  allergies: string[];
  pastSurgeries: string[];
  currentMedications: string;
  reportUrl: string[];
  reportData: string[];
  smoking: boolean;
  alcoholConsumption: boolean;
  createdAt: string;
}

interface Patient {
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup: string;
  contact: string;
  medicalHistory: MedicalHistory;
}

export default function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const patientId = resolvedParams.id;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    setIsLoading(true);
    try {
      const res: any = await patientService.getPatientDetails(patientId);
      setPatient(res.data);
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load patient details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestMedicine = () => {
    router.push(`/dashboard/patients/${patientId}/suggest-medicine`);
  };

  const handleViewHistory = () => {
    router.push(`/dashboard/patients/${patientId}/history`);
  };

  // Helper function to safely access nested properties
  const getInitial = (name?: string) => {
    return name && name.length > 0 ? name.charAt(0) : "P";
  };

  // Helper to render medication list
  const renderMedications = (medications?: string) => {
    if (!medications)
      return (
        <p className="text-sm text-muted-foreground">No current medications</p>
      );

    const medicationList = medications.split(",").map((med) => med.trim());
    return (
      <div className="space-y-2">
        {medicationList.map((medication, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <p>{medication}</p>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-40" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-sm">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mt-2 text-lg font-semibold">Patient not found</h3>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            The patient you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            Go back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src="/placeholder.svg"
                  alt={patient.name || "Patient"}
                />
                <AvatarFallback className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                  {getInitial(patient.name)}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold">{patient.name || "Unknown"}</h2>
              <p className="text-sm text-muted-foreground">
                {patient.age !== undefined
                  ? `${patient.age} years`
                  : "Age unknown"}{" "}
                • {patient.gender || "Not specified"}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {patient.medicalHistory?.chronicDiseases &&
                patient.medicalHistory.chronicDiseases.length > 0 ? (
                  patient.medicalHistory.chronicDiseases.map((condition) => (
                    <Badge key={condition} variant="outline">
                      {condition}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No chronic conditions
                  </p>
                )}
              </div>

              <div className="mt-6 w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">
                    {patient.email || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">
                    {patient.contact || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Blood Type:</span>
                  <span className="font-medium">
                    {patient.bloodGroup || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lifestyle:</span>
                  <span className="font-medium">
                    {patient.medicalHistory?.smoking ? "Smoker" : "Non-smoker"},
                    {patient.medicalHistory?.alcoholConsumption
                      ? " Drinks alcohol"
                      : " No alcohol"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
            <Tabs defaultValue="medical">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Patient Information</CardTitle>
                  <TabsList>
                    <TabsTrigger value="medical">Medical History</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  Comprehensive health information and medical history
                </CardDescription>
              </CardHeader>

              <CardContent>
                <TabsContent value="medical" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Allergies</h3>
                    {!patient.medicalHistory?.allergies ||
                    patient.medicalHistory.allergies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No known allergies
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {patient.medicalHistory.allergies.map((allergy) => (
                          <Badge key={allergy} variant="destructive">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Chronic Diseases
                    </h3>
                    {!patient.medicalHistory?.chronicDiseases ||
                    patient.medicalHistory.chronicDiseases.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No chronic diseases
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {patient.medicalHistory.chronicDiseases.map(
                          (disease) => (
                            <div
                              key={disease}
                              className="flex items-center gap-2"
                            >
                              <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                              <p>{disease}</p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Past Surgeries</h3>
                    {!patient.medicalHistory?.pastSurgeries ||
                    patient.medicalHistory.pastSurgeries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No past surgeries
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {patient.medicalHistory.pastSurgeries.map(
                          (surgery, index) => (
                            <div key={index} className="rounded-lg border p-4">
                              <h4 className="font-medium">{surgery}</h4>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="medications" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Current Medications
                    </h3>
                    {renderMedications(
                      patient.medicalHistory?.currentMedications
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Medical Reports
                    </h3>
                    {!patient.medicalHistory?.reportUrl ||
                    patient.medicalHistory.reportUrl.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No medical reports available
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {patient.medicalHistory.reportUrl.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <span>Medical Report {index + 1}</span>
                            <div className="flex gap-2">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </a>
                              <a href={url} download>
                                <Button size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 bg-rose-500 hover:bg-rose-600"
            onClick={handleSuggestMedicine}
          >
            <Pill className="mr-2 h-4 w-4" />
            Suggest Medicine
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleViewHistory}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Past Medicine
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
