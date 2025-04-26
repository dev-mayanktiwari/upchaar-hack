"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  Filter,
} from "lucide-react";
import { fetchHospitals } from "@/lib/api/hospitals";
import { HospitalSkeleton } from "@/components/hospital-skeleton";
import { DashboardLayout } from "@/components/dashboard-layout";
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

export default function HospitalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setIsLoading(true);
        const res = await hospitalService.getAllHospitals();
        // console.log(data);
        // @ts-ignore
        const data = res.data.hospitals;
        setHospitals(data);
        setFilteredHospitals(data);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load hospitals. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadHospitals();
  }, [toast]);

  useEffect(() => {
    // Filter hospitals based on search query and selected type
    let filtered = hospitals;

    if (searchQuery) {
      filtered = filtered.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (hospital) => hospital.type.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredHospitals(filtered);
  }, [searchQuery, selectedType, hospitals]);

  const handleHospitalClick = (hospitalId: string) => {
    router.push(`/hospitals/${hospitalId}`);
  };

  const renderRatingStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Partnered Hospitals
          </h1>
          <p className="text-muted-foreground">
            Browse our network of partnered healthcare facilities
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by hospital name or location..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Tabs
              defaultValue="all"
              className="w-[300px]"
              onValueChange={setSelectedType}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="private">Private</TabsTrigger>
                <TabsTrigger value="public">Public</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <HospitalSkeleton key={index} />
              ))}
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hospitals found</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-md">
              {searchQuery || selectedType !== "all"
                ? "No hospitals match your search criteria. Try adjusting your filters."
                : "There are no partnered hospitals available at the moment."}
            </p>
            {(searchQuery || selectedType !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredHospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleHospitalClick(hospital.id)}
              >
                <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-primary" />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg line-clamp-1">
                          {hospital.name}
                        </h3>
                        <Badge
                          variant={
                            hospital.type.toLowerCase() === "private"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {hospital.type}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{hospital.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {renderRatingStars(hospital.rating)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({hospital.rating}/5)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">
                          Departments
                        </span>
                        <span className="font-medium">
                          {hospital.departments.length}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">
                          Available Beds
                        </span>
                        <span className="font-medium">
                          {hospital.beds?.totalAvailableBeds}/
                          {hospital.beds?.totalBeds}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {hospital.departments.slice(0, 3).map((department) => (
                        <Badge
                          key={department.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {department.name}
                        </Badge>
                      ))}
                      {hospital.departments.length > 3 && (
                        <Badge variant="secondary" className="text-xs">{`+${
                          hospital.departments.length - 3
                        } more`}</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">{hospital.phone}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">{hospital.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
