export interface AngleGuide {
  id: string;
  label: string;
  hint: string;
  zone: "front" | "rear" | "driver" | "passenger" | "fl" | "fr" | "rl" | "rr" | "hood" | "wheels" | "glass" | "cabin";
}

export const STANDARD_ANGLES: AngleGuide[] = [
  {
    id: "front",
    label: "Front",
    hint: "Stand 8–10 ft dead-ahead. Get bumper, grille, headlights, and plate in frame.",
    zone: "front",
  },
  {
    id: "rear",
    label: "Rear",
    hint: "Stand behind the vehicle. Include bumper, tail lamps, and tailgate or trunk.",
    zone: "rear",
  },
  {
    id: "driver",
    label: "Driver side",
    hint: "Full driver-side profile. Include both doors, mirrors, and the rocker panel.",
    zone: "driver",
  },
  {
    id: "passenger",
    label: "Passenger side",
    hint: "Full passenger-side profile. Watch for door dings and cladding scrapes.",
    zone: "passenger",
  },
  {
    id: "front_left",
    label: "Front-left corner",
    hint: "45° on the driver-front corner. Capture fender, bumper corner, and wheel.",
    zone: "fl",
  },
  {
    id: "front_right",
    label: "Front-right corner",
    hint: "45° on the passenger-front corner. Capture fender, bumper corner, and wheel.",
    zone: "fr",
  },
  {
    id: "rear_left",
    label: "Rear-left corner",
    hint: "45° on the driver-rear quarter. Include bumper corner and lamp.",
    zone: "rl",
  },
  {
    id: "rear_right",
    label: "Rear-right corner",
    hint: "45° on the passenger-rear quarter. Include bumper corner and lamp.",
    zone: "rr",
  },
  {
    id: "roof_hood",
    label: "Roof / hood",
    hint: "Shoot down the hood and roof for hail, dings, and clear-coat burn-through.",
    zone: "hood",
  },
  {
    id: "wheels",
    label: "Wheels / tires",
    hint: "Close-up of the LF wheel or the worst corner: tread, sidewall, and rim rash.",
    zone: "wheels",
  },
  {
    id: "glass",
    label: "Windshield / glass",
    hint: "From the cowl: windshield chips and cracks. Add extras for other glass.",
    zone: "glass",
  },
  {
    id: "interior",
    label: "Interior overview",
    hint: "From the open driver door: dash, seats, wheel, and carpet in one shot.",
    zone: "cabin",
  },
];

export const EXTRA_HINT =
  "Close-up of a concern, undercarriage, trunk, headliner, or any angle the walkaround missed.";

export function isStandardAngle(angleId: string): boolean {
  return STANDARD_ANGLES.some((angle) => angle.id === angleId);
}
