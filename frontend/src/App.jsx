import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  checkHealth,
  fetchAuditLogs,
  fetchFairnessMetrics,
  fetchModelRegistry,
  predictBatch,
  predictRisk,
} from './api/client';
import AdminPanel from './components/AdminPanel';
import AssessmentForm from './components/AssessmentForm';
import BatchScoringPanel from './components/BatchScoringPanel';
import DecisionSupportPanel from './components/DecisionSupportPanel';
import OnboardingTour from './components/OnboardingTour';
import WhatIfSimulator from './components/WhatIfSimulator';
import XAIVisualization from './components/XAIVisualization';
import { computeConfidence, generateRecommendations, getFeatureLabel } from './constants/decisionSupport';
import { DEFAULT_FORM_VALUES } from './constants/formOptions';
import { TEXT } from './constants/i18n';
import { getValidationHints } from './constants/validation';
import styles from './App.module.css';

function readSessionState(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveSessionState(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function confidenceText(score) {
  return `${Math.round(score * 100)}%`;
}

function App() {
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: 'Checking API status…' });
  const [savedScenarios, setSavedScenarios] = useState(() => readSessionState('credishield-scenarios', []));
  const [history, setHistory] = useState(() => readSessionState('credishield-history', []));
  const [baselineScenario, setBaselineScenario] = useState(() => readSessionState('credishield-baseline', null));
  const [language, setLanguage] = useState(() => readSessionState('credishield-language', 'en'));
  const [tourOpen, setTourOpen] = useState(() => readSessionState('credishield-tour-open', true));
  const [role, setRole] = useState(() => readSessionState('credishield-role', 'end_user'));
  const [modelInfo, setModelInfo] = useState(null);
  const [fairnessMetrics, setFairnessMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const t = TEXT[language] ?? TEXT.en;

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const runPrediction = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const result = await predictRisk(payload, { retries: 1 });
      setPrediction(result);
      return result;
    } catch (err) {
      console.error('runPrediction failed in App', err);
      setError(t.apiOffline);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAssessRisk = async () => {
    const result = await runPrediction(formData);
    if (result) {
      setSimulationEnabled(true);

      if (!baselineScenario) {
        const baseline = {
          id: `baseline-${Date.now()}`,
          name: 'Baseline',
          timestamp: new Date().toISOString(),
          formData: { ...formData },
          prediction: result,
        };
        setBaselineScenario(baseline);
      }

      const confidence = computeConfidence(result, language);
      setHistory((prev) => [
        {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toISOString(),
          prediction: result,
          confidenceBand: confidence.band,
        },
        ...prev,
      ].slice(0, 20));
    }
  };

  const refreshHealth = async () => {
    try {
      const res = await checkHealth();
      setApiHealth({ status: 'up', message: `${res.service} ${t.apiOnline}` });
    } catch (e) {
      setApiHealth({ status: 'down', message: t.apiOffline });
    }
  };

  const refreshAdminData = async () => {
    if (role === 'end_user') return;
    try {
      const [model, fairness, logs] = await Promise.all([
        fetchModelRegistry(),
        fetchFairnessMetrics(),
        fetchAuditLogs(120),
      ]);
      setModelInfo(model);
      setFairnessMetrics(fairness);
      setAuditLogs(logs.entries ?? []);
    } catch (e) {
      console.error('Admin data refresh failed', e);
    }
  };

  const handleBatchScoring = async (rows) => {
    const normalized = rows.map((row) => ({
      ...row,
      duration: Number(row.duration),
      credit_amount: Number(row.credit_amount),
      installment_commitment: Number(row.installment_commitment),
      residence_since: Number(row.residence_since),
      age: Number(row.age),
      existing_credits: Number(row.existing_credits),
      num_dependents: Number(row.num_dependents),
    }));

    const result = await predictBatch(normalized);
    await refreshAdminData();
    return result;
  };

  const handleSaveScenario = () => {
    if (!prediction) return;

    const nextScenario = {
      id: `scn-${Date.now()}`,
      name: `Scenario ${savedScenarios.length + 1}`,
      timestamp: new Date().toISOString(),
      formData: { ...formData },
      prediction,
    };
    setSavedScenarios((prev) => [nextScenario, ...prev].slice(0, 12));
  };

  const handleExportPdf = () => {
    if (!prediction) return;

    const confidence = computeConfidence(prediction, language);
    const recommendations = generateRecommendations(formData, prediction, language);
    const doc = new jsPDF();
    let y = 14;

    const writeLine = (text, step = 7) => {
      doc.text(text, 14, y);
      y += step;
    };

    doc.setFontSize(16);
    writeLine('CrediShield Credit Risk Explanation Report', 10);
    doc.setFontSize(11);
    writeLine(`Generated: ${new Date().toLocaleString()}`);
    writeLine(`Risk Score (PD): ${(prediction.probability_of_default * 100).toFixed(1)}%`);
    writeLine(`${t.confidence}: ${confidence.band} (${confidenceText(confidence.score)})`);
    y += 2;

    writeLine('Input Summary:');
    Object.entries(formData).forEach(([key, value]) => {
      writeLine(`- ${getFeatureLabel(key, language)}: ${value}`, 6);
    });

    y += 2;
    writeLine('Top SHAP Risk-Increasing Factors:');
    (prediction.top_risk_increasing ?? []).slice(0, 3).forEach((item) => {
      writeLine(`- ${getFeatureLabel(item.feature, language)} (+${item.impact.toFixed(4)})`, 6);
    });

    y += 2;
    writeLine('Top SHAP Risk-Decreasing Factors:');
    (prediction.top_risk_decreasing ?? []).slice(0, 3).forEach((item) => {
      writeLine(`- ${getFeatureLabel(item.feature, language)} (${item.impact.toFixed(4)})`, 6);
    });

    y += 2;
    writeLine('Recommendations:');
    recommendations.forEach((tip) => writeLine(`- ${tip}`, 6));

    doc.save(`CrediShield_Report_${Date.now()}.pdf`);
  };

  const confidence = computeConfidence(prediction, language);
  const recommendations = generateRecommendations(formData, prediction, language);
  const validationHints = getValidationHints(formData, language);

  useEffect(() => {
    saveSessionState('credishield-scenarios', savedScenarios);
  }, [savedScenarios]);

  useEffect(() => {
    saveSessionState('credishield-history', history);
  }, [history]);

  useEffect(() => {
    saveSessionState('credishield-baseline', baselineScenario);
  }, [baselineScenario]);

  useEffect(() => {
    saveSessionState('credishield-language', language);
  }, [language]);

  useEffect(() => {
    saveSessionState('credishield-tour-open', tourOpen);
  }, [tourOpen]);

  useEffect(() => {
    saveSessionState('credishield-role', role);
  }, [role]);

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 15000);
    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    refreshAdminData();
  }, [role]);

  useEffect(() => {
    if (!simulationEnabled) {
      return;
    }

    const timer = setTimeout(() => {
      runPrediction(formData);
    }, 600); // Debounce simulation

    return () => clearTimeout(timer);
  }, [formData, simulationEnabled]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <h1>CrediShield XAI</h1>
            <p>{t.appTagline}</p>
          </div>
          <div className={styles.topControls}>
            <div className={styles.langSwitch}>
              <span>{t.language}</span>
              <button type="button" className={language === 'en' ? styles.langActive : ''} onClick={() => setLanguage('en')}>
                {t.english}
              </button>
              <button type="button" className={language === 'hi' ? styles.langActive : ''} onClick={() => setLanguage('hi')}>
                {t.hindi}
              </button>
            </div>
            <div className={styles.roleSwitch}>
              <span>Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="end_user">End User</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button className={styles.tourBtn} type="button" onClick={() => setTourOpen(true)}>
              {t.startTour}
            </button>
            <div className={`${styles.healthBadge} ${styles[`health_${apiHealth.status}`]}`}>
              {apiHealth.message || t.checkingHealth}
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.errorToast}>
           <span>{error}</span>
           <button className={styles.retryButton} onClick={() => runPrediction(formData)} type="button">
             {t.retry}
           </button>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <AssessmentForm
            formData={formData}
            updateField={updateField}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onAssess={handleAssessRisk}
            loading={loading}
            language={language}
            t={t}
            validationHints={validationHints}
          />

          {simulationEnabled && (
            <WhatIfSimulator
              formData={formData}
              onScenarioChange={updateField}
              isEnabled={simulationEnabled}
              loading={loading}
              t={t}
              language={language}
            />
          )}

          <DecisionSupportPanel
            prediction={prediction}
            confidence={confidence}
            recommendations={recommendations}
            scenarios={savedScenarios}
            baselineScenario={baselineScenario}
            history={history}
            onSaveScenario={handleSaveScenario}
            onExportPdf={handleExportPdf}
            t={t}
            language={language}
          />

          <BatchScoringPanel role={role} onRunBatch={handleBatchScoring} loading={loading} />

          <AdminPanel role={role} modelInfo={modelInfo} fairness={fairnessMetrics} auditLogs={auditLogs} />
        </div>

        <div className={styles.vizColumn}>
           <XAIVisualization prediction={prediction} loading={loading} t={t} language={language} />
        </div>
      </div>

      {tourOpen ? <OnboardingTour t={t} onClose={() => setTourOpen(false)} /> : null}
    </div>
  );
}

export default App;
