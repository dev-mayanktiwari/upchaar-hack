"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { medicationUploadSchema } from "@/lib/schemas";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, FileUp, Pill, Plus, Upload } from "lucide-react";
import { format } from "date-fns";
import { authService } from "@/lib/api-client";
import axios from "axios";

type MedicationFormValues = z.infer<typeof medicationUploadSchema>;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  notes?: string;
  fileUrl?: string;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // const simulateUpload = async () => {
  //   setIsUploading(true);
  //   setUploadProgress(0);

  //   // Simulate progress
  //   const interval = setInterval(() => {
  //     setUploadProgress((prev) => {
  //       if (prev >= 100) {
  //         clearInterval(interval);
  //         return 100;
  //       }
  //       return prev + 10;
  //     });
  //   }, 300);

  //   // Simulate upload completion
  //   setTimeout(() => {
  //     clearInterval(interval);
  //     setUploadProgress(100);
  //     setIsUploading(false);

  //     toast({
  //       title: "File uploaded successfully",
  //       description: "Your medication file has been uploaded",
  //     });

  //     // Reset file input
  //     setSelectedFile(null);
  //   }, 3000);
  // };

  // const onSubmit = async (data: MedicationFormValues) => {
  //   try {
  //     setIsUploading(true);

  //     // In a real app, we would:
  //     // 1. Get a pre-signed URL from the backend
  //     // 2. Upload the file to the pre-signed URL
  //     // 3. Confirm the upload with the backend

  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1500));

  //     // Add the new medication to the list
  //     const newMedication: Medication = {
  //       id: (medications.length + 1).toString(),
  //       ...data,
  //     };

  //     setMedications([...medications, newMedication]);

  //     toast({
  //       title: "Medication added successfully",
  //       description: `${data.name} has been added to your medications`,
  //     });

  //     // Reset form and switch to list tab
  //     form.reset();
  //     setActiveTab("list");
  //   } catch (error) {
  //     toast({
  //       title: "Failed to add medication",
  //       description:
  //         error instanceof Error ? error.message : "Something went wrong",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const getPresignedUrl = async () => {
    try {
      const response = await authService.getPresignedUrl();
      // @ts-ignore
      const uploadUrl = response.data.uploadUrl;
      // console.log(response.data.uploadUrl);
      setPresignedUrl(uploadUrl);
    } catch (error) {
      toast({
        title: "Error fetching presigned URL",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", selectedFile);

      if (!presignedUrl) {
        toast({
          title: "No presigned URL",
          description: "Please get a presigned URL first",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(presignedUrl, formData, {
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      console.log(response.data);

      const { secure_url } = response.data;

      console.log("File uploaded successfully:", secure_url);

      // Simulate API call with a delay
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate response with a secureUrl
      // const secureUrl = `https://example.com/uploads/${selectedFile.name}`;

      // Update the form with the secureUrl
      await axios.post(
        "http://localhost:6969/api/v1/user/upload-medication",
        {
          url: secure_url,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "File uploaded successfully",
        description: "Your medical report has been uploaded",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
            <p className="text-muted-foreground">Upload a new medication</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upload">Upload Prescription</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Prescription</CardTitle>
                <CardDescription>
                  Upload a prescription file from your doctor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="prescription">Prescription File</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="prescription"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        onClick={getPresignedUrl}
                      />
                      <Button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isUploading}
                        variant="outline"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accepted file types: PDF, JPG, JPEG, PNG. Maximum file
                      size: 5MB.
                    </p>
                  </div>

                  <div className="rounded-lg border border-dashed p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        Upload Prescription
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                        Upload your prescription file to add it to your medical
                        records. This helps us keep track of your medications.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your files are securely stored and only accessible by
                        your healthcare providers.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
