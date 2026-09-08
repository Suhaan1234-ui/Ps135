// Extracted from ml/models/skill_gap_model.joblib (title_to_display), so this
// list always matches what the /api/skill-gap endpoint can actually resolve.
export const JOB_TITLES = [
  "Account Director", "Account Executive", "Account Manager", "Accountant",
  "Administrative Assistant", "Aerospace Engineer", "Architect", "Architectural Designer",
  "Art Director", "Art Teacher", "Back-End Developer", "Brand Ambassador", "Brand Manager",
  "Business Analyst", "Business Development Manager", "Chemical Analyst", "Chemical Engineer",
  "Civil Engineer", "Content Writer", "Copywriter", "Customer Service Manager",
  "Customer Service Representative", "Customer Success Manager", "Customer Support Specialist",
  "Data Analyst", "Data Engineer", "Data Entry Clerk", "Data Scientist",
  "Database Administrator", "Database Developer", "Dental Hygienist",
  "Digital Marketing Specialist", "Electrical Designer", "Electrical Engineer",
  "Email Marketing Specialist", "Environmental Consultant", "Environmental Engineer",
  "Event Coordinator", "Event Manager", "Event Planner", "Executive Assistant",
  "Family Lawyer", "Family Nurse Practitioner", "Finance Manager", "Financial Advisor",
  "Financial Analyst", "Financial Controller", "Financial Planner", "Front-End Developer",
  "Front-End Engineer", "Graphic Designer", "HR Coordinator", "HR Generalist", "HR Manager",
  "Human Resources Manager", "IT Administrator", "IT Manager", "IT Support Specialist",
  "Interior Designer", "Inventory Analyst", "Investment Advisor", "Investment Analyst",
  "Investment Banker", "Java Developer", "Key Account Manager", "Landscape Architect",
  "Landscape Designer", "Legal Advisor", "Legal Assistant", "Legal Counsel",
  "Legal Secretary", "Litigation Attorney", "Market Analyst", "Market Research Analyst",
  "Marketing Analyst", "Marketing Coordinator", "Marketing Director", "Marketing Manager",
  "Marketing Specialist", "Mechanical Designer", "Mechanical Engineer",
  "Network Administrator", "Network Analyst", "Network Engineer",
  "Network Security Specialist", "Network Technician", "Nurse Manager",
  "Nurse Practitioner", "Occupational Therapist", "Office Manager", "Operations Manager",
  "Paralegal", "Pediatrician", "Personal Assistant", "Pharmaceutical Sales Representative",
  "Physical Therapist", "Physician Assistant", "Process Engineer",
  "Procurement Coordinator", "Procurement Manager", "Procurement Specialist",
  "Product Designer", "Product Manager", "Project Coordinator", "Project Manager",
  "Psychologist", "Public Relations Specialist", "Purchasing Agent", "QA Analyst",
  "QA Engineer", "Quality Assurance Analyst", "Registered Nurse", "Research Analyst",
  "Research Scientist", "SEM Specialist", "SEO Analyst", "SEO Specialist",
  "Sales Associate", "Sales Consultant", "Sales Manager", "Sales Representative",
  "Social Media Coordinator", "Social Media Manager", "Social Worker",
  "Software Architect", "Software Developer", "Software Engineer", "Software Tester",
  "Speech Therapist", "Structural Engineer", "Substance Abuse Counselor",
  "Supply Chain Analyst", "Supply Chain Manager", "Systems Administrator",
  "Systems Analyst", "Systems Engineer", "Tax Consultant", "Teacher",
  "Technical Writer", "UI Developer", "UX Researcher", "UX/UI Designer",
  "Urban Planner", "Veterinarian", "Web Designer", "Web Developer", "Wedding Planner",
]

// A short seed list to make the skill chip-input feel populated on first use.
// The endpoint itself will fuzzy/semantically match anything typed, this is
// purely a UI convenience list.
export const COMMON_SKILLS = [
  "Communication Skills", "Data Analysis", "Excel", "Project Management",
  "Sales", "Customer Service", "Python", "SQL", "Time Management",
  "Accounting", "AutoCAD", "Adobe Creative Suite", "Leadership",
]
