/**
 * Mock appointment records and lifecycle definition.
 *
 * The stage list is the single source of truth for tracking UI; a realtime
 * transport (Socket.io) would later push the same stage identifiers.
 */

export type AppointmentStage =
  | "requested"
  | "approved"
  | "scheduled"
  | "collector-assigned"
  | "on-the-way"
  | "sample-collected"
  | "completed";

export const STAGE_ORDER: AppointmentStage[] = [
  "requested",
  "approved",
  "scheduled",
  "collector-assigned",
  "on-the-way",
  "sample-collected",
  "completed",
];

export const STAGE_LABEL: Record<AppointmentStage, string> = {
  requested: "Requested",
  approved: "Approved by lab",
  scheduled: "Scheduled",
  "collector-assigned": "Collector assigned",
  "on-the-way": "On the way",
  "sample-collected": "Sample collected",
  completed: "Report ready",
};

export const STAGE_DESCRIPTION: Record<AppointmentStage, string> = {
  requested: "Request sent to the laboratory. Nothing is booked until they approve.",
  approved: "The lab confirmed it can perform every requested test at the quoted price.",
  scheduled: "Date and slot are locked in.",
  "collector-assigned": "A trained phlebotomist has been assigned to your address.",
  "on-the-way": "Collector is travelling to the collection address.",
  "sample-collected": "Samples are logged and in transit to the processing lab.",
  completed: "Reports are verified by a pathologist and available to download.",
};

export interface AppointmentTest {
  testId: string;
  name: string;
  price: number;
}

export interface AppointmentEvent {
  stage: AppointmentStage;
  at: string;
  note?: string;
}

export interface Appointment {
  id: string;
  labId: string;
  labName: string;
  labArea: string;
  patientName: string;
  mode: "lab-visit" | "home-collection";
  address?: string;
  date: string;
  slot: string;
  tests: AppointmentTest[];
  subtotal: number;
  collectionFee: number;
  total: number;
  stage: AppointmentStage;
  events: AppointmentEvent[];
  collector?: { name: string; phone: string; eta: string };
  reportUrl?: string;
}

