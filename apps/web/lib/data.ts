/**
 * CalibraGraph domain model + seed dataset.
 *
 * All values are plausible and internally consistent. Monetary quantities are
 * absent by design; this is a laboratory information system sample dataset.
 */

export type StatusBadgeTone = "current" | "pending" | "critical" | "info" | "neutral";

export type CertificateStatus =
  | "current" // issued, valid, on-chain anchor intact
  | "imported" // ingested via XML, not yet re-issued
  | "superseded" // replaced by a newer revision
  | "revoked" // formally invalid
  | "expired" // validity period has passed
  | "pending" // awaiting issue/authorisation
  | "draft";

export interface LaboratoryScopeRow {
  field: string;
  range: string;
  cmc: string;
}

export interface LaboratoryPersonnel {
  name: string;
  role: string;
  staffId: string;
  signature: string;
  authorizedSince: string;
}

export interface Laboratory {
  id: string;
  code: string;
  name: string;
  location: string;
  country: string;
  accreditation: {
    scheme: string;
    number: string;
    endorsement: string;
    validUntil: string;
  };
  scope: LaboratoryScopeRow[];
  personnel: LaboratoryPersonnel[];
  certificateCount: number;
  listedSince: string;
}

export interface ReferenceStandard {
  id: string;
  designation: string;
  type: string;
  range: string;
  unit: string;
  manufacturer: string;
  serial: string;
  lastCalibrationDate: string;
  lastDueDate: string;
  lastCertificate: string;
  uncertainty: string;
  laboratory: string;
  traceableTo: {
    institute: string;
    nationalStandard: string;
  };
  status: "current" | "due-soon" | "expired";
}

export interface Measurement {
  point: string;
  reference: string;
  indicated: string;
  error: string;
  uncertainty: string;
  unit: string;
}

export interface Certificate {
  id: string;
  number: string;
  revision: string;
  status: CertificateStatus;
  instrumentId: string;
  laboratoryId: string;
  issuer: string;
  responsiblePerson: string;
  calibrationDate: string;
  issueDate: string;
  dueDate: string;
  procedure: string;
  standards: string[];
  measurand: string;
  uncertaintyStatement: {
    expanded: string;
    coverageFactor: string;
    coverage: string;
    distribution: string;
  };
  measurements: Measurement[];
  conditions: { temperature: string; humidity: string; pressure?: string };
  comments: string[];
  digest: {
    algorithm: string;
    certificate: string;
    document: string;
  };
  onchain?: {
    network: string;
    chainId: string;
    block: string;
    tx: string;
    anchoredAt: string;
    status: string;
  };
  supersedes?: string;
  supersededBy?: string;
}

export interface Instrument {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serial: string;
  serialMasked: string;
  func: string;
  rangeMin: string;
  rangeMax: string;
  unit: string;
  resolution: string;
  location: string;
  owner: string;
  assetRef: string;
  status: "in-use" | "in-store" | "maintenance";
  registeredOn: string;
  nextDue: string;
  currentCertificate: string | null;
}

export interface TraceNode {
  id: string;
  kind: "instrument" | "certificate" | "standard" | "reference-lab" | "issuing-lab";
  title: string;
  subtitle?: string;
  meta: { label: string; value: string }[];
  status?: { label: string; tone: StatusBadgeTone };
}

