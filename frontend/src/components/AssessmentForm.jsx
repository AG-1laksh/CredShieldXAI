import styles from './AssessmentForm.module.css';
import { FORM_SELECT_OPTIONS } from '../constants/formOptions';

const STEP_GROUPS = [
  {
    title: 'Applicant',
    titleHi: 'आवेदक',
    shortTitle: 'Profile',
    shortTitleHi: 'प्रोफ़ाइल',
    fields: ['age', 'personal_status', 'job', 'employment', 'num_dependents', 'housing'],
  },
  {
    title: 'History',
    titleHi: 'इतिहास',
    shortTitle: 'Credit',
    shortTitleHi: 'क्रेडिट',
    fields: ['checking_status', 'credit_history', 'existing_credits', 'other_payment_plans', 'own_telephone', 'foreign_worker'],
  },
  {
    title: 'Financials',
    titleHi: 'वित्तीय जानकारी',
    shortTitle: 'Loan',
    shortTitleHi: 'लोन',
    fields: ['purpose', 'credit_amount', 'duration', 'installment_commitment', 'savings_status', 'residence_since', 'other_parties', 'property_magnitude'],
  },
];

const FIELD_LABELS = {
  checking_status: 'Money in Checking Account',
  duration: 'Repayment Time (months)',
  credit_history: 'Past Repayment Record',
  purpose: 'Why You Need the Loan',
  credit_amount: 'Loan Amount',
  savings_status: 'Money in Savings',
  employment: 'Time in Current Employment',
  installment_commitment: 'Monthly Payment Burden',
  personal_status: 'Family / Personal Status',
  other_parties: 'Support from Other Person',
  residence_since: 'Time at Current Home',
  property_magnitude: 'Main Assets You Own',
  age: 'Age',
  other_payment_plans: 'Other Ongoing Payment Plans',
  housing: 'Living Situation',
  existing_credits: 'Current Active Loans',
  job: 'Work Type',
  num_dependents: 'People Depending on Your Income',
  own_telephone: 'Registered Telephone',
  foreign_worker: 'Foreign Worker Status',
};

const FIELD_LABELS_HI = {
  checking_status: 'चेकिंग खाते में राशि',
  duration: 'भुगतान समय (महीने)',
  credit_history: 'पिछला भुगतान रिकॉर्ड',
  purpose: 'लोन लेने का कारण',
  credit_amount: 'लोन राशि',
  savings_status: 'बचत में राशि',
  employment: 'वर्तमान रोजगार अवधि',
  installment_commitment: 'मासिक भुगतान भार',
  personal_status: 'पारिवारिक / व्यक्तिगत स्थिति',
  other_parties: 'अन्य व्यक्ति का समर्थन',
  residence_since: 'वर्तमान घर में अवधि',
  property_magnitude: 'मुख्य संपत्ति',
  age: 'आयु',
  other_payment_plans: 'अन्य भुगतान योजनाएँ',
  housing: 'रहने की स्थिति',
  existing_credits: 'वर्तमान सक्रिय लोन',
  job: 'कार्य प्रकार',
  num_dependents: 'आय पर निर्भर लोग',
  own_telephone: 'पंजीकृत टेलीफ़ोन',
  foreign_worker: 'विदेशी कार्यकर्ता स्थिति',
};

const FIELD_MEANINGS = {
  checking_status: 'The balance range in your checking account.',
  duration: 'How many months you plan to take to repay this loan.',
  credit_history: 'How well you have repaid loans in the past.',
  purpose: 'What the loan will be used for.',
  credit_amount: 'The total amount of money you want to borrow.',
  savings_status: 'The balance range in your savings account.',
  employment: 'How long you have been in your current employment.',
  installment_commitment: 'How heavy your monthly loan payments are (from low to high).',
  personal_status: 'Your family/personal status used for credit profiling.',
  other_parties: 'Whether someone else (co-applicant/guarantor) supports this loan.',
  residence_since: 'How long you have lived in your current home.',
  property_magnitude: 'Your main property/asset type (for example home, car, etc.).',
  age: 'Your age in years.',
  other_payment_plans: 'Whether you already have other payment plans running.',
  housing: 'Your current living arrangement (rent/own/free).',
  existing_credits: 'How many active loans you currently have.',
  job: 'The type/skill level of your job.',
  num_dependents: 'How many people rely on your income.',
  own_telephone: 'Whether you have a registered telephone.',
  foreign_worker: 'Whether you are recorded as a foreign worker in this dataset.',
};

