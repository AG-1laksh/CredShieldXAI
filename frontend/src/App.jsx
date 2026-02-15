import { useEffect, useState } from 'react';
import { predictRisk } from './api/client';
import AssessmentForm from './components/AssessmentForm';
import WhatIfSimulator from './components/WhatIfSimulator';
import XAIVisualization from './components/XAIVisualization';
import { DEFAULT_FORM_VALUES } from './constants/formOptions';
import styles from './App.module.css';

function App() {
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationEnabled, setSimulationEnabled] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const runPrediction = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const result = await predictRisk(payload);
      setPrediction(result);
      return result;
    } catch (err) {
      console.error('runPrediction failed in App', err);
      // More user-friendly error message can be parsed here if needed
      setError(err.message || 'Connection failed. Ensure the AI secure link is active.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAssessRisk = async () => {
    const result = await runPrediction(formData);
    if (result) {
      setSimulationEnabled(true);
      // Wait for layout animation if needed
    }
  };

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
        <h1>CrediShield XAI</h1>
        <p>Neumorphic Cyber-Finance Intelligence Unit</p>
      </header>

      {error && (
        <div className={styles.errorToast}>
           <span>{error}</span>
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
        </div>

        <div className={styles.vizColumn}>
           <XAIVisualization prediction={prediction} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
