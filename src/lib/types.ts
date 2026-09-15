export type YesNo = "" | "Yes" | "No";

export interface PendingAttachment {
  id: string;
  file: File;
  type: "photo" | "police_report" | "medical_record" | "other";
}

export interface InjuryEntry {
  id: number;
  name: string;
  relationship: string;
  description: string;
  seenDoctor: YesNo;
  willingToSee: YesNo;
}

export interface IntakeFormData {
  caseType: string;
  hasAttorney: YesNo;
  occupation: string;

  firstName: string;
  lastName: string;
  phone: string;
  altPhone: string;
  email: string;
  language: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  accDate: string;
  accTime: string;
  bestTime: string;
  policeArrived: "" | "Yes" | "No" | "Not sure";
  description: string;

  injuries: InjuryEntry[];

  consent: boolean;
}

export const CASE_TYPES = [
  "Automobile Accident",
  "Truck Accident",
  "Motorcycle Accident",
  "Rideshare Accident",
  "Pedestrian Accident",
  "Slip & Fall",
  "Dog Bite",
  "Wrongful Death",
  "Other",
] as const;

export const initialFormData: IntakeFormData = {
  caseType: "Automobile Accident",
  hasAttorney: "",
  occupation: "",

  firstName: "",
  lastName: "",
  phone: "",
  altPhone: "",
  email: "",
  language: "English",
  address: "",
  city: "",
  state: "",
  zip: "",

  accDate: "",
  accTime: "",
  bestTime: "",
  policeArrived: "",
  description: "",

  injuries: [],

  consent: false,
};

export const STEP_LABELS = [
  "Your Case",
  "Contact Info",
  "What Happened",
  "Injuries",
  "Review & Submit",
] as const;
