/**
 * Mock laboratory directory.
 *
 * Shaped like the eventual API response (GET /labs). Coordinates are real-ish
 * Pune coordinates so the map projection behaves like production data.
 * Replace the array, keep the types.
 */

export interface LabReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  body: string;
}

export interface LabTestPrice {
  testId: string;
  /** Lab's own naming for the canonical test, shown on the profile. */
  labName: string;
  price: number;
  reportTimeHours: number;
}

export interface Lab {
  id: string;
  name: string;
  tagline: string;
  area: string;
  city: string;
  addressLine: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  accreditations: string[];
  facilities: string[];
  homeCollection: boolean;
  homeCollectionFee: number;
  homeCollectionMinOrder: number;
  earliestSlot: string;
  openToday: string;
  hours: { day: string; open: string }[];
  tests: LabTestPrice[];
  reviews: LabReview[];
}

const HOURS_STANDARD = [
  { day: "Monday", open: "6:30 am – 9:00 pm" },
  { day: "Tuesday", open: "6:30 am – 9:00 pm" },
  { day: "Wednesday", open: "6:30 am – 9:00 pm" },
  { day: "Thursday", open: "6:30 am – 9:00 pm" },
  { day: "Friday", open: "6:30 am – 9:00 pm" },
  { day: "Saturday", open: "7:00 am – 6:00 pm" },
  { day: "Sunday", open: "7:30 am – 1:00 pm" },
];

const HOURS_EXTENDED = [
  { day: "Monday", open: "24 hours" },
  { day: "Tuesday", open: "24 hours" },
  { day: "Wednesday", open: "24 hours" },
  { day: "Thursday", open: "24 hours" },
  { day: "Friday", open: "24 hours" },
  { day: "Saturday", open: "24 hours" },
  { day: "Sunday", open: "24 hours" },
];

function price(
  testId: string,
  labName: string,
  amount: number,
  reportTimeHours = 24,
): LabTestPrice {
  return { testId, labName, price: amount, reportTimeHours };
}