export interface TraceEdge {
  from: string;
  to: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/* Laboratories                                                        */
/* ------------------------------------------------------------------ */

export const laboratories: Laboratory[] = [
  {
    id: "LAB-RML-2001",
    code: "RML-2001",
    name: "Rhein Metrology Laboratory",
    location: "Düsseldorf, NRW",
    country: "Germany",
    accreditation: {
      scheme: "ISO/IEC 17025:2017",
      number: "A-11847",
      endorsement: "ILAC MRA — Accred. No. A-11847 (simulated)",
      validUntil: "2028-02-28",
    },
    scope: [
      {
        field: "DC/LF voltage",
        range: "10 µV – 1 kV",
        cmc: "4.2 µV/V",
      },
      {
        field: "DC resistance",
        range: "1 Ω – 100 kΩ",
        cmc: "3.8 µΩ/Ω",
      },
      {
        field: "Mass (weights)",
        range: "1 mg – 5 kg",
        cmc: "8 µg (1 kg)",
      },
    ],
    personnel: [
      {
        name: "Dr. Anja Hofmann",
        role: "Head of Metrology / Authorised Signer",
        staffId: "RML-S-0211",
        signature: "RSA-2048 · SHA-256",
        authorizedSince: "2022-06-01",
      },
      {
        name: "Stefan Klein",
        role: "Technical Signatory — Electrical DC/LF",
        staffId: "RML-S-0288",
        signature: "ECDSA P-256",
        authorizedSince: "2023-03-15",
      },
      {
        name: "Petra Lindt",
        role: "Quality Manager",
        staffId: "RML-S-0193",
        signature: "ECDSA P-256",
        authorizedSince: "2021-11-09",
      },
    ],
    certificateCount: 24,
    listedSince: "2024-04-02",
  },
  {
    id: "LAB-EKZ-2214",
    code: "EKZ-2214",
    name: "Emscher Kalibrierzentrum",
    location: "Essen, NRW",
    country: "Germany",
    accreditation: {
      scheme: "ISO/IEC 17025:2017",
      number: "A-22106",
      endorsement: "ILAC MRA — Accred. No. A-22106 (simulated)",
      validUntil: "2027-09-30",
    },
    scope: [
      {
        field: "Pressure (gauge)",
        range: "0 mbar – 25 bar",
        cmc: "14 Pa (1 bar)",
      },
      {
        field: "Temperature (contact)",
        range: "-25 °C – 350 °C",
        cmc: "0.02 °C",
      },
      {
        field: "Relative humidity",
        range: "10 %RH – 98 %RH",
        cmc: "0.4 %RH",
      },
    ],
    personnel: [
      {
        name: "Marcus Ferrand",
        role: "Technical Signatory — Pressure / Humidity",
        staffId: "EKZ-S-0462",
        signature: "ECDSA P-256",
        authorizedSince: "2023-08-20",
      },
      {
        name: "Ilona Beck",
        role: "Head of Laboratory",
        staffId: "EKZ-S-0311",
        signature: "RSA-2048 · SHA-256",
        authorizedSince: "2022-01-12",
      },
    ],
    certificateCount: 14,
    listedSince: "2024-09-19",
  },
];

export function laboratoryById(id: string): Laboratory | undefined {
  return laboratories.find((l) => l.id === id);
}

/* ------------------------------------------------------------------ */
/* Reference standards                                                 */
/* ------------------------------------------------------------------ */

export const referenceStandards: ReferenceStandard[] = [
  {
    id: "REF-0151",
    designation: "RML Ref RM-0151",
    type: "10 V DC voltage standard (reference)",
    range: "10 V DC fixed",
    unit: "V",
    manufacturer: "Fluke",
    serial: "7125-1184",
    lastCalibrationDate: "2025-10-02",
    lastDueDate: "2027-10-01",
    lastCertificate: "DCC-PTB-2025-1104",
    uncertainty: "1.2 µV/V (k = 2)",
    laboratory: "LAB-RML-2001",
    traceableTo: {
      institute: "Physikalisch-Technische Bundesanstalt (PTB), Braunschweig",
      nationalStandard: "Josephson array voltage standard, DC voltage",
    },
    status: "current",
  },
  {
    id: "REF-0412",
    designation: "EKZ Ref PB-0412",
    type: "Deadweight piston gauge (pressure reference)",
    range: "0 bar – 25 bar",
    unit: "bar",
    manufacturer: "Desgranges et Huot",
    serial: "DHP-2019-0071",
    lastCalibrationDate: "2025-04-17",
    lastDueDate: "2027-04-16",
    lastCertificate: "DCC-PTB-2025-0742",
    uncertainty: "6.5 Pa (k = 2, at 10 bar)",
    laboratory: "LAB-EKZ-2214",
    traceableTo: {
      institute: "Physikalisch-Technische Bundesanstalt (PTB), Braunschweig",
      nationalStandard: "Primary piston-cylinder pressure standard",
    },
    status: "current",
  },
  {
    id: "REF-0221",
    designation: "RML Ref MM-0221",
    type: "1 kg mass standard set (OIML class E₂)",
    range: "1 mg – 2 kg",
    unit: "g",
    manufacturer: "Häfner Gewichte",
    serial: "HG-0221-E2",
    lastCalibrationDate: "2024-11-28",
    lastDueDate: "2026-11-27",
    lastCertificate: "DCC-METAS-2024-0388",
    uncertainty: "24 µg (2 kg, k = 2)",
    laboratory: "LAB-RML-2001",
    traceableTo: {
      institute: "METAS, Wabern",
      nationalStandard: "Primary mass standard of Switzerland",
    },
    status: "due-soon",
  },
  {
    id: "REF-0088",
    designation: "RML Ref RC-0088",
    type: "10 kΩ resistance standard",
    range: "10 kΩ fixed",
    unit: "Ω",
    manufacturer: "Vishay Precision Group",
    serial: "VPG-0088-K10",
    lastCalibrationDate: "2025-01-22",
    lastDueDate: "2027-01-21",
    lastCertificate: "DCC-RML-2025-0021",
    uncertainty: "0.42 µΩ/Ω (k = 2)",
    laboratory: "LAB-RML-2001",
    traceableTo: {
      institute: "Physikalisch-Technische Bundesanstalt (PTB), Braunschweig",
      nationalStandard: "Quantum Hall resistance standard",
    },
    status: "current",
  },
];

export function standardById(id: string): ReferenceStandard | undefined {
  return referenceStandards.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ */
/* Instruments                                                         */
/* ------------------------------------------------------------------ */

export const instruments: Instrument[] = [
  {
    id: "INS-0101",
    name: "Digital multimeter Fluke 8846A",
    category: "Electrical",
    manufacturer: "Fluke",
    model: "8846A",
    serial: "2451A7821",
    serialMasked: "2451***21",
    func: "DC voltage / AC voltage",
    rangeMin: "-1000",
    rangeMax: "1000",
    unit: "V",
    resolution: "1 µV (100 mV range)",
    location: "Bay 3 — Bench L2",
    owner: "J. Weber — Production QC",
    assetRef: "AST-03-4412",
    status: "in-use",
    registeredOn: "2024-01-18",
    nextDue: "2027-03-11",
    currentCertificate: "DCC-RML-2026-0417",
  },
  {
    id: "INS-0102",
    name: "Digital pressure gauge WIKA CPG1200",
    category: "Pressure",
    manufacturer: "WIKA",
    model: "CPG1200",
    serial: "4552-1187",
    serialMasked: "4552-***7",
    func: "Gauge pressure",
    rangeMin: "0",
    rangeMax: "10",
    unit: "bar",
    resolution: "0.001 bar",
    location: "Line 1 — Manifold test point",
    owner: "M. Ferrand — Process Systems",
    assetRef: "AST-01-1077",
    status: "in-use",
    registeredOn: "2023-07-05",
    nextDue: "2026-11-18",
    currentCertificate: "DCC-EKZ-2025-0477",
  },
  {
    id: "INS-0103",
    name: "Analytical balance Mettler Toledo XS205",
    category: "Mass",
    manufacturer: "Mettler Toledo",
    model: "XS205",
    serial: "1224-0455",
    serialMasked: "1***-0455",
    func: "Mass (difference weighing)",
    rangeMin: "0",
    rangeMax: "220",
    unit: "g",
    resolution: "0.01 mg (82 g range)",
    location: "Bay 2 — Mass room",
    owner: "R. Adamski — Materials Lab",
    assetRef: "AST-02-2311",
    status: "in-use",
    registeredOn: "2023-10-30",
    nextDue: "2026-10-30",
    currentCertificate: "DCC-RML-2025-0714",
  },
  {
    id: "INS-0104",
    name: "Digital multimeter Keysight 34461A",
    category: "Electrical",
    manufacturer: "Keysight",
    model: "34461A",
    serial: "MY57-01432",
    serialMasked: "MY57-***32",
    func: "DC voltage / AC voltage",
    rangeMin: "-1000",
    rangeMax: "1000",
    unit: "V",
    resolution: "0.1 µV (100 mV range)",
    location: "Bay 3 — Bench L5",
    owner: "L. Odum — R&D Instrumentation",
    assetRef: "AST-03-4519",
    status: "in-use",
    registeredOn: "2024-05-22",
    nextDue: "2026-12-31",
    currentCertificate: "DCC-RML-2026-0355",
  },
  {
    id: "INS-0105",
    name: "Analog pressure gauge Ashcroft 1293",
    category: "Pressure",
    manufacturer: "Ashcroft",
    model: "1293",
    serial: "A9-55213",
    serialMasked: "A9-***13",
    func: "Gauge pressure",
    rangeMin: "0",
    rangeMax: "10",
    unit: "bar",
    resolution: "0.2 bar (scale division)",
    location: "Store — Shelf B14",
    owner: "Warehouse — Maintenance pool",
    assetRef: "AST-01-0846",
    status: "in-store",
    registeredOn: "2022-11-14",
    nextDue: "—",
    currentCertificate: null,
  },
  {
    id: "INS-0106",
    name: "Thermo-hygrometer Testo 445",
    category: "Humidity",
    manufacturer: "Testo",
    model: "445",
    serial: "0992-33540",
    serialMasked: "0992-***40",
    func: "Relative humidity / temperature",
    rangeMin: "0",
    rangeMax: "100",
    unit: "%RH",
    resolution: "0.1 %RH",
    location: "Bay 2 — Climate zone",
    owner: "R. Adamski — Materials Lab",
    assetRef: "AST-02-2317",
    status: "in-use",
    registeredOn: "2025-02-03",
    nextDue: "2027-01-20",
    currentCertificate: "DCC-EKZ-2026-0402",
  },
  {
    id: "INS-0111",
    name: "Bench power supply Tenma 72-2575",
    category: "Electrical",
    manufacturer: "Tenma",
    model: "72-2575",
    serial: "T09-77231",
    serialMasked: "T09-***31",
    func: "DC voltage / DC current output",
    rangeMin: "0",
    rangeMax: "30",
    unit: "V",
    resolution: "0.01 V",
    location: "Bay 4 — Bench P1",
    owner: "L. Odum — R&D Instrumentation",
    assetRef: "AST-04-1102",
    status: "in-use",
    registeredOn: "2024-08-12",
    nextDue: "2026-12-01",
    currentCertificate: "DCC-RML-2025-0903",
  },
  {
    id: "INS-0119",
    name: "Digital caliper Mitutoyo 500-197",
    category: "Length",
    manufacturer: "Mitutoyo",
    model: "500-197",
    serial: "19-24680",
    serialMasked: "19-***80",
    func: "Length (external / internal / depth)",
    rangeMin: "0",
    rangeMax: "150",
    unit: "mm",
    resolution: "0.01 mm",
    location: "Bay 1 — QC station B",
    owner: "J. Weber — Production QC",
    assetRef: "AST-01-4409",
    status: "in-use",
    registeredOn: "2023-05-27",
    nextDue: "2026-12-04",
    currentCertificate: "DCC-RML-2025-1018",
  },
  {
    id: "INS-0126",
    name: "Oven controller Jumo dTRON",
    category: "Temperature",
    manufacturer: "Jumo",
    model: "dTRON",
    serial: "DTR-88410",
    serialMasked: "DTR-***10",
    func: "Temperature indication / control",
    rangeMin: "0",
    rangeMax: "300",
    unit: "°C",
    resolution: "0.1 °C",
    location: "Facilities — Climate room B",
    owner: "Facilities — Climate B",
    assetRef: "AST-06-2008",
    status: "in-use",
    registeredOn: "2025-01-09",
    nextDue: "2027-01-02",
    currentCertificate: "DCC-EKZ-2026-0102",
  },
  {
    id: "INS-0133",
    name: "Oscilloscope Tektronix MDO3102",
    category: "Electrical",
    manufacturer: "Tektronix",
    model: "MDO3102",
    serial: "C102-87651",
    serialMasked: "C102-***51",
    func: "Timebase / amplitude (vertical + horizontal)",
    rangeMin: "-300",
    rangeMax: "300",
    unit: "V",
    resolution: "1 mV/div",
    location: "Bay 4 — Bench P4",
    owner: "QA Office B",
    assetRef: "AST-04-1213",
    status: "in-use",
    registeredOn: "2025-04-14",
    nextDue: "2027-01-29",
    currentCertificate: "DCC-EKZ-2026-0166",
  },
];

export function instrumentById(id: string): Instrument | undefined {
  return instruments.find((i) => i.id === id);
}

/* ------------------------------------------------------------------ */
/* Certificates                                                        */
/* ------------------------------------------------------------------ */

export const certificates: Certificate[] = [
  {
    id: "CERT-0417",
    number: "DCC-RML-2026-0417",
    revision: "1",
    status: "current",
    instrumentId: "INS-0101",
    laboratoryId: "LAB-RML-2001",
    issuer: "Dr. Anja Hofmann",
    responsiblePerson: "Stefan Klein (RML-S-0288, Technical Signatory)",
    calibrationDate: "2026-03-12",
    issueDate: "2026-03-16",
    dueDate: "2027-03-11",
    procedure: "RML-V-DC-2201 — DC voltage calibration of digital multimeters",
    standards: ["ISO/IEC 17025:2017", "DCC v3.3.0 (PTB), XSD schema"],
    measurand: "DC voltage, 5 measurement points on primary ranges",
    uncertaintyStatement: {
      expanded: "11.5 µV/V",
      coverageFactor: "k = 2",
      coverage: "approximately 95 %",
      distribution: "normal (bilinear evaluation reported in Annex A)",
    },
    measurements: [
      {
        point: "100 mV",
        reference: "100.00000",
        indicated: "100.00021",
        error: "+0.21",
        uncertainty: "1.15",
        unit: "mV / µV",
      },
      {
        point: "1 V",
        reference: "1.000000",
        indicated: "1.000013",
        error: "+13.0",
        uncertainty: "1.60",
        unit: "V / µV",
      },
      {
        point: "10 V",
        reference: "10.000000",
        indicated: "10.000047",
        error: "+47.0",
        uncertainty: "4.10",
        unit: "V / µV",
      },
      {
        point: "100 V",
        reference: "100.0000",
        indicated: "99.999620",
        error: "-380",
        uncertainty: "29.0",
        unit: "V / µV",
      },
      {
        point: "1 kV",
        reference: "1000.000",
        indicated: "1000.0008",
        error: "+800",
        uncertainty: "260",
        unit: "V / µV",
      },
    ],
    conditions: {
      temperature: "23.1 °C",
      humidity: "41 %RH",
      pressure: "1004 hPa",
    },
    comments: [
      "Instrument warmed up for 4 h prior to measurement sequence; zero check performed after each range change.",
      "Linearity estimated per ILAC-G4 — see procedure RML-V-DC-2201 section 7 for the evaluation model.",
    ],
    digest: {
      algorithm: "SHA-256",
      certificate:
        "4b1d8f30a57e62c94e0f1d8b7a63c5f20d94e8b16a73f52c40e81d69b3f7a25c",
      document:
        "e2c9417a8f560db3b1d74e9c62a8f30d5b7e4c1f98a02d6c7e3b81f54a90d6b7",
    },
    onchain: {
      network: "BOT Chain Testnet",
      chainId: "968",
      block: "3804151",
      tx: "0x8813f02a67c45d09e1b8c7f34a92d60b5e74f1c8a30d29b6e4c75f10d8a3b692",
      anchoredAt: "2026-03-16 14:22 UTC",
      status: "Record matches digest",
    },
  },
  {
    id: "CERT-0583A",
    number: "DCC-RML-2025-0583",
    revision: "1",
    status: "superseded",
    instrumentId: "INS-0101",
    laboratoryId: "LAB-RML-2001",
    issuer: "Dr. Anja Hofmann",
    responsiblePerson: "Stefan Klein (RML-S-0288, Technical Signatory)",
    calibrationDate: "2025-03-13",
    issueDate: "2025-03-17",
    dueDate: "2026-03-12",
    procedure: "RML-V-DC-2201 — DC voltage calibration of digital multimeters",
    standards: ["ISO/IEC 17025:2017"],
    measurand: "DC voltage, 5 measurement points on primary ranges",
    uncertaintyStatement: {
      expanded: "12.1 µV/V",
      coverageFactor: "k = 2",
      coverage: "approximately 95 %",
      distribution: "normal",
    },
    measurements: [
      {
        point: "10 V",
        reference: "10.000000",
        indicated: "10.000052",
        error: "+52.0",
        uncertainty: "4.30",
        unit: "V / µV",
      },
      {
        point: "100 V",
        reference: "100.0000",
        indicated: "99.999555",
        error: "-445",
        uncertainty: "31.0",
        unit: "V / µV",
      },
    ],
    conditions: {
      temperature: "23.3 °C",
      humidity: "40 %RH",
    },
    comments: [
      "Asset drifted slightly below the 2025 error observation; tightening interval not required.",
    ],
    digest: {
      algorithm: "SHA-256",
      certificate:
        "b7e30a52c89d16f4d2e07b3a96c5f148e0d62a73b94f52c8d1e30b6a7f4c92d05",
      document:
        "61ad7c30f2548e91b6c02d8a7f4319e5b06c3d8a42f97e1d50c6b3a84f1e027b",
    },
    onchain: {
      network: "BOT Chain Testnet",
      chainId: "968",
      block: "3762910",
      tx: "0x4d7a91b0c8e23f5610d4b7a98f3c60e512b8d7c49af0e63b25d18c74e9f0a2b6",
      anchoredAt: "2025-03-17 09:11 UTC",
      status: "Record matches digest",
    },
    supersededBy: "DCC-RML-2026-0417",
  },
  {
    id: "CERT-EKZ-0477",
    number: "DCC-EKZ-2025-0477",
    revision: "2",
    status: "current",
    instrumentId: "INS-0102",
    laboratoryId: "LAB-EKZ-2214",
    issuer: "Ilona Beck",
    responsiblePerson: "Marcus Ferrand (EKZ-S-0462, Technical Signatory)",
    calibrationDate: "2025-11-17",
    issueDate: "2025-11-21",
    dueDate: "2026-11-18",
    procedure: "EKZ-P-1104 — Gauge pressure, digital indicators",
    standards: ["ISO/IEC 17025:2017"],
    measurand: "Gauge pressure, 6 points on 0 – 10 bar",
    uncertaintyStatement: {
      expanded: "19 Pa",
      coverageFactor: "k = 2",
      coverage: "approximately 95 %",
      distribution: "normal",
    },
    measurements: [
      {
        point: "0.0000 bar",
        reference: "0.00000",
        indicated: "0.00004",
        error: "+0.00004",
        uncertainty: "0.00009",
        unit: "bar",
      },
      {
        point: "2.0000 bar",
        reference: "2.00000",
        indicated: "2.00031",
        error: "+0.00031",
        uncertainty: "0.00011",
        unit: "bar",
      },
      {
        point: "4.0000 bar",
        reference: "4.00000",
        indicated: "4.00052",
        error: "+0.00052",
        uncertainty: "0.00012",
        unit: "bar",
      },
      {
        point: "6.0000 bar",
        reference: "6.00000",
        indicated: "6.00068",
        error: "+0.00068",
        uncertainty: "0.00013",
        unit: "bar",
      },
      {
        point: "8.0000 bar",
        reference: "8.00000",
        indicated: "8.00079",
        error: "+0.00079",
        uncertainty: "0.00015",
        unit: "bar",
      },
      {
        point: "10.0000 bar",
        reference: "10.00000",
        indicated: "10.00094",
        error: "+0.00094",
        uncertainty: "0.00019",
        unit: "bar",
      },
    ],
    conditions: {
      temperature: "22.8 °C",
      humidity: "38 %RH",
    },
    comments: [
      "Reference PB-0412 evacuated check performed before sequence; hysteresis within limit.",
      "Revision 2 corrects an operator-entry typo in the indicated value at 10 bar only; all measurement data are unchanged.",
    ],
    digest: {
      algorithm: "SHA-256",
      certificate:
        "f19b46c2a057d38e81b4c96a2d70f5318e0b6a4c93d21f75e8a04cb9d1f63025",
      document:
        "77c25d01e89a4b3f2d06a7c98b154e0d93b62f1a8c47e03b5d29a6f04e17b3c8",
    },
    onchain: {
      network: "BOT Chain Testnet",
      chainId: "968",
      block: "3810244",
      tx: "0xf19b46c2a057d38e81b4c96a2d70f5318e0b6a4c93d21f75e8a04cb9d1f63025",
      anchoredAt: "2025-11-21 16:05 UTC",
      status: "Record matches digest",
    },
  },
  {
    id: "CERT-0714",
    number: "DCC-RML-2025-0714",
    revision: "1",
    status: "expired",
    instrumentId: "INS-0103",
    laboratoryId: "LAB-RML-2001",
    issuer: "Dr. Anja Hofmann",
    responsiblePerson: "Petra Lindt (RML-S-0193, Quality Manager)",
    calibrationDate: "2025-10-09",
    issueDate: "2025-10-13",
    dueDate: "2026-10-30",
    procedure: "RML-M-0771 — Mass comparison, analytical balances",
    standards: ["ISO/IEC 17025:2017"],
    measurand: "Difference weighing, 4 load combinations",
    uncertaintyStatement: {
      expanded: "31 µg (82 g range)",
      coverageFactor: "k = 2",
      coverage: "approximately 95 %",
      distribution: "normal",
    },
    measurements: [
      {
        point: "50 g",
        reference: "50.000007",
        indicated: "50.000029",
        error: "+22",
        uncertainty: "25",
        unit: "g / µg",
      },
      {
        point: "80 g",
        reference: "80.000011",
        indicated: "80.000040",
        error: "+29",
        uncertainty: "31",
        unit: "g / µg",
      },
    ],
    conditions: { temperature: "22.4 °C", humidity: "45 %RH" },
    comments: ["Certificate validity has elapsed. Instrument is overdue for recalibration."],
    digest: {
      algorithm: "SHA-256",
      certificate:
        "a03e917b56c8f40d2b7619e4c05a83f7d62b34e91c80a57d4f16b203e97c5d18",
      document:
        "9b42f0d6a813e57c40f2b6d89a1730e5c84f6b02d93e17a45c68f0b3d27e54a1",
    },
  },
  {
    id: "CERT-0355",
    number: "DCC-RML-2026-0355",
    revision: "1",
    status: "current",
    instrumentId: "INS-0104",
    laboratoryId: "LAB-RML-2001",
    issuer: "Dr. Anja Hofmann",
    responsiblePerson: "Stefan Klein (RML-S-0288, Technical Signatory)",
    calibrationDate: "2025-12-16",
    issueDate: "2025-12-19",
    dueDate: "2026-12-31",
    procedure: "RML-V-DC-2201 — DC voltage calibration of digital multimeters",
    standards: ["ISO/IEC 17025:2017"],
    measurand: "DC voltage, 4 measurement points on primary ranges",
    uncertaintyStatement: {
      expanded: "9.8 µV/V",
      coverageFactor: "k = 2",
      coverage: "approximately 95 %",
      distribution: "normal",
    },
    measurements: [
      {
        point: "1 V",
        reference: "1.000000",
        indicated: "1.000006",
        error: "+6.0",
        uncertainty: "0.98",
        unit: "V / µV",
      },
      {
        point: "10 V",
        reference: "10.000000",
        indicated: "10.000031",
        error: "+31.0",
        uncertainty: "2.90",
        unit: "V / µV",
      },
    ],
    conditions: { temperature: "23.0 °C", humidity: "42 %RH" },
    comments: [],
    digest: {
      algorithm: "SHA-256",
      certificate:
        "d84a02f6b93e17c4a8d2f56b3e079104c26f8b7e40d91a63f52b804d97c6e31a",
      document:
        "51c8f3a02e7b64d9a1f0c687b34e29d5a6f13e08c47b9d2f60a3b15e78f0d29c",
    },
    onchain: {
      network: "BOT Chain Testnet",
      chainId: "968",
      block: "3791880",
      tx: "0x66a2d84c10f793b5e8d0a24f6319c0e75b43d8a91f202b6c74e5a30d9f10c6b8",
      anchoredAt: "2025-12-19 11:40 UTC",
      status: "Record matches digest",
    },
  },
  {
    id: "CERT-0402",
    number: "DCC-EKZ-2026-0402",
    revision: "1",
    status: "current",
    instrumentId: "INS-0106",
    laboratoryId: "LAB-EKZ-2214",
    issuer: "Ilona Beck",
    responsiblePerson: "Marcus Ferrand (EKZ-S-0462, Technical Signatory)",
    calibrationDate: "2026-01-19",
    issueDate: "2026-01-23",
    dueDate: "2027-01-20",
    procedure: "EKZ-T-2202 — Relative humidity instruments, climate chamber",
    standards: ["ISO/IEC 17025:2017"],
    measurand: "Relative humidity, 5 climate points",
    uncertaintyStatement: {
      expanded: "0.55 %RH",
      coverageFactor: "k = 2",
      coverage: "approximately 95 %",
      distribution: "normal",
    },
    measurements: [
      {
        point: "30.0 %RH",
        reference: "30.02",
        indicated: "30.1",
        error: "+0.08",
        uncertainty: "0.45",
        unit: "%RH",
      },
      {
        point: "50.0 %RH",
        reference: "50.11",
        indicated: "50.2",
        error: "+0.09",
        uncertainty: "0.50",
        unit: "%RH",
      },
      {
        point: "70.0 %RH",
        reference: "70.08",
        indicated: "70.0",
        error: "-0.08",
        uncertainty: "0.55",
        unit: "%RH",
      },
    ],
    conditions: { temperature: "23.2 °C", humidity: "conditioned" },
    comments: [],
    digest: {
      algorithm: "SHA-256",
      certificate:
        "18c40a73e2f96d15b83f50a2c64e9170d2f38b44a6f12e07b58c309d4a1f672b",
      document:
        "e07b34c1a962f5d8024b7e3a51c8d9f46b0a12d5e37f8024c96a3b15e78f04d2",
    },
  },
  {
    id: "CERT-EKZ-0983",
    number: "DCC-EKZ-2024-0983",
    revision: "1",
    status: "expired",
    instrumentId: "INS-0105",
    laboratoryId: "LAB-EKZ-2214",
    issuer: "Ilona Beck",
    responsiblePerson: "Marcus Ferrand (EKZ-S-0462, Technical Signatory)",
    calibrationDate: "2024-05-02",
    issueDate: "2024-05-06",
    dueDate: "2026-05-01",
    procedure: "EKZ-P-1101 — Gauge pressure, analog indicators",
    standards: ["ISO/IEC 17025:2017"],
    measurand: "Gauge pressure, 5 points on 0 – 10 bar",
    uncertaintyStatement: {
      expanded: "6.4 Pa",
      coverageFactor: "k = 2",
      coverage: "approximately 95 %",
      distribution: "normal",
    },
    measurements: [
      {
        point: "5.0 bar",
        reference: "5.0000",
        indicated: "5.02",
        error: "+0.02",
        uncertainty: "0.00007",
        unit: "bar",
      },
      {
        point: "10.0 bar",
        reference: "10.0000",
        indicated: "10.05",
        error: "+0.05",
        uncertainty: "0.00009",
        unit: "bar",
      },
    ],
    conditions: { temperature: "22.6 °C", humidity: "39 %RH" },
    comments: [
      "Instrument withdrawn from service on 2026-05-08; stored as spare. No current calibration on record.",
    ],
    digest: {
      algorithm: "SHA-256",
      certificate:
        "c93e10a7b46f28d503a9b76c4e012f85b23d69a1e57f3024b68c70e9d4a1f320",
      document:
        "26d5b80e14c97a3f60b2e94d12a7005c83f46e1b29a7d340c58f0e26b73a1d49",
    },
  },
];

export function certificateNumberByInstrument(instrumentId: string): Certificate[] {
  return certificates.filter((c) => c.instrumentId === instrumentId);
}

export function certificateByNumber(number: string): Certificate | undefined {
  return certificates.find((c) => c.number === number);
}

/* ------------------------------------------------------------------ */
/* Traceability chain (graph data) — deterministic                     */
/* ------------------------------------------------------------------ */

export const flukeTraceNodes: TraceNode[] = [
  {
    id: "INS-0101",
    kind: "instrument",
    title: "Digital multimeter Fluke 8846A",
    subtitle: "S/N 2451A7821 · Asset AST-03-4412",
    meta: [
      { label: "Function", value: "DC / AC voltage" },
      { label: "Range", value: "±1000 V" },
      { label: "Location", value: "Bay 3 — Bench L2" },
    ],
    status: { label: "Current certificate on record", tone: "current" },
  },
  {
    id: "DCC-RML-2026-0417",
    kind: "certificate",
    title: "DCC-RML-2026-0417",
    subtitle: "Digital Calibration Certificate · rev 1",
    meta: [
      { label: "Calibrated", value: "2026-03-12" },
      { label: "Valid until", value: "2027-03-11" },
      { label: "Digest", value: "4b1d8f30…7a25c" },
    ],
    status: { label: "Issued · on-chain", tone: "current" },
  },
  {
    id: "REF-0151",
    kind: "standard",
    title: "RML Ref RM-0151",
    subtitle: "10 V DC voltage standard · Fluke, S/N 7125-1184",
    meta: [
      { label: "Last cal.", value: "2025-10-02" },
      { label: "Due", value: "2027-10-01" },
      { label: "Uncertainty", value: "1.2 µV/V (k = 2)" },
    ],
    status: { label: "In calibration", tone: "current" },
  },
  {
    id: "PTB",
    kind: "reference-lab",
    title: "Physikalisch-Technische Bundesanstalt (PTB)",
    subtitle: "National metrology institute · Braunschweig, Germany",
    meta: [
      { label: "Role", value: "Reference laboratory" },
      { label: "National standard", value: "Josephson array voltage standard" },
      { label: "Ref. cert.", value: "DCC-PTB-2025-1104" },
    ],
    status: { label: "NMI", tone: "info" },
  },
  {
    id: "LAB-RML-2001",
    kind: "issuing-lab",
    title: "Rhein Metrology Laboratory",
    subtitle: "RML-2001 · Düsseldorf, Germany",
    meta: [
      { label: "Accreditation", value: "ILAC MRA — A-11847 (simulated)" },
      { label: "Scheme", value: "ISO/IEC 17025:2017" },
      { label: "CMC (DC voltage)", value: "4.2 µV/V" },
    ],
    status: { label: "Accredited (evidence-based)", tone: "current" },
  },
];

export const flukeTraceEdges: TraceEdge[] = [
  { from: "INS-0101", to: "DCC-RML-2026-0417", label: "calibrated by" },
  { from: "DCC-RML-2026-0417", to: "REF-0151", label: "verified against" },
  { from: "REF-0151", to: "PTB", label: "traceable to" },
  { from: "PTB", to: "LAB-RML-2001", label: "operated by" },
];

/* ------------------------------------------------------------------ */
/* Reference standards traceability list (page /app/traceability)      */
/* ------------------------------------------------------------------ */

export const standardsChains: { standard: ReferenceStandard; nodes: TraceNode[]; edges: TraceEdge[] }[] =
  referenceStandards.map((std) => {
    const instituteShort = std.traceableTo.institute.replace(
      " (PTB), Braunschweig",
      ""
    );
    const nodes: TraceNode[] = [
      {
        id: std.id,
        kind: "standard",
        title: std.designation,
        subtitle: `${std.type} · S/N ${std.serial}`,
        meta: [
          { label: "Range", value: `${std.range} ${std.unit}` },
          { label: "Last cal.", value: std.lastCalibrationDate },
          { label: "Due", value: std.lastDueDate },
          { label: "Uncertainty", value: std.uncertainty },
        ],
        status: {
          label:
            std.status === "current"
              ? "In calibration"
              : std.status === "due-soon"
              ? "Due for recalibration"
              : "Overdue",
          tone: std.status === "current" ? "current" : "pending",
        },
      },
      {
        id: std.traceableTo.institute,
        kind: "reference-lab",
        title: instituteShort,
        subtitle: "National metrology institute",
        meta: [
          { label: "National standard", value: std.traceableTo.nationalStandard },
          { label: "Reference cert.", value: std.lastCertificate },
        ],
        status: { label: "NMI reference", tone: "info" },
      },
    ];
    const edges: TraceEdge[] = [
      { from: std.id, to: std.traceableTo.institute, label: "traceable to" },
    ];
    return { standard: std, nodes, edges };
  });

/* ------------------------------------------------------------------ */
/* Dashboard aggregates                                                */
/* ------------------------------------------------------------------ */

export const dashboardStats = {
  instruments: 42,
  currentCertificates: 38,
  dueIn30Days: 5,
  overdue: 2,
};

export type DueRow = {
  instrumentId: string;
  designation: string;
  category: string;
  bucket: "7" | "30" | "60" | "90" | "overdue" | "none";
  dueLabel: string;
  certificate: string | null;
  owner: string;
};

export const dueRows: DueRow[] = [
  {
    instrumentId: "INS-0103",
    designation: "Analytical balance Mettler Toledo XS205",
    category: "Mass",
    bucket: "overdue",
    dueLabel: "2026-10-30 · 7 days overdue",
    certificate: "DCC-RML-2025-0714",
    owner: "R. Adamski — Materials Lab",
  },
  {
    instrumentId: "INS-0102",
    designation: "Digital pressure gauge WIKA CPG1200",
    category: "Pressure",
    bucket: "30",
    dueLabel: "2026-11-18 · in 12 days",
    certificate: "DCC-EKZ-2025-0477",
    owner: "M. Ferrand — Process Systems",
  },
  {
    instrumentId: "INS-0111",
    designation: "Bench power supply Tenma 72-2575",
    category: "Electrical",
    bucket: "30",
    dueLabel: "2026-12-01 · in 25 days",
    certificate: "DCC-RML-2025-0903",
    owner: "L. Odum — R&D Instrumentation",
  },
  {
    instrumentId: "INS-0119",
    designation: "Digital caliper Mitutoyo 500-197",
    category: "Length",
    bucket: "30",
    dueLabel: "2026-12-04 · in 28 days",
    certificate: "DCC-RML-2025-1018",
    owner: "J. Weber — Production QC",
  },
  {
    instrumentId: "INS-0104",
    designation: "Digital multimeter Keysight 34461A",
    category: "Electrical",
    bucket: "60",
    dueLabel: "2026-12-31 · in 55 days",
    certificate: "DCC-RML-2026-0355",
    owner: "L. Odum — R&D Instrumentation",
  },
  {
    instrumentId: "INS-0126",
    designation: "Oven controller Jumo dTRON",
    category: "Temperature",
    bucket: "60",
    dueLabel: "2027-01-02 · in 57 days",
    certificate: "DCC-EKZ-2026-0102",
    owner: "Facilities — Climate B",
  },
  {
    instrumentId: "INS-0133",
    designation: "Oscilloscope Tektronix MDO3102",
    category: "Electronics",
    bucket: "90",
    dueLabel: "2027-01-29 · in 84 days",
    certificate: "DCC-EKZ-2026-0166",
    owner: "QA Office B",
  },
  {
    instrumentId: "INS-0105",
    designation: "Analog pressure gauge Ashcroft 1293",
    category: "Pressure",
    bucket: "none",
    dueLabel: "No current certificate",
    certificate: null,
    owner: "Warehouse — Maintenance pool",
  },
];
