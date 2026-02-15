import styles from './AssessmentForm.module.css';
import { FORM_SELECT_OPTIONS } from '../constants/formOptions';

const STEP_GROUPS = [
  {
    title: 'Applicant',
    shortTitle: 'Profile',
    fields: ['age', 'personal_status', 'job', 'employment', 'num_dependents', 'housing'],
  },
  {
    title: 'History',
    shortTitle: 'Credit',
    fields: ['checking_status', 'credit_history', 'existing_credits', 'other_payment_plans', 'own_telephone', 'foreign_worker'],
  },
  {
    title: 'Financials',
    shortTitle: 'Loan',
    fields: ['purpose', 'credit_amount', 'duration', 'installment_commitment', 'savings_status', 'residence_since', 'other_parties', 'property_magnitude'],
  },
];

const FIELD_LABELS = {
  checking_status: 'Checking Status',
  duration: 'Duration (months)',
  credit_history: 'Credit History',
  purpose: 'Loan Purpose',
  credit_amount: 'Credit Amount',
  savings_status: 'Savings Status',
  employment: 'Employment Length',
  installment_commitment: 'Installment Commitment',
  personal_status: 'Personal Status',
  other_parties: 'Other Parties',
  residence_since: 'Residence Since',
  property_magnitude: 'Property Magnitude',
  age: 'Age',
  other_payment_plans: 'Other Payment Plans',
  housing: 'Housing',
  existing_credits: 'Existing Credits',
  job: 'Job',
  num_dependents: 'Dependents',
  own_telephone: 'Own Telephone',
  foreign_worker: 'Foreign Worker',
};

const NUMERIC_FIELDS = new Set([
  'duration',
  'credit_amount',
  'installment_commitment',
  'residence_since',
  'age',
  'existing_credits',
  'num_dependents',
]);

export default function AssessmentForm({ formData, updateField, currentStep, setCurrentStep, onAssess, loading }) {
  const currentGroup = STEP_GROUPS[currentStep];
  const isLastStep = currentStep === STEP_GROUPS.length - 1;

  const handleChange = (field, e) => {
    let val = e.target.value;
    if (NUMERIC_FIELDS.has(field)) {
      val = Number(val);
    }
    updateField(field, val);
  };

  const renderField = (field) => {
    const options = FORM_SELECT_OPTIONS[field];
    const label = FIELD_LABELS[field] || field;

    return (
      <div key={field} className={styles.fieldGroup}>
        <label className={styles.label}>{label}</label>
        {options ? (
          <select
            className={styles.select}
            value={formData[field]}
            onChange={(e) => handleChange(field, e)}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            className={styles.input}
            type="number"
            value={formData[field]}
            onChange={(e) => handleChange(field, e)}
          />
        )}
      </div>
    );
  };

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>Risk Assessment</h2>
        <p>Complete the profile to generate an AI-powered risk score.</p>
      </div>

      <div className={styles.progressContainer}>
        {STEP_GROUPS.map((grp, idx) => {
           let nodeClass = styles.stepNode;
           if (idx < currentStep) nodeClass += ` ${styles.stepNodeCompleted}`;
           if (idx === currentStep) nodeClass += ` ${styles.stepNodeActive}`;
           
           return (
             <div key={idx} className={nodeClass}>
                <span>{idx + 1}</span>
                <span className={styles.stepLabel}>{grp.shortTitle}</span>
             </div>
           );
        })}
      </div>

      <div className={styles.formGrid}>
        {currentGroup.fields.map(renderField)}
      </div>

      <div className={styles.actions}>
        {currentStep > 0 && (
          <button className={styles.button} onClick={() => setCurrentStep((p) => p - 1)} disabled={loading}>
            Back
          </button>
        )}
        
        {!isLastStep ? (
          <button className={styles.submitButton} onClick={() => setCurrentStep((p) => p + 1)} disabled={loading}>
            Next Step
          </button>
        ) : (
          <button className={styles.submitButton} onClick={onAssess} disabled={loading}>
            {loading ? 'Analyzing...' : 'Assess Risk'}
          </button>
        )}
      </div>
    </section>
  );
}
