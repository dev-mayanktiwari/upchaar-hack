"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  ArrowLeft,
  Calendar,
  Bed,
  Users,
  Activity,
} from "lucide-react";
import { fetchHospitalById } from "@/lib/api/hospitals";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HospitalDetailsSkeleton } from "@/components/hospital-details-skeleton";
import { hospitalService } from "@/lib/api-client";


interface Department {
  id: number;
  name: string;
  hospitalId: string;
  headDoctorId: string | null;
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

export default function HospitalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hospitalId = params.id as string;

  useEffect(() => {
    const loadHospital = async () => {
      try {
        setIsLoading(true);
        const res = await hospitalService.getHospitalById(hospitalId);
        // console.log("Hospital details response:", res);
        // @ts-ignore
        const data = res.data.hospital;
        setHospital(data);
      } catch (error) {
        console.error("Error fetching hospital details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Failed to load hospital details. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (hospitalId) {
      loadHospital();
    }
  }, [hospitalId, toast]);

  const renderRatingStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  const handleBookAppointment = () => {
    router.push(`/dashboard/appointments/book?hospital=${hospitalId}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <HospitalDetailsSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (!hospital) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Hospital not found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              The hospital you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/hospitals")}>
              View All Hospitals
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{hospital.name}</CardTitle>
                <div className="flex items-center mt-2">
                  <Badge
                    variant={
                      hospital.type.toLowerCase() === "private"
                        ? "outline"
                        : "secondary"
                    }
                    className="mr-2"
                  >
                    {hospital.type}
                  </Badge>
                  <div className="flex items-center">
                    {renderRatingStars(hospital.rating)}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({hospital.rating}/5)
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={handleBookAppointment}>
                <Calendar className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Address
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <span>{hospital.address}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Registration Number
                  </div>
                  <div>{hospital.registrationNumber}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Contact Phone
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{hospital.phone}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{hospital.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Zipcode
                  </div>
                  <div>{hospital.zipcode}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Nearest Partnered Hospital
                  </div>
                  <div>{hospital.nearestParteneredHospital}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Departments</h3>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {hospital.departments.map((department) => (
                    <div
                      key={department.id}
                      className="flex items-center p-3 border rounded-md"
                    >
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      <span>{department.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bed Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Beds</span>
                    <span className="font-medium">
                      {hospital.beds.totalAvailableBeds}/
                      {hospital.beds.totalBeds}
                    </span>
                  </div>
                  <Progress
                    value={
                      (hospital.beds.totalAvailableBeds /
                        hospital.beds.totalBeds) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ICU Beds</span>
                    <span className="font-medium">
                      {hospital.beds.icu.availableBed}/
                      {hospital.beds.icu.totalBed}
                    </span>
                  </div>
                  <Progress
                    value={
                      (hospital.beds.icu.availableBed /
                        hospital.beds.icu.totalBed) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>General Beds</span>
                    <span className="font-medium">
                      {hospital.beds.general.availableBed}/
                      {hospital.beds.general.totalBed}
                    </span>
                  </div>
                  <Progress
                    value={
                      (hospital.beds.general.availableBed /
                        hospital.beds.general.totalBed) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Premium Beds</span>
                    <span className="font-medium">
                      {hospital.beds.premium.availableBed}/
                      {hospital.beds.premium.totalBed}
                    </span>
                  </div>
                  <Progress
                    value={
                      (hospital.beds.premium.availableBed /
                        hospital.beds.premium.totalBed) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  onClick={handleBookAppointment}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Hospital
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bed className="mr-2 h-4 w-4" />
                  Check Bed Availability
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Emergency Services
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
