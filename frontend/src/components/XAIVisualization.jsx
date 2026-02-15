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

function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function buildWaterfallData(prediction) {
  const items = [
    ...(prediction?.top_risk_increasing ?? []).map((item) => ({ ...item, direction: 'up' })),
    ...(prediction?.top_risk_decreasing ?? []).map((item) => ({ ...item, direction: 'down' })),
  ];
  if (!items.length) return [];

  return items.map((item) => ({
    feature: item.feature,
    impact: item.impact,
    impactAbs: Math.abs(item.impact),
    color: item.direction === 'up' ? COLORS.highRisk : COLORS.lowRisk,
    fillOpacity: 1,
  }));
}

export default function XAIVisualization({ prediction, loading = false }) {

  if (loading) {
    return (
      <section className={styles.card}>
        <div className={styles.header}>
           <h2>XAI Visualization</h2>
        </div>
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
            <h2>XAI Visualization</h2>
            <p className={styles.empty}>Run an assessment to view risk gauge and SHAP waterfall.</p>
        </div>
      </section>
    );
  }

  const pd = prediction.probability_of_default;
  const isHighRisk = pd >= 0.5;
  const riskColor = isHighRisk ? COLORS.highRisk : COLORS.lowRisk;
  const gaugeData = [{ name: 'PD', value: pd * 100, fill: riskColor }];
  const waterfallData = buildWaterfallData(prediction);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2>XAI Visualization</h2>
      </div>

      <div className={styles.panels}>
        <div className={styles.panel}>
          <h3>Risk Gauge</h3>
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
                    {isHighRisk ? 'High Risk' : 'Low Risk'}
                </span>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <h3>SHAP Waterfall</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={waterfallData} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="feature" 
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
          <h4 style={{color: COLORS.highRisk}}>Top Risk-Increasing</h4>
          <ul>
            {(prediction.top_risk_increasing ?? []).map((r, i) => (
              <li key={`inc-${i}`}>
                <span>{r.feature}</span>
                <span style={{color: COLORS.highRisk, fontWeight: 700}}>+{r.impact.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{color: COLORS.lowRisk}}>Top Risk-Decreasing</h4>
          <ul>
            {(prediction.top_risk_decreasing ?? []).map((r, i) => (
              <li key={`dec-${i}`}>
                <span>{r.feature}</span>
                <span style={{color: COLORS.lowRisk, fontWeight: 700}}>{r.impact.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
