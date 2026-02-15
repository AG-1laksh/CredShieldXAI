const FEATURE_LABELS = {
  checking_status: 'Money in Checking Account',
  savings_status: 'Money in Savings',
  duration: 'Repayment Time',
  num__duration: 'Repayment Time',
  credit_amount: 'Loan Amount',
  num__credit_amount: 'Loan Amount',
  installment_commitment: 'Monthly Payment Burden',
  num__installment_commitment: 'Monthly Payment Burden',
  purpose: 'Why You Need the Loan',
};

export function getFeatureLabel(feature) {
  if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature];
  const normalized = feature
    .replace('num__', '')
    .replaceAll('_', ' ')
    .trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function computeConfidence(prediction) {
  const pd = prediction?.probability_of_default;
  if (typeof pd !== 'number') {
    return { band: 'Unknown', score: 0, rationale: 'Run an assessment to calculate confidence.' };
  }

  const normalizedMargin = Math.min(1, Math.abs(pd - 0.5) * 2);
  const impacts = [
    ...(prediction?.top_risk_increasing ?? []).map((x) => Math.abs(x.impact)),
    ...(prediction?.top_risk_decreasing ?? []).map((x) => Math.abs(x.impact)),
  ].sort((a, b) => b - a);

  const totalImpact = impacts.reduce((sum, value) => sum + value, 0);
  const topTwo = (impacts[0] ?? 0) + (impacts[1] ?? 0);
  const topShare = totalImpact > 0 ? topTwo / totalImpact : 0.5;
  const score = 0.65 * normalizedMargin + 0.35 * topShare;

  if (score >= 0.72) {
    return {
      band: 'High',
      score,
      rationale: 'Prediction is far from the decision boundary and key factors are consistent.',
    };
  }
  if (score >= 0.48) {
    return {
      band: 'Medium',
      score,
      rationale: 'Prediction is reasonably stable but can change with moderate input shifts.',
    };
  }

  return {
    band: 'Low',
    score,
    rationale: 'Prediction is near the boundary or spread across many competing factors.',
  };
}

function addTip(tips, value) {
  if (!tips.includes(value)) {
    tips.push(value);
  }
}

export function generateRecommendations(formData, prediction) {
  if (!prediction) return [];

  const tips = [];
  const increasing = prediction?.top_risk_increasing ?? [];
  const higherRiskSet = new Set(increasing.map((x) => x.feature));

  if (higherRiskSet.has('credit_amount') || higherRiskSet.has('num__credit_amount')) {
    const reduced = Math.max(250, Math.round((Number(formData.credit_amount) || 0) * 0.9));
    addTip(tips, `Reduce loan amount closer to ₹${reduced.toLocaleString('en-IN')} if possible.`);
  }

  if (higherRiskSet.has('duration') || higherRiskSet.has('num__duration')) {
    const shorter = Math.max(6, (Number(formData.duration) || 24) - 6);
    addTip(tips, `Try a shorter repayment time around ${shorter} months if affordable.`);
  }

  if (higherRiskSet.has('installment_commitment') || higherRiskSet.has('num__installment_commitment')) {
    addTip(tips, 'Lower monthly payment burden by adjusting loan amount or tenure balance.');
  }

  if (higherRiskSet.has('savings_status')) {
    addTip(tips, 'Move to a higher savings bucket before applying to improve trust profile.');
  }

  if (higherRiskSet.has('checking_status')) {
    addTip(tips, 'Maintain a healthier checking account balance for a few months before application.');
  }

  if (higherRiskSet.has('purpose')) {
    addTip(tips, 'If feasible, choose an essential/low-risk loan purpose category.');
  }

  addTip(tips, 'Use the What-If Simulator and save scenarios before final submission.');

  return tips.slice(0, 5);
}

export function summarizeTopFactors(prediction, count = 2) {
  const factors = prediction?.top_risk_increasing ?? [];
  return factors.slice(0, count).map((item) => getFeatureLabel(item.feature)).join(', ') || 'N/A';
}
