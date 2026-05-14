import { ReportResult } from "../../report-engine/types.js";

export const mockReportResult: ReportResult = {
  report_type: "disease_report",
  topic: {
    name: "Alzheimer's disease",
    description: "A comprehensive pharmaceutical disease landscape report covering multiple conditions found in the generated output.",
  },
  groups: [
    {
      groupName: "Foundations",
      results: [
        {
          status: "fulfilled",
          sectionId: "disease_overview",
          title: "Disease Overview",
          data: {
            definition: "Systemic Lupus Erythematosus (SLE) is a chronic, multisystem autoimmune disorder characterized by a loss of self-tolerance and the production of pathogenic autoantibodies targeting various nuclear antigens.",
            key_features: ["Butterfly rash", "Joint pain", "Kidney involvement", "Photosensitivity"],
            icd_codes: [
              { code: "M32.1", description: "Systemic lupus erythematosus with organ or system involvement" },
              { code: "M32.9", description: "Systemic lupus erythematosus, unspecified" }
            ],
            subtypes: [
              { name: "Systemic Lupus Erythematosus (SLE)", description: "Multisystemic form involving major organs.", severity: "severe" },
              { name: "Chronic Cutaneous Lupus", description: "Primarily affects the skin.", severity: "mild" }
            ]
          }
        },
        {
          status: "fulfilled",
          sectionId: "epidemiology",
          title: "Epidemiology",
          data: {
            prevalence: "Approximately 1 in 1,000 globally (100 per 100,000 population).",
            incidence_rate: "5.1 per 100,000 per year globally.",
            geographic_distribution: [
              { region: "North America", prevalence_per_100k: 150, notes: "Highest in African American and Hispanic women." },
              { region: "Europe", prevalence_per_100k: 120, notes: "Higher in Southern Europe." },
              { region: "Asia", prevalence_per_100k: 80, notes: "Rising in Southeast Asian metropolitan areas." }
            ],
            demographics: {
              age_group: "15 to 45 years (Peak onset)",
              sex_distribution: "9:1 female-to-male ratio",
              ethnicity_notes: "2-4 times higher in non-Caucasian populations."
            }
          }
        },
        {
          status: "fulfilled",
          sectionId: "etiology_risk",
          title: "Etiology & Risk Factors",
          data: {
            narrative: "Multiple Sclerosis (MS) is a complex neuroinflammatory disease resulting from the convergence of a polygenic risk profile and specific environmental catalysts.",
            genetic_factors: ["HLA-DRB1*15:01 allele", "IL2RA gene polymorphism"],
            environmental_factors: ["Tobacco smoking", "Low Vitamin D exposure"],
            risk_scores: [
              { factor: "Genetic", relative_risk: 3.1, confidence: "high" },
              { factor: "Infectious trigger", relative_risk: 32.4, confidence: "high" }
            ],
            mermaid_diagram: "graph TD\n    A[Epstein-Barr Virus] --> B[Molecular Mimicry]\n    B --> C[CNS Autoreactivity]\n    C --> D[Demyelination]"
          }
        }
      ]
    }
  ],
  all_sections: [
    {
      status: "fulfilled",
      sectionId: "disease_overview",
      title: "Disease Overview",
      data: {
        definition: "Systemic Lupus Erythematosus (SLE) is a chronic, multisystem autoimmune disorder characterized by a loss of self-tolerance and the production of pathogenic autoantibodies targeting various nuclear antigens.",
        key_features: ["Butterfly rash", "Joint pain", "Kidney involvement", "Photosensitivity"]
      }
    },
    {
      status: "fulfilled",
      sectionId: "epidemiology",
      title: "Epidemiology",
      data: {
        prevalence: "Approximately 1 in 1,000 globally (100 per 100,000 population).",
        incidence_rate: "5.1 per 100,000 per year globally.",
        geographic_distribution: [
          { region: "North America", prevalence_per_100k: 150, notes: "Highest in African American and Hispanic women." },
          { region: "Europe", prevalence_per_100k: 120, notes: "Higher in Southern Europe." }
        ],
        demographics: {
          age_group: "15 to 45 years",
          sex_distribution: "9:1 female-to-male ratio"
        }
      }
    },
    {
      status: "fulfilled",
      sectionId: "etiology_risk",
      title: "Etiology & Risk Factors",
      data: {
        narrative: "Multiple Sclerosis (MS) is a complex neuroinflammatory disease resulting from the convergence of a polygenic risk profile and specific environmental catalysts.",
        risk_scores: [
          { factor: "Genetic", relative_risk: 3.1, confidence: "high" },
          { factor: "Infectious trigger", relative_risk: 32.4, confidence: "high" }
        ],
        mermaid_diagram: "graph TD\n    A[Epstein-Barr Virus] --> B[Molecular Mimicry]\n    B --> C[CNS Autoreactivity]\n    C --> D[Demyelination]"
      }
    }
  ],
  generated_at: "2026-05-14T12:00:00Z"
};
