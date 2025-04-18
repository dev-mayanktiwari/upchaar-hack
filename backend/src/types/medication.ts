export type Medication = {
  name: string;
  class: string;
  indications: string;
  mechanism_of_action: string;
  dosage: string | null;
  route: string | null;
  frequency: string | null;
  duration: string | null;
};
