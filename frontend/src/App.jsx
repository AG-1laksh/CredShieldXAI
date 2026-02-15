import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { checkHealth, predictRisk } from './api/client';
import AssessmentForm from './components/AssessmentForm';
import DecisionSupportPanel from './components/DecisionSupportPanel';
import WhatIfSimulator from './components/WhatIfSimulator';
import XAIVisualization from './components/XAIVisualization';
import { computeConfidence, generateRecommendations, getFeatureLabel } from './constants/decisionSupport';
import { DEFAULT_FORM_VALUES } from './constants/formOptions';
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
      setError('Could not reach risk engine. Please check backend health and retry.');
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

      const confidence = computeConfidence(result);
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
      setApiHealth({ status: 'up', message: `${res.service} is online` });
    } catch (e) {
      setApiHealth({ status: 'down', message: 'Backend is unavailable. Please start API server.' });
    }
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

    const confidence = computeConfidence(prediction);
    const recommendations = generateRecommendations(formData, prediction);
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
    writeLine(`Confidence: ${confidence.band} (${confidenceText(confidence.score)})`);
    y += 2;

    writeLine('Input Summary:');
    Object.entries(formData).forEach(([key, value]) => {
      writeLine(`- ${getFeatureLabel(key)}: ${value}`, 6);
    });

    y += 2;
    writeLine('Top SHAP Risk-Increasing Factors:');
    (prediction.top_risk_increasing ?? []).slice(0, 3).forEach((item) => {
      writeLine(`- ${getFeatureLabel(item.feature)} (+${item.impact.toFixed(4)})`, 6);
    });

    y += 2;
    writeLine('Top SHAP Risk-Decreasing Factors:');
    (prediction.top_risk_decreasing ?? []).slice(0, 3).forEach((item) => {
      writeLine(`- ${getFeatureLabel(item.feature)} (${item.impact.toFixed(4)})`, 6);
    });

    y += 2;
    writeLine('Recommendations:');
    recommendations.forEach((tip) => writeLine(`- ${tip}`, 6));

    doc.save(`CrediShield_Report_${Date.now()}.pdf`);
  };

  const confidence = computeConfidence(prediction);
  const recommendations = generateRecommendations(formData, prediction);

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
    refreshHealth();
    const interval = setInterval(refreshHealth, 15000);
    return () => clearInterval(interval);
  }, []);

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
            <p>Neumorphic Cyber-Finance Intelligence Unit</p>
          </div>
          <div className={`${styles.healthBadge} ${styles[`health_${apiHealth.status}`]}`}>
            {apiHealth.message}
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.errorToast}>
           <span>{error}</span>
           <button className={styles.retryButton} onClick={() => runPrediction(formData)} type="button">
             Retry
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
          />

          {simulationEnabled && (
            <WhatIfSimulator
              formData={formData}
              onScenarioChange={updateField}
              isEnabled={simulationEnabled}
              loading={loading}
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
          />
        </div>

        <div className={styles.vizColumn}>
           <XAIVisualization prediction={prediction} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
