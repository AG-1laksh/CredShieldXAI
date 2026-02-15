import styles from './AdminPanel.module.css';

function MetricTable({ title, rows }) {
  return (
    <div className={styles.block}>
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p className={styles.empty}>No data</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Group</th>
              <th>Count</th>
              <th>Avg PD</th>
              <th>High Risk Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.group}>
                <td>{r.group}</td>
                <td>{r.count}</td>
                <td>{(r.avg_pd * 100).toFixed(1)}%</td>
                <td>{(r.high_risk_rate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminPanel({ role, modelInfo, fairness, auditLogs }) {
  if (role === 'end_user') return null;

  return (
    <section className={styles.card}>
      <h2>Admin & Governance</h2>

      <div className={styles.block}>
        <h3>Model Registry</h3>
        {modelInfo ? (
          <ul className={styles.metaList}>
            <li><strong>Version:</strong> {modelInfo.model_version}</li>
            <li><strong>Artifact:</strong> {modelInfo.artifact_path}</li>
            <li><strong>Last trained:</strong> {modelInfo.last_trained_at ? new Date(modelInfo.last_trained_at).toLocaleString() : 'Unknown'}</li>
            <li><strong>Features:</strong> {modelInfo.categorical_features.length + modelInfo.numerical_features.length}</li>
          </ul>
        ) : (
          <p className={styles.empty}>No model metadata</p>
        )}
      </div>

      <MetricTable title="Fairness by Personal Status" rows={fairness?.by_personal_status ?? []} />
      <MetricTable title="Fairness by Foreign Worker" rows={fairness?.by_foreign_worker ?? []} />

      <div className={styles.block}>
        <h3>Audit Logs</h3>
        {auditLogs.length === 0 ? (
          <p className={styles.empty}>No logs yet</p>
        ) : (
          <div className={styles.auditWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Time</th>
                  <th>PD%</th>
                  <th>Model</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{(log.pd_score * 100).toFixed(1)}%</td>
                    <td>{log.model_version}</td>
                    <td>{log.input_payload?.purpose ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