const OPTION_DISPLAY_LABELS_EN = {
  checking_status: {
    '<0': 'Below 0',
    '0<=X<200': '0 to 199',
    '>=200': '200 or more',
    'no checking': 'No checking account',
  },
  credit_history: {
    'no credits/all paid': 'No credits / all paid',
    'all paid': 'All paid',
    'existing paid': 'Existing paid',
    'delayed previously': 'Previously delayed',
    'critical/other existing credit': 'Critical / other credit',
  },
  purpose: {
    'new car': 'New car',
    'used car': 'Used car',
    'furniture/equipment': 'Furniture / equipment',
    'radio/tv': 'Electronics',
    'domestic appliance': 'Home appliance',
    repairs: 'Repairs',
    education: 'Education',
    business: 'Business',
    other: 'Other',
  },
  savings_status: {
    '<100': 'Below 100',
    '100<=X<500': '100 to 499',
    '500<=X<1000': '500 to 999',
    '>=1000': '1000 or more',
    'no known savings': 'No known savings',
  },
  employment: {
    unemployed: 'Unemployed',
    '<1': 'Less than 1 year',
    '1<=X<4': '1 to 3 years',
    '4<=X<7': '4 to 6 years',
    '>=7': '7+ years',
  },
  personal_status: {
    'male div/sep': 'Male divorced/separated',
    'female div/dep/mar': 'Female divorced/dependent/married',
    'male single': 'Male single',
    'male mar/wid': 'Male married/widowed',
    'female single': 'Female single',
  },
  other_parties: {
    none: 'None',
    'co applicant': 'Co-applicant',
    guarantor: 'Guarantor',
  },
  property_magnitude: {
    'real estate': 'Real estate',
    'life insurance': 'Life insurance',
    car: 'Car',
    'no known property': 'No known property',
  },
  other_payment_plans: {
    bank: 'Bank',
    stores: 'Stores',
    none: 'None',
  },
  housing: {
    rent: 'Rent',
    own: 'Own',
    'for free': 'For free',
  },
  job: {
    'unskilled non resident': 'Unskilled (non-resident)',
    'unskilled resident': 'Unskilled (resident)',
    skilled: 'Skilled',
    'high qualif/self emp/mgmt': 'Highly qualified / self-employed / management',
  },
  own_telephone: {
    none: 'No',
    yes: 'Yes',
  },
  foreign_worker: {
    yes: 'Yes',
    no: 'No',
  },
};

