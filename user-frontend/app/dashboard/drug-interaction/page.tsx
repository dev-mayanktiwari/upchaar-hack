"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Info,
  PlusCircle,
  ShieldAlert,
  Utensils,
  Activity,
  BookOpen,
  Pill,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import { mockReport } from "@/constants";

export interface DrugInteractionReport {
  report_metadata: {
    generated_on: string;
    risk_level: "LOW" | "MODERATE" | "HIGH";
    summary: string;
  };
  medications: Array<{
    name: string;
    class: string;
    indications: string;
    mechanism_of_action: string;
  }>;
  interactions: Array<{
    drug_1: string;
    drug_2: string;
    interaction_risk: "HIGH" | "MEDIUM" | "LOW";
    description: string;
    confidence: "HIGH" | "MEDIUM" | "LOW";
  }>;
  symptoms: {
    expected_symptoms: Array<{
      name: string;
      description: string;
      duration: string;
    }>;
    monitoring_needed: Array<{
      parameter: string;
      target_range: string;
      action_required: string;
    }>;
    concerning_symptoms: Array<{
      name: string;
      severity: string;
      description: string;
    }>;
  };
  detailed_explanation: {
    mechanism: string;
    potential_consequences: string;
  };
  recommendations: {
    general_advice: string;
    patient_specific_advice: string;
  };
  alternative_medications: Array<{
    current_medication: string;
    alternative: string;
    reason: string;
  }>;
  dietary_precautions: Array<{
    substance: string;
    risk: string;
    recommendation: string;
  }>;
  references: Array<{
    source: string;
    link: string;
  }>;
  disclaimer: string;
}

