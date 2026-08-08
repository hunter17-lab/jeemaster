export interface Chapter {
  name: string;
  link: string;
}

export interface SubjectData {
  subject: string;
  color: "physics" | "chemistry" | "maths";
  sections: { title: string; chapters: Chapter[] }[];
}

const makeLink = (subject: string, chapter: string) =>
  `#${subject.toLowerCase()}-${chapter.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export const physicsData: SubjectData = {
  subject: "Physics",
  color: "physics",
  sections: [
    {
      title: "Class 11",
      chapters: [
        "Units & Dimensions", "Kinematics", "Laws of Motion", "Work, Energy & Power",
        "Rotational Motion", "Gravitation", "Properties of Matter", "Thermodynamics",
        "Oscillations", "Waves",
      ].map(c => ({ name: c, link: makeLink("physics", c) })),
    },
    {
      title: "Class 12",
      chapters: [
        "Electrostatics", "Current Electricity", "Magnetism", "EMI", "AC",
        "Optics", "Modern Physics",
      ].map(c => ({ name: c, link: makeLink("physics", c) })),
    },
  ],
};

export const chemistryData: SubjectData = {
  subject: "Chemistry",
  color: "chemistry",
  sections: [
    {
      title: "Physical Chemistry",
      chapters: [
        "Mole Concept", "Atomic Structure", "States of Matter", "Thermodynamics",
        "Equilibrium", "Electrochemistry", "Chemical Kinetics",
      ].map(c => ({ name: c, link: makeLink("chemistry", c) })),
    },
    {
      title: "Organic Chemistry",
      chapters: [
        "General Organic Chemistry", "Hydrocarbons", "Haloalkanes & Haloarenes",
        "Alcohols, Phenols, Ethers", "Aldehydes & Ketones", "Carboxylic Acids",
        "Amines", "Biomolecules", "Polymers",
      ].map(c => ({ name: c, link: makeLink("chemistry", c) })),
    },
    {
      title: "Inorganic Chemistry",
      chapters: [
        "Periodic Table", "Chemical Bonding", "s Block", "p Block",
        "d & f Block", "Coordination Compounds",
      ].map(c => ({ name: c, link: makeLink("chemistry", c) })),
    },
  ],
};

export const mathsData: SubjectData = {
  subject: "Mathematics",
  color: "maths",
  sections: [
    {
      title: "Class 11",
      chapters: [
        "Sets & Relations", "Trigonometry", "Quadratic Equations", "Sequence & Series",
        "Straight Lines", "Circles", "Conic Sections", "Limits",
      ].map(c => ({ name: c, link: makeLink("maths", c) })),
    },
    {
      title: "Class 12",
      chapters: [
        "Continuity & Differentiability", "Application of Derivatives", "Integrals",
        "Differential Equations", "Matrices & Determinants", "Vectors",
        "3D Geometry", "Probability",
      ].map(c => ({ name: c, link: makeLink("maths", c) })),
    },
  ],
};

export const allSubjects = [physicsData, chemistryData, mathsData];

export const pyqYears = {
  simple: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
  shiftWise: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
};

export const bookCategories = [
  { name: "Physics Books", icon: "⚡", link: "#physics-books" },
  { name: "Chemistry Books", icon: "🧪", link: "#chemistry-books" },
  { name: "Maths Books", icon: "📐", link: "#maths-books" },
  { name: "PCM Combined", icon: "📚", link: "#pcm-books" },
];

export const coachingMaterials = [
  {
    name: "Allen",
    items: [
      { type: "Modules", link: "https://t.me/+_-F7r5UIv6Q3YzA9" },
      { type: "DPP", link: "https://t.me/+_-F7r5UIv6Q3YzA9" },
      { type: "Tests", link: "https://t.me/+_-F7r5UIv6Q3YzA9" },
    ],
  },
  {
    name: "PW (Physics Wallah)",
    items: [
      { type: "Modules", link: "https://t.me/+_-F7r5UIv6Q3YzA9" },
      { type: "DPP", link: "https://t.me/+_-F7r5UIv6Q3YzA9" },
      { type: "Tests", link: "https://t.me/+_-F7r5UIv6Q3YzA9" },
    ],
  },
];
