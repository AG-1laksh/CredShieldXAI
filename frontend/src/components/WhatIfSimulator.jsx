import styles from './WhatIfSimulator.module.css';

const SLIDER_CONFIG = [
  { key: 'duration', min: 6, max: 72, step: 1, label: 'Duration (months)' },
  { key: 'credit_amount', min: 250, max: 20000, step: 50, label: 'Credit Amount' },
  { key: 'age', min: 18, max: 75, step: 1, label: 'Age' },
  { key: 'installment_commitment', min: 1, max: 4, step: 1, label: 'Installment Commitment' },
  { key: 'existing_credits', min: 1, max: 4, step: 1, label: 'Existing Credits' },
  { key: 'num_dependents', min: 1, max: 2, step: 1, label: 'Dependents' },
];

const SLIDER_LABELS_HI = {
  duration: 'भुगतान समय (महीने)',
  credit_amount: 'लोन राशि',
  age: 'आयु',
  installment_commitment: 'मासिक भुगतान भार',
  existing_credits: 'सक्रिय लोन',
  num_dependents: 'निर्भर लोग',
};

export default function WhatIfSimulator({
  formData,
  onScenarioChange,
  isEnabled,
  loading,
  t = {
    whatIfTitle: 'What-If Simulator',
    whatIfSubtitle: 'Adjust sliders to trigger instant re-scoring and observe risk movement in real time.',
    whatIfHint: 'Run the first assessment to activate simulation.',
  },
  language = 'en',
}) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{t.whatIfTitle}</h2>
        <p className={styles.empty}>
            {t.whatIfSubtitle}
        </p>
      </div>

      <div className={styles.controls}>
        {SLIDER_CONFIG.map((slider) => (
          <div key={slider.key} className={styles.controlGroup}>
            <label>
              <span>{language === 'hi' ? (SLIDER_LABELS_HI[slider.key] ?? slider.label) : slider.label}</span>
              <span>{formData[slider.key]}</span>
            </label>
            <input
              className={styles.slider}
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={formData[slider.key] || slider.min} // Fallback to min if undefined
              disabled={!isEnabled || loading}
              onChange={(e) => onScenarioChange(slider.key, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      {!isEnabled && (
        <div style={{textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)'}}>
             {t.whatIfHint}
        </div>
      )}
    </section>
  );
}
