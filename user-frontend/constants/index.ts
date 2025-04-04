import { DrugInteractionReport } from "@/app/dashboard/drug-interaction/page";

export const allergiesList = [
  "Penicillin",
  "Peanuts",
  "Shellfish",
  "Eggs",
  "Dairy",
  "Latex",
  "Pollen",
  "Dust",
  "Pet Dander",
  "Insect Stings",
];

export const chronicDiseasesList = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Arthritis",
  "COPD",
  "Cancer",
  "Kidney Disease",
  "Thyroid Disorder",
  "Depression",
];

export const pastSurgeriesList = [
  "Appendectomy",
  "Tonsillectomy",
  "Gallbladder Removal",
  "Hernia Repair",
  "Knee Surgery",
  "Hip Replacement",
  "Cataract Surgery",
  "Cesarean Section",
  "Heart Surgery",
  "Spinal Surgery",
];

export const mockReport: DrugInteractionReport = {
  report_metadata: {
    generated_on: new Date().toISOString(),
    risk_level: "MODERATE",
    summary:
      "There are some moderate interactions between your medications that require monitoring. Please consult with your healthcare provider before making any changes.",
  },
  medications: [
    {
      name: "Lisinopril",
      class: "ACE Inhibitor",
      indications: "Hypertension, Heart Failure",
      mechanism_of_action:
        "Inhibits angiotensin-converting enzyme, reducing blood pressure",
    },
    {
      name: "Aspirin",
      class: "NSAID, Antiplatelet",
      indications: "Pain, Inflammation, Blood Clot Prevention",
      mechanism_of_action:
        "Inhibits prostaglandin synthesis and platelet aggregation",
    },
    {
      name: "Simvastatin",
      class: "Statin",
      indications: "Hypercholesterolemia",
      mechanism_of_action:
        "Inhibits HMG-CoA reductase, reducing cholesterol production",
    },
  ],
  interactions: [
    {
      drug_1: "Lisinopril",
      drug_2: "Aspirin",
      interaction_risk: "MEDIUM",
      description:
        "This combination may reduce the blood pressure lowering effects of Lisinopril and increase the risk of kidney dysfunction.",
      confidence: "HIGH",
    },
    {
      drug_1: "Aspirin",
      drug_2: "Simvastatin",
      interaction_risk: "LOW",
      description: "No significant interaction expected at normal doses.",
      confidence: "MEDIUM",
    },
  ],
  symptoms: {
    expected_symptoms: [
      {
        name: "Dry Cough",
        description:
          "A common side effect of Lisinopril that is not harmful but may be bothersome.",
        duration: "May persist while taking the medication",
      },
      {
        name: "Stomach Upset",
        description:
          "Aspirin may cause mild stomach discomfort, especially if taken without food.",
        duration: "Usually temporary, resolves within hours",
      },
    ],
    monitoring_needed: [
      {
        parameter: "Blood Pressure",
        target_range: "Below 130/80 mmHg",
        action_required:
          "Contact your doctor if consistently above 140/90 mmHg",
      },
      {
        parameter: "Kidney Function",
        target_range: "eGFR > 60 mL/min",
        action_required:
          "Regular blood tests recommended; report any changes in urination",
      },
    ],
    concerning_symptoms: [
      {
        name: "Swelling of face, lips, or throat",
        severity: "HIGH",
        description:
          "May indicate an allergic reaction to Lisinopril. Seek emergency medical attention immediately.",
      },
      {
        name: "Unusual bleeding or bruising",
        severity: "HIGH",
        description:
          "May indicate increased bleeding risk from Aspirin. Contact your doctor immediately.",
      },
    ],
  },
  detailed_explanation: {
    mechanism:
      "Aspirin can inhibit prostaglandin synthesis in the kidneys, which may reduce the effectiveness of ACE inhibitors like Lisinopril. Additionally, this combination may increase the risk of kidney dysfunction, especially in patients with pre-existing kidney disease or those who are dehydrated.",
    potential_consequences:
      "Reduced blood pressure control, increased risk of kidney dysfunction, and potentially increased potassium levels in the blood.",
  },
  recommendations: {
    general_advice:
      "Take medications as prescribed. Monitor blood pressure regularly. Stay well-hydrated. Report any new symptoms to your healthcare provider promptly.",
    patient_specific_advice:
      "Consider taking Aspirin with food to reduce stomach upset. Monitor for signs of kidney problems such as changes in urination or swelling.",
  },
  alternative_medications: [
    {
      current_medication: "Aspirin",
      alternative: "Acetaminophen",
      reason:
        "For pain relief only (not for blood thinning), may have less interaction with Lisinopril",
    },
  ],
  dietary_precautions: [
    {
      substance: "High Potassium Foods",
      risk: "Lisinopril can increase potassium levels, and excessive potassium intake may lead to dangerous levels.",
      recommendation:
        "Moderate consumption of high-potassium foods like bananas, oranges, and potatoes.",
    },
    {
      substance: "Alcohol",
      risk: "May enhance the blood-pressure-lowering effect of Lisinopril and increase the risk of stomach irritation with Aspirin.",
      recommendation: "Limit alcohol consumption and never binge drink.",
    },
  ],
  references: [
    {
      source: "Drug Interaction Facts. Facts and Comparisons",
      link: "https://www.drugs.com/interactions.html",
    },
    {
      source: "American Heart Association Guidelines",
      link: "https://www.heart.org/en/health-topics/consumer-healthcare/medication-information",
    },
  ],
  disclaimer:
    "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult your healthcare provider before making any changes to your medication regimen. In case of emergency, contact emergency services immediately.",
};