export const LABS: Lab[] = [
  {
    id: "apex-diagnostics",
    name: "Apex Diagnostics",
    tagline: "NABL-accredited pathology and radiology centre",
    area: "Kothrud",
    city: "Pune",
    addressLine: "2nd Floor, Sunrise Plaza, Paud Road, Kothrud",
    lat: 18.5074,
    lng: 73.8077,
    distanceKm: 3.2,
    rating: 4.7,
    reviewCount: 128,
    verified: true,
    accreditations: ["NABL M(EL)T", "ISO 15189:2022"],
    facilities: ["In-house pathology", "Wheelchair access", "Digital reports", "Parking"],
    homeCollection: true,
    homeCollectionFee: 100,
    homeCollectionMinOrder: 400,
    earliestSlot: "Tomorrow, 7:00 am",
    openToday: "6:30 am – 9:00 pm",
    hours: HOURS_STANDARD,
    tests: [
      price("cbc", "Complete Blood Count (CBC)", 320, 12),
      price("hba1c", "HbA1c — Glycated Haemoglobin", 480),
      price("vitamin-d", "Vitamin D (25-OH)", 1100),
      price("thyroid-profile", "Thyroid Profile (T3, T4, TSH)", 520),
      price("lipid-profile", "Lipid Profile", 600, 12),
      price("lft", "Liver Function Test", 620),
      price("kft", "Kidney Function Test", 580),
      price("vitamin-b12", "Vitamin B12 (Serum)", 890),
      price("urine-routine", "Urine Routine & Microscopy", 180, 6),
    ],
    reviews: [
      {
        id: "r1",
        author: "Sneha K.",
        rating: 5,
        date: "2 weeks ago",
        body: "Home collection arrived on time and the phlebotomist was careful. Reports were on the portal the same evening.",
      },
      {
        id: "r2",
        author: "Rahul M.",
        rating: 4,
        date: "1 month ago",
        body: "Prices are fair and the centre is clean. Morning queue can be long around 8 am.",
      },
      {
        id: "r3",
        author: "Anita D.",
        rating: 5,
        date: "1 month ago",
        body: "They flagged that my lipid profile needed fasting before confirming the slot. Appreciated the call.",
      },
    ],
  },
  {
    id: "medcore-labs",
    name: "MedCore Reference Labs",
    tagline: "High-volume reference laboratory with 24×7 intake",
    area: "Shivajinagar",
    city: "Pune",
    addressLine: "Ground Floor, Corvus House, JM Road, Shivajinagar",
    lat: 18.5308,
    lng: 73.8478,
    distanceKm: 5.8,
    rating: 4.5,
    reviewCount: 342,
    verified: true,
    accreditations: ["NABL M(EL)T", "CAP proficiency", "ISO 9001"],
    facilities: ["24×7 collection", "In-house pathology", "Digital reports", "Cafeteria"],
    homeCollection: true,
    homeCollectionFee: 0,
    homeCollectionMinOrder: 800,
    earliestSlot: "Today, 4:30 pm",
    openToday: "24 hours",
    hours: HOURS_EXTENDED,
    tests: [
      price("cbc", "Hemogram (CBC)", 290, 8),
      price("hba1c", "HbA1c", 450),
      price("vitamin-d", "25-OH Vitamin D", 1250),
      price("thyroid-profile", "Thyroid Function Test", 560),
      price("lipid-profile", "Lipid Panel", 640, 10),
      price("lft", "Hepatic Panel", 660),
      price("kft", "Renal Panel", 610),
      price("vitamin-b12", "Cobalamin (B12)", 950),
      price("urine-routine", "Urinalysis", 160, 4),
      price("iron-studies", "Iron Studies (Fe, TIBC, Ferritin)", 1350),
    ],
    reviews: [
      {
        id: "r1",
        author: "Dr. Prakash V.",
        rating: 5,
        date: "3 weeks ago",
        body: "I refer patients here for urgent panels. Turnaround is genuinely fast.",
      },
      {
        id: "r2",
        author: "Farah S.",
        rating: 4,
        date: "2 months ago",
        body: "Free home collection above ₹800 is a real saving. Reception can be busy at peak hours.",
      },
    ],
  },
  {
    id: "sanjeevani-path",
    name: "Sanjeevani Pathology",
    tagline: "Neighbourhood collection centre, 22 years in Pune",
    area: "Aundh",
    city: "Pune",
    addressLine: "Shop 4, Vasant Vihar, Aundh Road, Aundh",
    lat: 18.5593,
    lng: 73.8078,
    distanceKm: 7.4,
    rating: 4.2,
    reviewCount: 74,
    verified: true,
    accreditations: ["NABL M(EL)T"],
    facilities: ["Digital reports", "Senior-citizen priority", "Parking"],
    homeCollection: true,
    homeCollectionFee: 150,
    homeCollectionMinOrder: 300,
    earliestSlot: "Tomorrow, 8:00 am",
    openToday: "7:00 am – 8:00 pm",
    hours: HOURS_STANDARD,
    tests: [
      price("cbc", "CBC", 250, 12),
      price("hba1c", "HbA1c", 400),
      price("thyroid-profile", "TFT (T3/T4/TSH)", 450),
      price("lipid-profile", "Lipid Profile", 520, 12),
      price("kft", "KFT", 520),
      price("urine-routine", "Urine R/M", 140, 6),
      price("vitamin-b12", "Vitamin B12", 820),
    ],
    reviews: [
      {
        id: "r1",
        author: "Mangesh P.",
        rating: 4,
        date: "1 month ago",
        body: "Cheapest CBC in the area and the staff know regular patients by name.",
      },
      {
        id: "r2",
        author: "Kavita R.",
        rating: 4,
        date: "3 months ago",
        body: "No vitamin D testing in-house, they outsource it. Ask before booking.",
      },
    ],
  },
  {
    id: "helix-metro",
    name: "Helix Metro Diagnostics",
    tagline: "Full-spectrum diagnostics with same-day reporting",
    area: "Baner",
    city: "Pune",
    addressLine: "Unit 12, Amar Business Zone, Baner Road, Baner",
    lat: 18.5642,
    lng: 73.7769,
    distanceKm: 9.1,
    rating: 4.8,
    reviewCount: 216,
    verified: true,
    accreditations: ["NABL M(EL)T", "ISO 15189:2022", "CAP proficiency"],
    facilities: [
      "In-house pathology",
      "Radiology",
      "Wheelchair access",
      "Digital reports",
      "Parking",
    ],
    homeCollection: true,
    homeCollectionFee: 200,
    homeCollectionMinOrder: 500,
    earliestSlot: "Today, 6:00 pm",
    openToday: "6:00 am – 10:00 pm",
    hours: HOURS_STANDARD,
    tests: [
      price("cbc", "Complete Blood Count", 380, 6),
      price("hba1c", "HbA1c (NGSP certified)", 550),
      price("vitamin-d", "Vitamin D3 (25-OH)", 1290),
      price("thyroid-profile", "Thyroid Profile", 640),
      price("lipid-profile", "Extended Lipid Profile", 760, 8),
      price("lft", "Liver Function Test", 720),
      price("kft", "Kidney Function Test", 700),
      price("vitamin-b12", "Vitamin B12", 1050),
      price("urine-routine", "Urine Routine", 220, 4),
      price("iron-studies", "Iron Studies", 1450),
    ],
    reviews: [
      {
        id: "r1",
        author: "Nikhil J.",
        rating: 5,
        date: "1 week ago",
        body: "Premium experience — near-zero wait, and the report explains reference ranges clearly.",
      },
      {
        id: "r2",
        author: "Shreya B.",
        rating: 5,
        date: "1 month ago",
        body: "Expensive compared to local labs, but the same-day turnaround was worth it for us.",
      },
    ],
  },
  {
    id: "citycare-collection",
    name: "CityCare Collection Point",
    tagline: "Budget collection centre, samples processed at partner lab",
    area: "Hadapsar",
    city: "Pune",
    addressLine: "B-Wing, Amanora Mall Road, Hadapsar",
    lat: 18.5089,
    lng: 73.926,
    distanceKm: 12.6,
    rating: 3.9,
    reviewCount: 51,
    verified: false,
    accreditations: [],
    facilities: ["Digital reports"],
    homeCollection: false,
    homeCollectionFee: 0,
    homeCollectionMinOrder: 0,
    earliestSlot: "Tomorrow, 9:30 am",
    openToday: "8:00 am – 6:00 pm",
    hours: HOURS_STANDARD,
    tests: [
      price("cbc", "CBC", 210, 24),
      price("hba1c", "HbA1c", 360, 36),
      price("thyroid-profile", "Thyroid Profile", 390, 36),
      price("urine-routine", "Urine Routine", 120, 12),
    ],
    reviews: [
      {
        id: "r1",
        author: "Vikram T.",
        rating: 4,
        date: "2 months ago",
        body: "Lowest prices I found, but reports take a day longer since samples travel.",
      },
      {
        id: "r2",
        author: "Priya N.",
        rating: 3,
        date: "4 months ago",
        body: "Verification is still pending on their listing. Basic tests were fine.",
      },
    ],
  },
  {
    id: "orion-clinical",
    name: "Orion Clinical Laboratory",
    tagline: "Specialist endocrine and metabolic testing",
    area: "Viman Nagar",
    city: "Pune",
    addressLine: "301, Nyati Empire, Viman Nagar",
    lat: 18.5679,
    lng: 73.9143,
    distanceKm: 11.2,
    rating: 4.6,
    reviewCount: 97,
    verified: true,
    accreditations: ["NABL M(EL)T", "ISO 15189:2022"],
    facilities: ["In-house pathology", "Digital reports", "Wheelchair access"],
    homeCollection: true,
    homeCollectionFee: 120,
    homeCollectionMinOrder: 600,
    earliestSlot: "Tomorrow, 6:45 am",
    openToday: "6:45 am – 8:30 pm",
    hours: HOURS_STANDARD,
    tests: [
      price("cbc", "CBC with ESR", 340, 12),
      price("hba1c", "HbA1c", 470),
      price("vitamin-d", "Vitamin D Total", 1050),
      price("thyroid-profile", "Comprehensive Thyroid Profile", 590),
      price("lipid-profile", "Lipid Profile", 610, 12),
      price("vitamin-b12", "Serum B12", 860),
      price("iron-studies", "Iron Panel", 1290),
    ],
    reviews: [
      {
        id: "r1",
        author: "Deepa S.",
        rating: 5,
        date: "3 weeks ago",
        body: "Their thyroid panel includes anti-TPO commentary. Very useful for my endocrinologist.",
      },
    ],
  },
  {
    id: "greenleaf-path",
    name: "Greenleaf Pathology",
    tagline: "Community lab with free home collection over ₹500",
    area: "Wakad",
    city: "Pune",
    addressLine: "Shop 9, Kaspate Wasti, Wakad",
    lat: 18.5985,
    lng: 73.7626,
    distanceKm: 14.3,
    rating: 4.3,
    reviewCount: 63,
    verified: true,
    accreditations: ["NABL M(EL)T"],
    facilities: ["Digital reports", "Parking", "Senior-citizen priority"],
    homeCollection: true,
    homeCollectionFee: 0,
    homeCollectionMinOrder: 500,
    earliestSlot: "Tomorrow, 7:30 am",
    openToday: "7:00 am – 8:00 pm",
    hours: HOURS_STANDARD,
    tests: [
      price("cbc", "CBC", 270, 12),
      price("hba1c", "HbA1c", 420),
      price("vitamin-d", "Vitamin D", 980),
      price("thyroid-profile", "Thyroid Profile", 480),
      price("lipid-profile", "Lipid Profile", 540, 12),
      price("lft", "LFT", 590),
      price("kft", "KFT", 560),
      price("urine-routine", "Urine Routine", 150, 8),
    ],
    reviews: [
      {
        id: "r1",
        author: "Ashwin G.",
        rating: 4,
        date: "1 month ago",
        body: "Good value bundle for the four tests my doctor asked for. Collection was punctual.",
      },
    ],
  },
  {
    id: "nova-health-lab",
    name: "Nova Health Laboratory",
    tagline: "Corporate wellness and preventive health panels",
    area: "Magarpatta",
    city: "Pune",
    addressLine: "Tower 3, Cybercity, Magarpatta City",
    lat: 18.5158,
    lng: 73.9296,
    distanceKm: 13.1,
    rating: 4.4,
    reviewCount: 152,
    verified: true,
    accreditations: ["NABL M(EL)T", "ISO 9001"],
    facilities: ["In-house pathology", "Digital reports", "Cafeteria", "Parking"],
    homeCollection: true,
    homeCollectionFee: 80,
    homeCollectionMinOrder: 700,
    earliestSlot: "Today, 5:15 pm",
    openToday: "7:00 am – 9:00 pm",
    hours: HOURS_STANDARD,
    tests: [
      price("cbc", "CBC", 300, 10),
      price("hba1c", "HbA1c", 460),
      price("vitamin-d", "Vitamin D (25-OH)", 1150),
      price("thyroid-profile", "Thyroid Profile", 530),
      price("lipid-profile", "Lipid Profile", 580, 10),
      price("lft", "Liver Panel", 640),
      price("kft", "Kidney Panel", 620),
      price("vitamin-b12", "Vitamin B12", 900),
      price("iron-studies", "Iron Studies", 1320),
    ],
    reviews: [
      {
        id: "r1",
        author: "Meera A.",
        rating: 4,
        date: "2 weeks ago",
        body: "Booked a preventive panel through my employer. Slot management on the app was smooth.",
      },
    ],
  },
];

export function getLabById(id: string): Lab | undefined {
  return LABS.find((lab) => lab.id === id);
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