export default function DrugInteractionReport() {
  const { toast } = useToast();
  const [report, setReport] = useState<DrugInteractionReport | null>(null);
  const [loading, setLoading] = useState(false);

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    medications: true,
    interactions: true,
    symptoms: true,
    detailedExplanation: false,
    recommendations: true,
    alternativeMedications: false,
    dietaryPrecautions: false,
    references: false,
    disclaimer: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  //  Function to generate mock data for demonstration
  const generateMockReport = async () => {
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    const response = await axios.get(
      "http://localhost:6969/api/v1/user/drug-interaction",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // setReport(mockReport);
    console.log(response.data.data.result);
    setReport(response.data.data.result);
  };

  const getRiskBadge = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case "HIGH":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            High Risk
          </Badge>
        );
      case "MODERATE":
      case "MEDIUM":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Moderate Risk
          </Badge>
        );
      case "LOW":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
          >
            <Info className="mr-1 h-3 w-3" />
            Low Risk
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            No Risk
          </Badge>
        );
    }
  };

  const getConfidenceBadge = (confidence: string | undefined) => {
    switch (confidence) {
      case "HIGH":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            High Confidence
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Medium Confidence
          </Badge>
        );
      case "LOW":
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            Low Confidence
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Drug Interaction Test Report
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyze potential interactions between your medications
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            Important Information
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            This tool provides general information about potential drug
            interactions and is not a substitute for professional medical
            advice. Always consult with your healthcare provider before making
            any changes to your medication regimen.
          </AlertDescription>
        </Alert>

        {!report && (
          <Card className="border-2 border-dashed border-slate-200 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-center">
                Generate Test Report
              </CardTitle>
              <CardDescription className="text-center">
                Click the button below to generate a sample drug interaction
                report
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button
                onClick={generateMockReport}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Generate Sample Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report Header */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Drug Interaction Report
                    </h2>
                    <p className="text-sm opacity-90 ">
                      Generated on:{" "}
                      {report.report_metadata?.generated_on
                        ? new Date(
                            report.report_metadata.generated_on
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm font-medium">Risk Level:</span>
                    {getRiskBadge(report.report_metadata?.risk_level)}
                  </div>
                </div>
              </div>
              <CardContent className="p-6 bg-white">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-medium text-purple-900">Summary</p>
                  <p className="mt-2 text-purple-800">
                    {report.report_metadata?.summary || "No summary available."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Detailed Info</TabsTrigger>
                <TabsTrigger value="recommendations">
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Medications Section */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("medications")}
                  >
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">
                        Medications
                      </h3>
                    </div>
                    {openSections.medications ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.medications && (
                    <CardContent className="p-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {report.medications?.map((med, index) => (
                          <Card
                            key={index}
                            className="overflow-hidden border-0 shadow-md"
                          >
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3">
                              <h4 className="font-semibold text-white">
                                {med.name || "Unknown Medication"}
                              </h4>
                            </div>
                            <CardContent className="p-4 bg-white">
                              <div className="grid gap-2 text-sm">
                                <div className="flex gap-2">
                                  <span className="font-medium text-slate-700 min-w-24">
                                    Class:
                                  </span>
                                  <span className="text-gray-800">
                                    {med.class || "Unknown"}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="font-medium text-slate-700 min-w-24">
                                    Used for:
                                  </span>
                                  <span className="font-medium text-slate-700 min-w-24">
                                    {med.indications || "Unknown"}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="font-medium text-slate-700 min-w-24">
                                    How it works:
                                  </span>
                                  <span className="text-gray-800">
                                    {med.mechanism_of_action || "Unknown"}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Interactions Section */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("interactions")}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">
                        Interactions
                      </h3>
                    </div>
                    {openSections.interactions ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.interactions && (
                    <CardContent className="p-4">
                      <div className="grid gap-4">
                        {report.interactions?.map((interaction, index) => (
                          <Card
                            key={index}
                            className={`overflow-hidden border-0 shadow-md ${
                              interaction.interaction_risk === "HIGH"
                                ? "bg-red-50"
                                : interaction.interaction_risk === "MEDIUM"
                                ? "bg-amber-50"
                                : "bg-blue-50"
                            }`}
                          >
                            <div
                              className={`p-4 ${
                                interaction.interaction_risk === "HIGH"
                                  ? "bg-gradient-to-r from-red-500 to-red-600"
                                  : interaction.interaction_risk === "MEDIUM"
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600"
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div className="flex items-center gap-2 text-white">
                                  <span className="font-medium">
                                    {interaction.drug_1 || "Unknown"}
                                  </span>
                                  <span>+</span>
                                  <span className="font-medium font-gray-800">
                                    {interaction.drug_2 || "Unknown"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {getRiskBadge(interaction.interaction_risk)}
                                  {getConfidenceBadge(interaction.confidence)}
                                </div>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <p className="text-gray-800">
                                {interaction.description ||
                                  "No description available."}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Symptoms Section */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("symptoms")}
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">Symptoms</h3>
                    </div>
                    {openSections.symptoms ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.symptoms && (
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                        {/* Expected Symptoms */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                              <Activity className="mr-1 h-3 w-3" />
                              Expected
                            </Badge>
                          </div>

                          <ScrollArea className="h-64 pr-4">
                            <div className="grid gap-3">
                              {report.symptoms?.expected_symptoms?.map(
                                (symptom, index) => (
                                  <div
                                    key={index}
                                    className="p-3 rounded-md bg-green-50 border border-green-100"
                                  >
                                    <h4 className="font-medium text-slate-900">
                                      {symptom.name || "Unknown symptom"}
                                    </h4>
                                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                                      <Clock className="h-3 w-3" />
                                      <span className="text-gray-800">
                                        {symptom.duration || "Unknown duration"}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-800">
                                      {symptom.description ||
                                        "No description available."}
                                    </p>
                                  </div>
                                )
                              )}
                              {(!report.symptoms?.expected_symptoms ||
                                report.symptoms.expected_symptoms.length ===
                                  0) && (
                                <div className="text-center p-4 text-slate-500">
                                  No expected symptoms listed
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>

                        {/* Monitoring Needed */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200">
                              <Clock className="mr-1 h-3 w-3" />
                              Monitoring Needed
                            </Badge>
                          </div>

                          <ScrollArea className="h-64 pr-4">
                            <div className="grid gap-3">
                              {report.symptoms?.monitoring_needed?.map(
                                (item, index) => (
                                  <div
                                    key={index}
                                    className="p-3 rounded-md bg-amber-50 border border-amber-100"
                                  >
                                    <h4 className="font-medium text-slate-900">
                                      {item.parameter || "Unknown parameter"}
                                    </h4>
                                    <div className="mt-2 grid gap-1 text-sm">
                                      <div className="flex gap-2">
                                        <span className="font-medium text-slate-700 min-w-24">
                                          Target Range:
                                        </span>
                                        <span className="text-gray-800">
                                          {item.target_range || "Unknown"}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <span className="font-medium text-slate-700 min-w-24">
                                          Action Required:
                                        </span>
                                        <span className="text-gray-800">
                                          {item.action_required || "Unknown"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                              {(!report.symptoms?.monitoring_needed ||
                                report.symptoms.monitoring_needed.length ===
                                  0) && (
                                <div className="text-center p-4 text-slate-500">
                                  No monitoring parameters listed
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>

                        {/* Concerning Symptoms */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Concerning
                            </Badge>
                          </div>

                          <ScrollArea className="h-64 pr-4">
                            <div className="grid gap-3">
                              {report.symptoms?.concerning_symptoms?.map(
                                (symptom, index) => (
                                  <div
                                    key={index}
                                    className="p-3 rounded-md bg-red-50 border border-red-100"
                                  >
                                    <h4 className="font-medium text-slate-900">
                                      {symptom.name || "Unknown symptom"}
                                    </h4>
                                    <div className="mt-1 text-sm text-red-600 font-medium">
                                      Seek immediate medical attention
                                    </div>
                                    <p className="mt-2 text-sm text-gray-800">
                                      {symptom.description ||
                                        "No description available."}
                                    </p>
                                  </div>
                                )
                              )}
                              {(!report.symptoms?.concerning_symptoms ||
                                report.symptoms.concerning_symptoms.length ===
                                  0) && (
                                <div className="text-center p-4 text-slate-500">
                                  No concerning symptoms listed
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                {/* Detailed Explanation */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("detailedExplanation")}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">
                        Detailed Explanation
                      </h3>
                    </div>
                    {openSections.detailedExplanation ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.detailedExplanation && (
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <h4 className="font-medium text-indigo-900 mb-2">
                            Mechanism
                          </h4>
                          <p className="text-indigo-800">
                            {report.detailed_explanation?.mechanism ||
                              "No mechanism information available."}
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                          <h4 className="font-medium text-purple-900 mb-2">
                            Potential Consequences
                          </h4>
                          <p className="text-purple-800">
                            {report.detailed_explanation
                              ?.potential_consequences ||
                              "No information on potential consequences available."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Alternative Medications */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("alternativeMedications")}
                  >
                    <div className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">
                        Alternative Medications
                      </h3>
                    </div>
                    {openSections.alternativeMedications ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.alternativeMedications && (
                    <CardContent className="p-4">
                      <div className="grid gap-3">
                        {report.alternative_medications?.map((alt, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-md bg-teal-50 border border-teal-100"
                          >
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800">
                                  {alt.current_medication || "Unknown"}
                                </span>
                                <span className="text-slate-400">→</span>
                                <span className="font-medium text-teal-600">
                                  {alt.alternative || "Unknown alternative"}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-teal-800">
                              {alt.reason || "No reason provided."}
                            </p>
                          </div>
                        ))}
                        {(!report.alternative_medications ||
                          report.alternative_medications.length === 0) && (
                          <div className="text-center p-4 text-slate-500">
                            No alternative medications listed
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Dietary Precautions */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("dietaryPrecautions")}
                  >
                    <div className="flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">
                        Dietary Precautions
                      </h3>
                    </div>
                    {openSections.dietaryPrecautions ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.dietaryPrecautions && (
                    <CardContent className="p-4">
                      <div className="grid gap-3">
                        {report.dietary_precautions?.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-md bg-orange-50 border border-orange-100"
                          >
                            <h4 className="font-medium text-orange-900">
                              {item.substance || "Unknown substance"}
                            </h4>
                            <div className="mt-2 grid gap-2 text-sm">
                              <div>
                                <span className="font-medium text-orange-800">
                                  Risk:
                                </span>
                                <p className="mt-1 text-orange-700">
                                  {item.risk || "Unknown risk"}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-orange-800">
                                  Recommendation:
                                </span>
                                <p className="mt-1 text-orange-700">
                                  {item.recommendation ||
                                    "No recommendation provided."}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!report.dietary_precautions ||
                          report.dietary_precautions.length === 0) && (
                          <div className="text-center p-4 text-slate-500">
                            No dietary precautions listed
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {/* Recommendations */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("recommendations")}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">
                        Recommendations
                      </h3>
                    </div>
                    {openSections.recommendations ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.recommendations && (
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="p-4 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                          <h4 className="font-medium text-blue-900 mb-2">
                            General Advice
                          </h4>
                          <p className="text-blue-800">
                            {report.recommendations?.general_advice ||
                              "No general advice available."}
                          </p>
                        </div>
                        <div className="p-4 rounded-md bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                          <h4 className="font-medium text-purple-900 mb-2">
                            Patient-Specific Advice
                          </h4>
                          <p className="text-purple-800">
                            {report.recommendations?.patient_specific_advice ||
                              "No patient-specific advice available."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="references" className="space-y-6">
                {/* References */}
                <Card>
                  <div
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer"
                    onClick={() => toggleSection("references")}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-600">
                        References
                      </h3>
                    </div>
                    {openSections.references ? (
                      <ChevronUp className="h-5 w-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  {openSections.references && (
                    <CardContent className="p-4">
                      <ul className="space-y-3">
                        {report.references?.map((ref, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 p-3 bg-slate-50 rounded-md border"
                          >
                            <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-medium text-gray-800">
                                {ref.source || "Unknown source"}
                              </span>
                              {ref.link && (
                                <a
                                  href={ref.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center mt-1"
                                >
                                  Visit source{" "}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                        {(!report.references ||
                          report.references.length === 0) && (
                          <div className="text-center p-4 text-slate-500">
                            No references listed
                          </div>
                        )}
                      </ul>
                    </CardContent>
                  )}
                </Card>

                {/* Disclaimer */}
                <Card className="border-red-200">
                  <div
                    className="flex items-center justify-between p-4 bg-red-50 cursor-pointer"
                    onClick={() => toggleSection("disclaimer")}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                      <h3 className="font-medium text-red-700">
                        Medical Disclaimer
                      </h3>
                    </div>
                    {openSections.disclaimer ? (
                      <ChevronUp className="h-5 w-5 text-red-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  {openSections.disclaimer && (
                    <CardContent className="p-4 bg-white">
                      <p className="text-sm italic text-red-900 font-bold">
                        {report.disclaimer ||
                          "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your healthcare provider before making any changes to your medication regimen."}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setReport(null)}
                variant="outline"
                className="text-slate-600"
              >
                Generate New Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