export const APPOINTMENTS: Appointment[] = [
  {
    id: "LF-24815",
    labId: "apex-diagnostics",
    labName: "Apex Diagnostics",
    labArea: "Kothrud",
    patientName: "Prachi Mulay",
    mode: "home-collection",
    address: "Flat 704, Silver Oak, Baner Road, Pune 411045",
    date: "Thu, 13 Aug 2026",
    slot: "7:00 – 7:30 am",
    tests: [
      { testId: "cbc", name: "CBC", price: 320 },
      { testId: "vitamin-d", name: "Vitamin D", price: 1100 },
      { testId: "hba1c", name: "HbA1c", price: 480 },
    ],
    subtotal: 1900,
    collectionFee: 0,
    total: 1900,
    stage: "on-the-way",
    collector: { name: "Sagar Bhosale", phone: "+91 98•••• ••42", eta: "12 minutes" },
    events: [
      { stage: "requested", at: "12 Aug, 9:14 pm" },
      { stage: "approved", at: "12 Aug, 9:41 pm", note: "All tests available at quoted price." },
      { stage: "scheduled", at: "12 Aug, 9:42 pm", note: "Thu 13 Aug, 7:00 – 7:30 am" },
      { stage: "collector-assigned", at: "13 Aug, 6:20 am", note: "Sagar Bhosale assigned" },
      { stage: "on-the-way", at: "13 Aug, 6:48 am", note: "ETA 12 minutes" },
    ],
  },
  {
    id: "LF-24702",
    labId: "helix-metro",
    labName: "Helix Metro Diagnostics",
    labArea: "Baner",
    patientName: "Prachi Mulay",
    mode: "lab-visit",
    date: "Sat, 15 Aug 2026",
    slot: "8:30 – 9:00 am",
    tests: [
      { testId: "lipid-profile", name: "Lipid Profile", price: 760 },
      { testId: "lft", name: "Liver Function Test", price: 720 },
    ],
    subtotal: 1480,
    collectionFee: 0,
    total: 1480,
    stage: "approved",
    events: [
      { stage: "requested", at: "11 Aug, 7:02 pm" },
      { stage: "approved", at: "11 Aug, 8:10 pm", note: "Fasting of 10–12 hours required." },
    ],
  },
  {
    id: "LF-23940",
    labId: "greenleaf-path",
    labName: "Greenleaf Pathology",
    labArea: "Wakad",
    patientName: "Prachi Mulay",
    mode: "home-collection",
    address: "Flat 704, Silver Oak, Baner Road, Pune 411045",
    date: "Mon, 21 Jul 2026",
    slot: "7:30 – 8:00 am",
    tests: [
      { testId: "thyroid-profile", name: "Thyroid Profile", price: 480 },
      { testId: "cbc", name: "CBC", price: 270 },
    ],
    subtotal: 750,
    collectionFee: 0,
    total: 750,
    stage: "completed",
    reportUrl: "#",
    events: [
      { stage: "requested", at: "20 Jul, 10:11 am" },
      { stage: "approved", at: "20 Jul, 11:02 am" },
      { stage: "scheduled", at: "20 Jul, 11:02 am" },
      { stage: "collector-assigned", at: "21 Jul, 6:40 am" },
      { stage: "on-the-way", at: "21 Jul, 7:12 am" },
      { stage: "sample-collected", at: "21 Jul, 7:44 am" },
      { stage: "completed", at: "21 Jul, 6:05 pm", note: "Report verified by Dr. A. Kulkarni" },
    ],
  },
  {
    id: "LF-23611",
    labId: "medcore-labs",
    labName: "MedCore Reference Labs",
    labArea: "Shivajinagar",
    patientName: "Prachi Mulay",
    mode: "lab-visit",
    date: "Fri, 12 Jun 2026",
    slot: "9:00 – 9:30 am",
    tests: [{ testId: "iron-studies", name: "Iron Studies", price: 1350 }],
    subtotal: 1350,
    collectionFee: 0,
    total: 1350,
    stage: "completed",
    reportUrl: "#",
    events: [
      { stage: "requested", at: "11 Jun, 4:15 pm" },
      { stage: "completed", at: "12 Jun, 9:50 pm" },
    ],
  },
];

export function getAppointmentById(id: string): Appointment | undefined {
  return APPOINTMENTS.find((a) => a.id === id);
}

export function stageIndex(stage: AppointmentStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export const SAVED_LAB_IDS = ["apex-diagnostics", "helix-metro", "orion-clinical"];

export const RECENT_SEARCHES = [
  { tests: "cbc,vitamin-d,hba1c,thyroid-profile", loc: "Pune, Maharashtra", when: "Yesterday" },
  { tests: "lipid-profile,lft", loc: "Baner, Pune", when: "3 days ago" },
  { tests: "iron-studies,vitamin-b12", loc: "Shivajinagar, Pune", when: "Last month" },
];

export const ADDRESSES = [
  {
    id: "home",
    label: "Home",
    line: "Flat 704, Silver Oak, Baner Road, Pune 411045",
    isDefault: true,
  },
  {
    id: "office",
    label: "Office",
    line: "Level 5, Cybercity Tower 3, Magarpatta, Pune 411028",
    isDefault: false,
  },
];

export const TIME_SLOTS = [
  "6:30 – 7:00 am",
  "7:00 – 7:30 am",
  "7:30 – 8:00 am",
  "8:00 – 8:30 am",
  "8:30 – 9:00 am",
  "9:00 – 9:30 am",
  "10:00 – 10:30 am",
  "11:00 – 11:30 am",
  "4:00 – 4:30 pm",
  "5:00 – 5:30 pm",
  "6:00 – 6:30 pm",
  "7:00 – 7:30 pm",
];
