import { useState } from 'react';
import styles from './BatchScoringPanel.module.css';

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? '';
    });
    return obj;
  });
}

export default function BatchScoringPanel({ role, onRunBatch, loading }) {
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (role === 'end_user') return null;

  const handleFile = async (file) => {
    setError('');
    setResult(null);
    if (!file) return;

    setFileName(file.name);
    const content = await file.text();
    const parsed = parseCsv(content);
    setRows(parsed);
    if (!parsed.length) {
      setError('CSV parsing failed or no rows found.');
    }
  };

  const handleRun = async () => {
    setError('');
    setResult(null);
    try {
      const output = await onRunBatch(rows);
      setResult(output);
    } catch (e) {
      setError(e.message || 'Batch scoring failed');
    }
  };

  return (
    <section className={styles.card}>
      <h2>Batch Scoring Upload</h2>
      <p>Upload CSV with the same input columns as the form to score multiple applicants.</p>

      <label className={styles.fileInputWrap}>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      <div className={styles.metaRow}>
        <span>{fileName || 'No file selected'}</span>
        <span>{rows.length} rows</span>
      </div>

      <button type="button" disabled={loading || rows.length === 0} className={styles.runBtn} onClick={handleRun}>
        Run Batch Scoring
      </button>

      {error ? <p className={styles.error}>{error}</p> : null}

      {result ? (
        <div className={styles.resultBox}>
          <strong>Processed: {result.count} rows</strong>
          <ul>
            {result.results.slice(0, 5).map((row) => (
              <li key={row.index}>Row {row.index + 1}: {(row.probability_of_default * 100).toFixed(1)}% PD</li>
            ))}
          </ul>
          {result.results.length > 5 ? <em>Showing first 5 rows…</em> : null}
        </div>
      ) : null}
    </section>
  );
}