const OPTION_DISPLAY_LABELS_HI = {
  checking_status: {
    '<0': '0 से कम',
    '0<=X<200': '0 से 199',
    '>=200': '200 या अधिक',
    'no checking': 'चेकिंग खाता नहीं',
  },
  credit_history: {
    'no credits/all paid': 'कोई क्रेडिट नहीं / सब भुगतान',
    'all paid': 'सब भुगतान',
    'existing paid': 'मौजूदा भुगतान नियमित',
    'delayed previously': 'पहले देरी हुई',
    'critical/other existing credit': 'गंभीर / अन्य क्रेडिट',
  },
  purpose: {
    'new car': 'नई कार',
    'used car': 'पुरानी कार',
    'furniture/equipment': 'फर्नीचर / उपकरण',
    'radio/tv': 'इलेक्ट्रॉनिक्स',
    'domestic appliance': 'घरेलू उपकरण',
    repairs: 'मरम्मत',
    education: 'शिक्षा',
    business: 'व्यवसाय',
    other: 'अन्य',
  },
  savings_status: {
    '<100': '100 से कम',
    '100<=X<500': '100 से 499',
    '500<=X<1000': '500 से 999',
    '>=1000': '1000 या अधिक',
    'no known savings': 'बचत जानकारी उपलब्ध नहीं',
  },
  employment: {
    unemployed: 'बेरोजगार',
    '<1': '1 वर्ष से कम',
    '1<=X<4': '1 से 3 वर्ष',
    '4<=X<7': '4 से 6 वर्ष',
    '>=7': '7+ वर्ष',
  },
  personal_status: {
    'male div/sep': 'पुरुष तलाकशुदा/अलग',
    'female div/dep/mar': 'महिला तलाकशुदा/निर्भर/विवाहित',
    'male single': 'पुरुष अविवाहित',
    'male mar/wid': 'पुरुष विवाहित/विधुर',
    'female single': 'महिला अविवाहित',
  },
  other_parties: {
    none: 'कोई नहीं',
    'co applicant': 'सह-आवेदक',
    guarantor: 'जमानतदार',
  },
  property_magnitude: {
    'real estate': 'अचल संपत्ति',
    'life insurance': 'जीवन बीमा',
    car: 'कार',
    'no known property': 'कोई ज्ञात संपत्ति नहीं',
  },
  other_payment_plans: {
    bank: 'बैंक',
    stores: 'स्टोर',
    none: 'कोई नहीं',
  },
  housing: {
    rent: 'किराए पर',
    own: 'स्वयं का',
    'for free': 'मुफ़्त',
  },
  job: {
    'unskilled non resident': 'अकुशल (गैर-निवासी)',
    'unskilled resident': 'अकुशल (निवासी)',
    skilled: 'कुशल',
    'high qualif/self emp/mgmt': 'उच्च योग्य / स्व-रोज़गार / प्रबंधन',
  },
  own_telephone: {
    none: 'नहीं',
    yes: 'हाँ',
  },
  foreign_worker: {
    yes: 'हाँ',
    no: 'नहीं',
  },
};

const OPTION_MEANINGS_EN = {
  checking_status: {
    '<0': 'Balance is below 0.',
    '0<=X<200': 'Balance is between 0 and 200.',
    '>=200': 'Balance is 200 or more.',
    'no checking': 'No checking account information is available.',
  },
  savings_status: {
    '<100': 'Savings are below 100.',
    '100<=X<500': 'Savings are between 100 and 500.',
    '500<=X<1000': 'Savings are between 500 and 1000.',
    '>=1000': 'Savings are 1000 or more.',
    'no known savings': 'No savings information is available.',
  },
  employment: {
    unemployed: 'Currently not employed.',
    '<1': 'Employment duration is less than 1 year.',
    '1<=X<4': 'Employment duration is between 1 and 4 years.',
    '4<=X<7': 'Employment duration is between 4 and 7 years.',
    '>=7': 'Employment duration is 7 years or more.',
  },
  other_parties: {
    none: 'No co-applicant or guarantor is involved.',
    'co applicant': 'A co-applicant is applying with you.',
    guarantor: 'A guarantor backs the loan.',
  },
  housing: {
    rent: 'You currently rent your home.',
    own: 'You own your home.',
    'for free': 'You live without paying rent.',
  },
  own_telephone: {
    none: 'No registered telephone.',
    yes: 'Registered telephone available.',
  },
  foreign_worker: {
    yes: 'Recorded as a foreign worker in this dataset.',
    no: 'Not recorded as a foreign worker in this dataset.',
  },
};

