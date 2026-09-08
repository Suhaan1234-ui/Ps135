// Extracted from ml/models/employment_model.joblib's grouped_summaries.
// The backend only accepts one of these filter keys at a time
// (see analyze_employment's field_map / "one grouping filter" check).

export const SCHEMES = ['PMKVY 2.0', 'PMKVY 3.0']
export const COMPONENTS = ['CSCM', 'CSSM']
export const TRAINING_TYPES = ['RPL', 'SP', 'STT']
export const STATES = [
  'Andaman And Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu And Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'The Dadra And Nagar Haveli And Daman And Diu', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal',
]

export const FILTER_GROUPS = [
  { key: 'scheme', label: 'Scheme', options: SCHEMES },
  { key: 'component', label: 'Component', options: COMPONENTS },
  { key: 'training_type', label: 'Training type', options: TRAINING_TYPES },
  { key: 'state', label: 'State / UT', options: STATES },
]

export const PIPELINE_STAGES = [
  { key: 'Enrolled', label: 'Enrolled' },
  { key: 'Trained', label: 'Trained' },
  { key: 'Assessed', label: 'Assessed' },
  { key: 'Certified', label: 'Certified' },
  { key: 'Reported Placed', label: 'Placed' },
]
