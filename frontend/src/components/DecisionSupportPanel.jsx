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
}) {
  if (!prediction) return null;

  const baselinePd = baselineScenario?.prediction?.probability_of_default ?? null;

  return (
    <section className={styles.card}>
      <div className={styles.headerRow}>
        <h2>Decision Support</h2>
        <div className={`${styles.confidencePill} ${confidenceClass(confidence.band)}`}>
          Confidence: {confidence.band}
        </div>
      </div>

      <p className={styles.confidenceNote}>{confidence.rationale}</p>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onSaveScenario} type="button">
          Save Current Scenario
        </button>
        <button className={styles.secondaryBtn} onClick={onExportPdf} type="button">
          Export PDF Report
        </button>
      </div>

      <div className={styles.block}>
        <h3>How to Improve My Score</h3>
        <ul>
          {recommendations.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className={styles.block}>
        <h3>Scenario Comparison</h3>
        {scenarios.length === 0 ? (
          <p className={styles.empty}>No saved scenarios yet. Adjust sliders and save scenarios to compare.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>PD%</th>
                  <th>Δ vs Baseline</th>
                  <th>Top Risk Factors</th>
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
                      <td>{summarizeTopFactors(scenario.prediction, 2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.block}>
        <h3>Session History</h3>
        {history.length === 0 ? (
          <p className={styles.empty}>No assessments in this session yet.</p>
        ) : (
          <ul className={styles.historyList}>
            {history.map((entry) => (
              <li key={entry.id}>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                <strong>{(entry.prediction.probability_of_default * 100).toFixed(1)}%</strong>
                <em>{entry.confidenceBand} confidence</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