const OPTION_MEANINGS_HI = {
  checking_status: {
    '<0': 'बैलेंस 0 से कम है।',
    '0<=X<200': 'बैलेंस 0 से 200 के बीच है।',
    '>=200': 'बैलेंस 200 या अधिक है।',
    'no checking': 'चेकिंग खाते की जानकारी उपलब्ध नहीं है।',
  },
  savings_status: {
    '<100': 'बचत 100 से कम है।',
    '100<=X<500': 'बचत 100 से 500 के बीच है।',
    '500<=X<1000': 'बचत 500 से 1000 के बीच है।',
    '>=1000': 'बचत 1000 या अधिक है।',
    'no known savings': 'बचत की जानकारी उपलब्ध नहीं है।',
  },
  employment: {
    unemployed: 'वर्तमान में रोजगार नहीं है।',
    '<1': 'रोजगार अवधि 1 वर्ष से कम है।',
    '1<=X<4': 'रोजगार अवधि 1 से 4 वर्ष के बीच है।',
    '4<=X<7': 'रोजगार अवधि 4 से 7 वर्ष के बीच है।',
    '>=7': 'रोजगार अवधि 7 वर्ष या अधिक है।',
  },
  other_parties: {
    none: 'कोई सह-आवेदक या जमानतदार नहीं है।',
    'co applicant': 'एक सह-आवेदक शामिल है।',
    guarantor: 'एक जमानतदार समर्थन कर रहा है।',
  },
  housing: {
    rent: 'आप किराए के घर में रहते हैं।',
    own: 'आप अपने घर में रहते हैं।',
    'for free': 'आप बिना किराए के रहते हैं।',
  },
  own_telephone: {
    none: 'पंजीकृत टेलीफ़ोन नहीं है।',
    yes: 'पंजीकृत टेलीफ़ोन उपलब्ध है।',
  },
  foreign_worker: {
    yes: 'डेटासेट में विदेशी कार्यकर्ता के रूप में दर्ज है।',
    no: 'डेटासेट में विदेशी कार्यकर्ता के रूप में दर्ज नहीं है।',
  },
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

export default function AssessmentForm({
  formData,
  updateField,
  currentStep,
  setCurrentStep,
  onAssess,
  loading,
  language = 'en',
  t = {
    formTitle: 'Risk Assessment',
    formSubtitle: 'Complete the profile to generate an AI-powered risk score.',
    validationsTitle: 'Smart Guidance',
    back: 'Back',
    nextStep: 'Next Step',
    analyzing: 'Analyzing...',
    assessRisk: 'Assess Risk',
  },
  validationHints = [],
}) {
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
    const labelMap = language === 'hi' ? FIELD_LABELS_HI : FIELD_LABELS;
    const optionDisplayMap = language === 'hi' ? OPTION_DISPLAY_LABELS_HI : OPTION_DISPLAY_LABELS_EN;
    const optionMeaningMap = language === 'hi' ? OPTION_MEANINGS_HI : OPTION_MEANINGS_EN;
    const label = labelMap[field] || field;
    const fieldMeaning = FIELD_MEANINGS[field];
    const selectedOptionMeaning = options ? optionMeaningMap[field]?.[formData[field]] : null;

    return (
      <div key={field} className={styles.fieldGroup}>
        <label className={styles.label}>{label}</label>
        {fieldMeaning ? <p className={styles.helperText}>{fieldMeaning}</p> : null}
        {options ? (
          <>
            <select
              className={styles.select}
              value={formData[field]}
              onChange={(e) => handleChange(field, e)}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {optionDisplayMap[field]?.[opt] ?? opt}
                </option>
              ))}
            </select>
            {selectedOptionMeaning ? <p className={styles.optionHint}>{selectedOptionMeaning}</p> : null}
          </>
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
        <h2>{t.formTitle}</h2>
        <p>{t.formSubtitle}</p>
      </div>

      <div className={styles.progressContainer}>
        {STEP_GROUPS.map((grp, idx) => {
           let nodeClass = styles.stepNode;
           if (idx < currentStep) nodeClass += ` ${styles.stepNodeCompleted}`;
           if (idx === currentStep) nodeClass += ` ${styles.stepNodeActive}`;
           
           return (
             <div key={idx} className={nodeClass}>
                <span>{idx + 1}</span>
               <span className={styles.stepLabel}>{language === 'hi' ? grp.shortTitleHi : grp.shortTitle}</span>
             </div>
           );
        })}
      </div>

      <div className={styles.formGrid}>
        {currentGroup.fields.map(renderField)}
      </div>

      {validationHints.length > 0 ? (
        <div className={styles.validationBox}>
          <h3>{t.validationsTitle}</h3>
          <ul>
            {validationHints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.actions}>
        {currentStep > 0 && (
          <button className={styles.button} onClick={() => setCurrentStep((p) => p - 1)} disabled={loading}>
            {t.back}
          </button>
        )}
        
        {!isLastStep ? (
          <button className={styles.submitButton} onClick={() => setCurrentStep((p) => p + 1)} disabled={loading}>
            {t.nextStep}
          </button>
        ) : (
          <button className={styles.submitButton} onClick={onAssess} disabled={loading}>
            {loading ? t.analyzing : t.assessRisk}
          </button>
        )}
      </div>
    </section>
  );
}
