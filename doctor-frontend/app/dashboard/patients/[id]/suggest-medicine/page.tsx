"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { aiService, patientService } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

// Custom debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Custom Autocomplete component
const Autocomplete = ({
  placeholder,
  value,
  onChange,
  onSelect,
  suggestions,
  isLoading,
  id,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: any) => void;
  suggestions: any[];
  isLoading: boolean;
  id: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Open dropdown when input is focused and has value
  const handleFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item: any) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          className="w-full pr-10"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div className="sticky top-0 bg-muted/50 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground">
            {suggestions.length} results
          </div>
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => handleSelectItem(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Strength Autocomplete component
const StrengthAutocomplete = ({
  placeholder,
  value,
  onChange,
  options,
  id,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  id: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = () => {
    if (options.length > 0) {
      setIsOpen(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Filter options based on input
    if (newValue) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }

    setIsOpen(true);
  };

  const handleSelectItem = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className="w-full pr-10"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          <div className="sticky top-0 bg-muted/50 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground">
            {filteredOptions.length} strengths available
          </div>
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className={cn(
                "px-3 py-2 cursor-pointer hover:bg-muted transition-colors",
                inputValue === option && "bg-muted"
              )}
              onClick={() => handleSelectItem(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface Patient {
  name: string;
  age: number;
  gender: string;
}

interface Medication {
  id: string;
  name: string;
  strength: string;
  duration: number;
  remarks: string;
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
}

export default function SuggestMedicinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const patientId = resolvedParams.id;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [strengthOptions, setStrengthOptions] = useState<string[]>([]);
  const [selectedStrength, setSelectedStrength] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  const [inventoryResults, setInventoryResults] = useState<{
    missing: string[];
    alternatives: { original: string; alternative: string }[];
  } | null>(null);
  const [interactionResults, setInteractionResults] = useState<
    DrugInteraction[]
  >([]);
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const router = useRouter();
  const { toast } = useToast();

  const medicationSchema = z.object({
    name: z.string().min(1, "Medicine name is required"),
    strength: z.string().min(1, "Strength is required"),
    duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
    remarks: z.string().optional(),
  });

  const form = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      strength: "",
      duration: 7,
      remarks: "",
    },
  });

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  // Effect for live search
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      searchMedicine(debouncedSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  const fetchPatient = async () => {
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
    }
  };

  const searchMedicine = async (term: string) => {
    if (!term || term.length < 2) return;

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(
          term
        )}&ef=STRENGTHS_AND_FORMS`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch medicine data");
      }

      const data = await response.json();
      console.log("Medicine search response:", data);

      // Format of the response: [count, medicineNames, dataObj, additionalInfo]
      if (data && Array.isArray(data) && data.length >= 4) {
        const count = data[0];
        const medicineNames = data[1] || [];
        const dataObj = data[2] || {};
        const strengthsData = dataObj.STRENGTHS_AND_FORMS || [];

        // Create an array of medicine objects with name and strengths
        const medicineResults = medicineNames.map(
          (name: string, index: number) => {
            return {
              name,
              // Get strengths for this medicine from the strengthsData array
              strengths: strengthsData[index] || [],
            };
          }
        );

        setSearchResults(medicineResults);
      }
    } catch (error) {
      console.error("Error searching medicine:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Failed to search for medicines. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMedicineSelect = (medicine: any) => {
    setSelectedMedicine(medicine.name);
    setStrengthOptions(medicine.strengths);
    form.setValue("name", medicine.name);
    setSearchTerm(medicine.name);

    // Automatically select the first strength if available
    if (medicine.strengths && medicine.strengths.length > 0) {
      const firstStrength = medicine.strengths[0];
      setSelectedStrength(firstStrength);
      form.setValue("strength", firstStrength);
    } else {
      // Reset strength when medicine changes and no strengths available
      form.setValue("strength", "");
      setSelectedStrength("");
    }

    // Focus on the strength field
    setTimeout(() => {
      const strengthInput = document.getElementById("strength-input");
      if (strengthInput) strengthInput.focus();
    }, 100);
  };

  const handleStrengthSelect = (strength: string) => {
    setSelectedStrength(strength);
    form.setValue("strength", strength);

    // Focus on the duration field
    setTimeout(() => {
      const durationInput = document.querySelector(
        'input[name="duration"]'
      ) as HTMLInputElement;
      if (durationInput) durationInput.focus();
    }, 100);
  };

  const addMedication = (data: z.infer<typeof medicationSchema>) => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: data.name,
      strength: data.strength,
      duration: data.duration,
      remarks: data.remarks || "",
    };

    setMedications([...medications, newMedication]);

    // Reset form
    form.reset();
    setSearchTerm("");
    setSearchResults([]);
    setSelectedMedicine(null);
    setStrengthOptions([]);
    setSelectedStrength("");

    toast({
      title: "Medication Added",
      description: `${newMedication.name} ${newMedication.strength} added to the list.`,
    });
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const checkInventory = async () => {
    if (medications.length === 0) {
      toast({
        variant: "destructive",
        title: "No Medications",
        description: "Please add medications before checking inventory.",
      });
      return;
    }

    setIsCheckingInventory(true);

    try {
      // Simulate API call to check inventory
      // In a real implementation, this would be an actual API call
      const res = await aiService.getAlternativeMedicines(
        medications.map(({ name, strength }) => ({ name, strength }))
      );
      console.log("Checking inventory for medications:", medications);
      console.log("Inventory check response:", res);
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response for demonstration

      // @ts-ignore
      const mockResponse = res.data.alternativeMedicines;

      setInventoryResults(mockResponse);

      if (mockResponse.missing.length > 0) {
        toast({
          variant: "destructive",
          title: "Inventory Check",
          description: `${mockResponse.missing.length} medication(s) not available in inventory.`,
        });
      } else {
        toast({
          title: "Inventory Check",
          description: "All medications are available in inventory.",
        });
      }
    } catch (error) {
      console.error("Error checking inventory:", error);
      toast({
        variant: "destructive",
        title: "Inventory Check Error",
        description: "Failed to check inventory. Please try again.",
      });
    } finally {
      setIsCheckingInventory(false);
    }
  };

  const checkDrugInteractions = async () => {
    if (medications.length < 2) {
      toast({
        variant: "destructive",
        title: "Not Enough Medications",
        description:
          "At least two medications are required to check for interactions.",
      });
      return;
    }

    setIsCheckingInteractions(true);

    try {
      // Simulate API call to check drug interactions
      // In a real implementation, this would be an actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock response for demonstration
      const mockInteractions: DrugInteraction[] = [
        {
          drug1: medications[0].name,
          drug2: medications.length > 1 ? medications[1].name : "Unknown",
          severity: "moderate",
          description:
            "These medications may interact to increase the risk of side effects. Monitor patient closely.",
        },
      ];

      setInteractionResults(mockInteractions);
      setShowInteractionDialog(true);
    } catch (error) {
      console.error("Error checking drug interactions:", error);
      toast({
        variant: "destructive",
        title: "Interaction Check Error",
        description: "Failed to check drug interactions. Please try again.",
      });
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  const submitMedications = async () => {
    if (medications.length === 0) {
      toast({
        variant: "destructive",
        title: "No Medications",
        description: "Please add medications before submitting.",
      });
      return;
    }

    try {
      // Simulate API call to submit medications
      // In a real implementation, this would be an actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Medications have been successfully prescribed.",
      });

      // Navigate back to patient details
      router.push(`/dashboard/patients/${patientId}`);
    } catch (error) {
      console.error("Error submitting medications:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to submit medications. Please try again.",
      });
    }
  };

  const replaceMedication = (originalId: string, alternativeName: string) => {
    setMedications(
      medications.map((med) =>
        med.id === originalId ? { ...med, name: alternativeName } : med
      )
    );

    setInventoryResults(null);

    toast({
      title: "Medication Replaced",
      description: `Medication has been replaced with ${alternativeName}.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Suggest Medicine
          </h1>
        </div>

        {patient && (
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{patient.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} years • {patient.gender}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Add Medication</CardTitle>
              <CardDescription>
                Search for medicines and add them to the prescription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicine-search">Search Medicine</Label>
                  <Autocomplete
                    id="medicine-search"
                    placeholder="Type medicine name..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    onSelect={handleMedicineSelect}
                    suggestions={searchResults}
                    isLoading={isSearching}
                  />
                </div>

                {selectedMedicine && (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(addMedication)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medicine Name</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="strength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Strength</FormLabel>
                            <FormControl>
                              <StrengthAutocomplete
                                id="strength-input"
                                placeholder="Select or type strength"
                                value={field.value}
                                onChange={field.onChange}
                                options={strengthOptions}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (days)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any special instructions or notes..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional: Add any special instructions for this
                              medication
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Medication
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Prescription</CardTitle>
              <CardDescription>
                Review and finalize the medications to prescribe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No medications added yet. Search and add medications from
                    the left panel.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div
                      key={medication.id}
                      className="flex flex-col rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{medication.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {medication.strength} • {medication.duration} days
                          </p>
                          {medication.remarks && (
                            <p className="mt-2 text-sm">
                              <span className="font-medium">Remarks:</span>{" "}
                              {medication.remarks}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMedication(medication.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>

                      {inventoryResults?.missing.includes(medication.name) && (
                        <div className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                          <div className="flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Not available in inventory</span>
                          </div>
                          {inventoryResults.alternatives.some(
                            (alt) => alt.original === medication.name
                          ) && (
                            <div className="mt-1 ml-6">
                              <span className="font-medium">Alternative: </span>
                              {inventoryResults.alternatives
                                .filter(
                                  (alt) => alt.original === medication.name
                                )
                                .map((alt, index) => (
                                  <Button
                                    key={index}
                                    variant="link"
                                    className="p-0 h-auto text-amber-800 dark:text-amber-200 underline"
                                    onClick={() =>
                                      replaceMedication(
                                        medication.id,
                                        alt.alternative
                                      )
                                    }
                                  >
                                    {alt.alternative}
                                  </Button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={checkInventory}
                  disabled={medications.length === 0 || isCheckingInventory}
                >
                  {isCheckingInventory ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Check Inventory
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={checkDrugInteractions}
                  disabled={medications.length < 2 || isCheckingInteractions}
                >
                  {isCheckingInteractions ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4" />
                  )}
                  Check Interactions
                </Button>
              </div>
              <Button
                className="w-full bg-rose-500 hover:bg-rose-600"
                onClick={submitMedications}
                disabled={medications.length === 0}
              >
                Submit Prescription
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Dialog
          open={showInteractionDialog}
          onOpenChange={setShowInteractionDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Drug Interaction Results</DialogTitle>
              <DialogDescription>
                The following potential interactions were found between the
                prescribed medications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {interactionResults.map((interaction, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        interaction.severity === "severe"
                          ? "destructive"
                          : interaction.severity === "moderate"
                          ? "default"
                          : "outline"
                      }
                    >
                      {interaction.severity.charAt(0).toUpperCase() +
                        interaction.severity.slice(1)}
                    </Badge>
                    <h3 className="font-medium">
                      {interaction.drug1} + {interaction.drug2}
                    </h3>
                  </div>
                  <p className="text-sm">{interaction.description}</p>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowInteractionDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
