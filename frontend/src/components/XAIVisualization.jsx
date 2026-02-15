import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from './XAIVisualization.module.css';

// White/Blue/Orange Theme Colors
const COLORS = {
  highRisk: '#f97316', // Orange
  lowRisk: '#2563eb',  // Blue
  text: '#1e293b',     // Slate 800
  grid: '#e2e8f0',     // Slate 200
  tooltipBg: '#ffffff',
  tooltipBorder: '#cbd5e1',
  tooltipText: '#1e293b'
};

const FEATURE_LABELS_EN = {
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

const FEATURE_LABELS_HI = {
  checking_status: 'चेकिंग खाते में राशि',
  savings_status: 'बचत में राशि',
  duration: 'भुगतान समय',
  num__duration: 'भुगतान समय',
  credit_amount: 'लोन राशि',
  num__credit_amount: 'लोन राशि',
  installment_commitment: 'मासिक भुगतान भार',
  num__installment_commitment: 'मासिक भुगतान भार',
  purpose: 'लोन लेने का कारण',
};

const FEATURE_MEANINGS_EN = {
  checking_status: 'This shows the balance range in your checking account.',
  savings_status: 'This shows the balance range in your savings account.',
  duration: 'How many months you will take to repay the loan.',
  num__duration: 'How many months you will take to repay the loan.',
  credit_amount: 'The total money you want to borrow.',
  num__credit_amount: 'The total money you want to borrow.',
  installment_commitment: 'How heavy your monthly loan payments are (from low to high).',
  num__installment_commitment: 'How heavy your monthly loan payments are (from low to high).',
  purpose: 'The reason for taking the loan (car, business, home items, etc.).',
};

const FEATURE_MEANINGS_HI = {
  checking_status: 'यह आपके चेकिंग खाते की बैलेंस रेंज दिखाता है।',
  savings_status: 'यह आपके बचत खाते की बैलेंस रेंज दिखाता है।',
  duration: 'लोन चुकाने में कुल कितने महीने लगेंगे।',
  num__duration: 'लोन चुकाने में कुल कितने महीने लगेंगे।',
  credit_amount: 'आप कुल कितनी राशि उधार लेना चाहते हैं।',
  num__credit_amount: 'आप कुल कितनी राशि उधार लेना चाहते हैं।',
  installment_commitment: 'मासिक लोन भुगतान का भार (कम से अधिक)।',
  num__installment_commitment: 'मासिक लोन भुगतान का भार (कम से अधिक)।',
  purpose: 'लोन का उपयोग किस काम के लिए होगा।',
};

function getFeatureLabel(feature, language = 'en') {
  const dictionary = language === 'hi' ? FEATURE_LABELS_HI : FEATURE_LABELS_EN;
  if (dictionary[feature]) return dictionary[feature];
  const normalized = feature
    .replace('num__', '')
    .replaceAll('_', ' ')
    .trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getFeatureMeaning(feature, language = 'en') {
  const dictionary = language === 'hi' ? FEATURE_MEANINGS_HI : FEATURE_MEANINGS_EN;
  return dictionary[feature] ?? (language === 'hi'
    ? 'यह AI द्वारा जोखिम स्कोर निकालने में उपयोग होने वाला एक कारक है।'
    : 'This is one of the factors used by the AI to estimate loan risk.');
}

function getCaseImpactExplanation({ feature, impact, direction, language = 'en' }) {
  const magnitude = Math.abs(Number(impact) || 0);
  const strength = magnitude >= 0.5
    ? (language === 'hi' ? 'मजबूत' : 'strong')
    : magnitude >= 0.2
      ? (language === 'hi' ? 'मध्यम' : 'moderate')
      : (language === 'hi' ? 'हल्का' : 'mild');

  const label = getFeatureLabel(feature, language);

  if (language === 'hi') {
    return direction === 'up'
      ? `इस आवेदन में ${label} ने ${strength} रूप से जोखिम बढ़ाया।`
      : `इस आवेदन में ${label} ने ${strength} रूप से जोखिम घटाया।`;
  }

  return direction === 'up'
    ? `In this application, ${label} had a ${strength} risk-increasing effect.`
    : `In this application, ${label} had a ${strength} risk-reducing effect.`;
}

function ExplainabilityIntro({ t }) {
  return (
    <div className={styles.explainBox}>
      <p>
        {t.xaiExplain1}
      </p>
      <p>
        {t.xaiExplain2}
      </p>
    </div>
  );
}

function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function buildWaterfallData(prediction, language = 'en') {
  const items = [
    ...(prediction?.top_risk_increasing ?? []).map((item) => ({ ...item, direction: 'up' })),
    ...(prediction?.top_risk_decreasing ?? []).map((item) => ({ ...item, direction: 'down' })),
  ];
  if (!items.length) return [];

  return items.map((item) => ({
    feature: item.feature,
    featureLabel: getFeatureLabel(item.feature, language),
    featureMeaning: getFeatureMeaning(item.feature, language),
    impact: item.impact,
    impactAbs: Math.abs(item.impact),
    color: item.direction === 'up' ? COLORS.highRisk : COLORS.lowRisk,
    fillOpacity: 1,
  }));
}

export default function XAIVisualization({
  prediction,
  loading = false,
  language = 'en',
  t = {
    xaiTitle: 'XAI Visualization',
    xaiEmpty: 'Run an assessment to view risk gauge and SHAP waterfall.',
    xaiExplain1: 'XAI Visualization explains why AI produced this score.',
    xaiExplain2: 'SHAP shows which factors push risk up or down.',
    riskGauge: 'Risk Gauge',
    shapWaterfall: 'SHAP Waterfall',
    highRisk: 'High Risk',
    lowRisk: 'Low Risk',
    increaseRisk: 'Things Increasing Risk',
    decreaseRisk: 'Things Decreasing Risk',
    termsTitle: 'What These Terms Mean',
  },
}) {

  if (loading) {
    return (
      <section className={styles.card}>
        <div className={styles.header}>
            <h2>{t.xaiTitle}</h2>
        </div>
          <ExplainabilityIntro t={t} />
        <div className={styles.skeletonGrid}>
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </section>
    );
  }

  if (!prediction) {
    return (
      <section className={styles.card}>
        <div className={styles.header}>
          <h2>{t.xaiTitle}</h2>
          <ExplainabilityIntro t={t} />
          <p className={styles.empty}>{t.xaiEmpty}</p>
        </div>
      </section>
    );
  }

  const pd = prediction.probability_of_default;
  const isHighRisk = pd >= 0.5;
  const riskColor = isHighRisk ? COLORS.highRisk : COLORS.lowRisk;
  const gaugeData = [{ name: 'PD', value: pd * 100, fill: riskColor }];
  const waterfallData = buildWaterfallData(prediction, language);
  const featureGlossary = Array.from(new Map(
    [...(prediction.top_risk_increasing ?? []), ...(prediction.top_risk_decreasing ?? [])]
      .map((item) => [item.feature, { key: item.feature, label: getFeatureLabel(item.feature, language), meaning: getFeatureMeaning(item.feature, language) }])
  ).values());

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>{t.xaiTitle}</h2>
      </div>
      <ExplainabilityIntro t={t} />

      <div className={styles.panels}>
        <div className={styles.panel}>
          <h3>{t.riskGauge}</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={240}>
              <RadialBarChart
                cx="50%"
                cy="70%"
                innerRadius="65%"
                outerRadius="100%"
                barSize={20}
                data={gaugeData}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#e2e8f0' }} dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '70%', left: '0', right: '0', textAlign: 'center', transform: 'translateY(-50%)' }}>
               <p className={styles.score} style={{color: riskColor, margin: 0}}>{formatPct(pd)}</p>
               <span className={styles.verdict} style={{
                    color: riskColor,
                    background: isHighRisk ? 'rgba(249, 115, 22, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                    border: `1px solid ${isHighRisk ? 'rgba(249, 115, 22, 0.2)' : 'rgba(37, 99, 235, 0.2)'}`
                }}>
                    {isHighRisk ? t.highRisk : t.lowRisk}
                </span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <h3>{t.shapWaterfall}</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={waterfallData} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="feature" 
                  tickFormatter={(label) => getFeatureLabel(label, language)}
                    tick={{ fill: COLORS.text, fontSize: 11, fontWeight: 500 }} 
                    interval={0} 
                    angle={-20} 
                    textAnchor="end" 
                    height={60} 
                    tickLine={false}
                    axisLine={{ stroke: COLORS.grid }}
                />
                <YAxis 
                    tick={{ fill: COLORS.text, fontSize: 11, fontWeight: 500 }} 
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                  cursor={{fill: 'rgba(37, 99, 235, 0.05)'}}
                  labelFormatter={(label) => getFeatureLabel(label, language)}
                  contentStyle={{ 
                      background: COLORS.tooltipBg, 
                      border: `1px solid ${COLORS.tooltipBorder}`, 
                      borderRadius: '8px', 
                      color: COLORS.text,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                  }}
                  itemStyle={{ color: COLORS.text, fontWeight: 600 }}
                  labelStyle={{ color: COLORS.text, fontWeight: 700 }}
                  formatter={(value) => Number(value).toFixed(4)}
                />
                <Bar dataKey="impactAbs" name="|SHAP Impact|" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
       <div className={styles.reasons}>
        <div>
          <h4 style={{color: COLORS.highRisk}}>{t.increaseRisk}</h4>
          <ul>
            {(prediction.top_risk_increasing ?? []).map((r, i) => (
              <li key={`inc-${i}`}>
                <span>
                  <span className={styles.reasonFeature}>{getFeatureLabel(r.feature, language)}</span>
                  <span className={styles.reasonMeaning}>{getCaseImpactExplanation({ feature: r.feature, impact: r.impact, direction: 'up', language })}</span>
                </span>
                <span style={{color: COLORS.highRisk, fontWeight: 700}}>+{r.impact.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{color: COLORS.lowRisk}}>{t.decreaseRisk}</h4>
          <ul>
            {(prediction.top_risk_decreasing ?? []).map((r, i) => (
              <li key={`dec-${i}`}>
                <span>
                  <span className={styles.reasonFeature}>{getFeatureLabel(r.feature, language)}</span>
                  <span className={styles.reasonMeaning}>{getCaseImpactExplanation({ feature: r.feature, impact: r.impact, direction: 'down', language })}</span>
                </span>
                <span style={{color: COLORS.lowRisk, fontWeight: 700}}>{r.impact.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.termGlossary}>
        <h4>{t.termsTitle}</h4>
        <ul>
          {featureGlossary.map((term) => (
            <li key={term.key}>
              <strong>{term.label}</strong>
              <span>{term.meaning}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
