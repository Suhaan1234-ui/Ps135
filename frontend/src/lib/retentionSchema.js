// Mirrors ml/models/retention_model.joblib's feature_columns exactly, in
// order. The backend rejects the request if any of these are missing, so
// the form below is built directly from this schema rather than guessed.

export const NUMERIC_FIELDS = [
  { key: 'Age', label: 'Age', min: 18, max: 65, step: 1, default: 32 },
  { key: 'Years at Company', label: 'Years at company', min: 0, max: 51, step: 1, default: 5 },
  { key: 'Monthly Income', label: 'Monthly income (₹)', min: 1000, max: 60000, step: 100, default: 12000 },
  { key: 'Number of Promotions', label: 'Number of promotions', min: 0, max: 6, step: 1, default: 0 },
  { key: 'Distance from Home', label: 'Distance from home (km)', min: 1, max: 100, step: 1, default: 12 },
  { key: 'Number of Dependents', label: 'Number of dependents', min: 0, max: 10, step: 1, default: 1 },
  { key: 'Company Tenure (In Months)', label: 'Company tenure (months)', min: 1, max: 130, step: 1, default: 24 },
]

export const CATEGORICAL_FIELDS = [
  { key: 'Gender', label: 'Gender', options: ['Female', 'Male'] },
  {
    key: 'Job Role', label: 'Job role',
    options: ['Education', 'Finance', 'Healthcare', 'Media', 'Technology'],
  },
  {
    key: 'Work-Life Balance', label: 'Work-life balance',
    options: ['Poor', 'Fair', 'Good', 'Excellent'],
  },
  {
    key: 'Job Satisfaction', label: 'Job satisfaction',
    options: ['Low', 'Medium', 'High', 'Very High'],
  },
  {
    key: 'Performance Rating', label: 'Performance rating',
    options: ['Below Average', 'Average', 'High', 'Low'],
  },
  { key: 'Overtime', label: 'Regularly works overtime', options: ['No', 'Yes'] },
  {
    key: 'Education Level', label: 'Education level',
    options: ['High School', 'Associate Degree', "Bachelor’s Degree", "Master’s Degree", 'PhD'],
  },
  { key: 'Marital Status', label: 'Marital status', options: ['Single', 'Married', 'Divorced'] },
  { key: 'Job Level', label: 'Job level', options: ['Entry', 'Mid', 'Senior'] },
  { key: 'Company Size', label: 'Company size', options: ['Small', 'Medium', 'Large'] },
  { key: 'Remote Work', label: 'Works remotely', options: ['No', 'Yes'] },
  { key: 'Leadership Opportunities', label: 'Leadership opportunities offered', options: ['No', 'Yes'] },
  { key: 'Innovation Opportunities', label: 'Innovation opportunities offered', options: ['No', 'Yes'] },
  {
    key: 'Company Reputation', label: 'Company reputation',
    options: ['Poor', 'Fair', 'Good', 'Excellent'],
  },
  {
    key: 'Employee Recognition', label: 'Employee recognition',
    options: ['Low', 'Medium', 'High', 'Very High'],
  },
]

export function defaultEmployeeData() {
  const data = {}
  NUMERIC_FIELDS.forEach((field) => {
    data[field.key] = field.default
  })
  CATEGORICAL_FIELDS.forEach((field) => {
    data[field.key] = field.options[0]
  })
  return data
}
