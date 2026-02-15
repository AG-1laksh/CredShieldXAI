import { useMemo, useState } from 'react';
import styles from './OnboardingTour.module.css';

export default function OnboardingTour({
  t = {
    tourStep1Title: 'Step 1',
    tourStep1Body: 'Run assessment and view risk gauge.',
    tourStep2Title: 'Step 2',
    tourStep2Body: 'Read SHAP factors driving risk.',
    tourStep3Title: 'Step 3',
    tourStep3Body: 'Use recommendations and save scenarios.',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
  },
  onClose,
}) {
  const [index, setIndex] = useState(0);

  const steps = useMemo(
    () => [
      { title: t.tourStep1Title, body: t.tourStep1Body },
      { title: t.tourStep2Title, body: t.tourStep2Body },
      { title: t.tourStep3Title, body: t.tourStep3Body },
    ],
    [t],
  );

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.topRow}>
          <h3>{steps[index].title}</h3>
          <button onClick={onClose} type="button" className={styles.ghostBtn}>{t.close}</button>
        </div>
        <p>{steps[index].body}</p>

        <div className={styles.progressRow}>
          {steps.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === index ? styles.dotActive : ''}`} />
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => setIndex((v) => Math.max(0, v - 1))}
            disabled={isFirst}
          >
            {t.previous}
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              if (isLast) onClose();
              else setIndex((v) => v + 1);
            }}
          >
            {isLast ? t.finish : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
