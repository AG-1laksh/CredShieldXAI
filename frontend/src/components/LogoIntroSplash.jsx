import styles from './LogoIntroSplash.module.css';

export default function LogoIntroSplash({ subtitle, compact = false }) {
  return (
    <div className={`${styles.overlay} ${compact ? styles.overlayCompact : ''}`}>
      <div className={styles.centerWrap}>
        <div className={styles.logoOrb} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.ring} />
          <span className={styles.ring} />
          <span className={styles.dot} />
        </div>
        <h1 className={styles.brand}>CrediShield XAI</h1>
        <p className={styles.tagline}>{subtitle ?? 'Neumorphic Cyber-Finance Intelligence Unit'}</p>
      </div>
    </div>
  );
}
