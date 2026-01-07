
import React from 'react';
import { EvaluationResult, RiskLevel } from '../types';

interface Props {
  result: EvaluationResult;
}

const getRiskConfig = (level: RiskLevel) => {
  switch (level) {
    case 'Critical':
    case 'High Risk':
      return { bg: 'bg-red-600', text: 'text-white', label: '高风险状态', border: 'border-red-700' };
    case 'Medium Risk':
      return { bg: 'bg-yellow-400', text: 'text-slate-900', label: '中等风险', border: 'border-yellow-500' };
    case 'Low Risk':
      return { bg: 'bg-green-500', text: 'text-white', label: '低风险 (未接近阈值)', border: 'border-green-600' };
  }
};

const EvaluationPanel: React.FC<Props> = ({ result }) => {
  const risk = getRiskConfig(result.riskLevel);
  const isHighRisk = result.riskLevel === 'High Risk' || result.riskLevel === 'Critical';

  return (
    <div className="space-y-4 sticky top-[100px]">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">评估结果</h2>
      
      {/* Primary Risk Status Card */}
      <div className={`p-6 rounded-2xl shadow-lg border-b-8 transition-all duration-500 ${risk.bg} ${risk.text} ${risk.border}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">当前合规风险状态</p>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-black tracking-tight">{risk.label}</h3>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black leading-none">{result.utilization.toFixed(0)}%</span>
            <p className="text-[10px] font-bold uppercase opacity-80 tracking-tighter">已用配额比例</p>
          </div>
        </div>
        
        <div className="mt-6 h-3 bg-black/10 rounded-full overflow-hidden border border-white/10">
          <div 
            className="h-full bg-white transition-all duration-700"
            style={{ width: `${Math.min(100, result.utilization)}%` }}
          ></div>
        </div>
        
        <div className="mt-3 flex justify-between text-[11px] font-bold">
          <span className="opacity-90">距离合规阈值仍有:</span>
          <span>{result.gap <= 0 ? '已超限' : `${result.gap.toLocaleString()} 美国个人`}</span>
        </div>
      </div>

      {isHighRisk && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-pulse">
          <p className="text-xs font-bold text-red-700 leading-relaxed text-center">
            强烈建议采取美国本地化运营部署，否则可能面临 EO 14117 的合规处罚风险。
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluationPanel;
