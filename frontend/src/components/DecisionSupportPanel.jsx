import styles from './DecisionSupportPanel.module.css';
import { summarizeTopFactors } from '../constants/decisionSupport';

function confidenceClass(band) {
  if (band === 'High') return styles.high;
  if (band === 'Medium') return styles.medium;
  return styles.low;
}

export default function DecisionSupportPanel({
  prediction,
  confidence,
  recommendations,
  scenarios,
  baselineScenario,
  history,
  onSaveScenario,
  onExportPdf,
  language = 'en',
  t = {
    decisionTitle: 'Decision Support',
    confidence: 'Confidence',
    saveScenario: 'Save Current Scenario',
    exportPdf: 'Export PDF Report',
    improveScore: 'How to Improve My Score',
    scenarioComparison: 'Scenario Comparison',
    noScenario: 'No saved scenarios yet.',
    sessionHistory: 'Session History',
    noHistory: 'No assessments in this session yet.',
    scenario: 'Scenario',
    baselineDelta: 'Δ vs Baseline',
    topFactors: 'Top Risk Factors',
    confidenceHigh: 'High',
    confidenceMedium: 'Medium',
    confidenceLow: 'Low',
    confidenceSuffix: 'confidence',
  },
}) {
  if (!prediction) return null;

  const baselinePd = baselineScenario?.prediction?.probability_of_default ?? null;

  const getBandLabel = (band) => {
    if (band === 'High') return t.confidenceHigh ?? band;
    if (band === 'Medium') return t.confidenceMedium ?? band;
    if (band === 'Low') return t.confidenceLow ?? band;
    return band;
  };

  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2>{t.decisionTitle}</h2>
        <div className={`${styles.confidencePill} ${confidenceClass(confidence.band)}`}>
          {t.confidence}: {getBandLabel(confidence.band)}
        </div>
      </div>

      <p className={styles.confidenceNote}>{confidence.rationale}</p>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onSaveScenario} type="button">
          {t.saveScenario}
        </button>
        <button className={styles.secondaryBtn} onClick={onExportPdf} type="button">
          {t.exportPdf}
        </button>
      </div>

      <div className={styles.block}>
        <h3>{t.improveScore}</h3>
        <ul>
          {recommendations.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className={styles.block}>
        <h3>{t.scenarioComparison}</h3>
        {scenarios.length === 0 ? (
          <p className={styles.empty}>{t.noScenario}</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.scenario}</th>
                  <th>PD%</th>
                  <th>{t.baselineDelta}</th>
                  <th>{t.topFactors}</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => {
                  const pd = scenario.prediction.probability_of_default * 100;
                  const delta = baselinePd === null
                    ? null
                    : (scenario.prediction.probability_of_default - baselinePd) * 100;

                  return (
                    <tr key={scenario.id}>
                      <td>{scenario.name}</td>
                      <td>{pd.toFixed(1)}%</td>
                      <td>
                        {delta === null
                          ? '—'
                          : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
                      </td>
                      <td>{summarizeTopFactors(scenario.prediction, 2, language)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.block}>
        <h3>{t.sessionHistory}</h3>
        {history.length === 0 ? (
          <p className={styles.empty}>{t.noHistory}</p>
        ) : (
          <ul className={styles.historyList}>
            {history.map((entry) => (
              <li key={entry.id}>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                <strong>{(entry.prediction.probability_of_default * 100).toFixed(1)}%</strong>
                <em>{getBandLabel(entry.confidenceBand)} {t.confidenceSuffix ?? 'confidence'}</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
