
import React, { useState, useMemo } from 'react';
import { DataEntry, EvaluationResult, RiskLevel } from '../types';
import { calculateEvaluation } from '../services/complianceLogic';

interface Props {
  entries: DataEntry[];
  onSelect: (entry: DataEntry) => void;
}

const getRiskBadge = (level: RiskLevel) => {
  switch (level) {
    case 'Critical': 
    case 'High Risk': return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium Risk': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low Risk': return 'bg-green-100 text-green-700 border-green-200';
  }
};

const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
      case 'Critical': 
      case 'High Risk': return '高风险';
      case 'Medium Risk': return '中等风险';
      case 'Low Risk': return '低风险';
    }
};

const scenarioLabels: Record<string, string> = {
    'Internal Staff (Combined)': '内部员工 (合并)',
    'External App – Trustoo Email Popups': '外部应用 - Trustoo Email Popups',
    'External App – 17TRACK': '外部应用 - 17TRACK',
    'External App – QuickCEP': '外部应用 - QuickCEP'
};

const HistoricalTable: React.FC<Props> = ({ entries, onSelect }) => {
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterScenario, setFilterScenario] = useState('');

  const tableData = useMemo(() => {
    let filtered = entries.map(entry => {
      const evalResult = calculateEvaluation(entry);
      return { ...entry, evalResult };
    });

    if (filterPeriod) {
      filtered = filtered.filter(e => e.asOfDate.startsWith(filterPeriod));
    }
    if (filterScenario) {
      filtered = filtered.filter(e => e.scenario === filterScenario);
    }

    return filtered.sort((a, b) => new Date(b.asOfDate).getTime() - new Date(a.asOfDate).getTime());
  }, [entries, filterPeriod, filterScenario]);

  const uniqueMonths = Array.from(new Set<string>(entries.map(e => e.asOfDate.slice(0, 7)))).sort().reverse();
  const uniqueScenarios: string[] = Array.from(new Set<string>(entries.map(e => e.scenario as string))).sort();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">历史评估记录</h2>
        <div className="flex gap-2">
          <select 
            className="text-xs border rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-blue-500"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="">全部月份</option>
            {uniqueMonths.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            className="text-xs border rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-blue-500"
            value={filterScenario}
            onChange={(e) => setFilterScenario(e.target.value)}
          >
            <option value="">评估场景</option>
            {uniqueScenarios.map((s: string) => <option key={s} value={s}>{scenarioLabels[s] || s}</option>)}
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider">
              <th className="px-4 py-3">统计截止日期</th>
              <th className="px-4 py-3">评估场景</th>
              <th className="px-4 py-3">规管组合人数</th>
              <th className="px-4 py-3">风险等级</th>
              <th className="px-4 py-3">配额比例</th>
              <th className="px-4 py-3">修改时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.length > 0 ? tableData.map(item => (
              <tr 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 font-semibold text-slate-700">{item.asOfDate}</td>
                <td className="px-4 py-3 text-slate-600">{scenarioLabels[item.scenario as string] || item.scenario}</td>
                <td className="px-4 py-3 font-black text-slate-900">{item.evalResult.estimatedPersons.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded border font-bold text-[9px] uppercase tracking-wider ${getRiskBadge(item.evalResult.riskLevel)}`}>
                    {getRiskLabel(item.evalResult.riskLevel)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-700 w-8 text-right">{item.evalResult.utilization.toFixed(0)}%</span>
                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.evalResult.utilization >= 100 ? 'bg-red-500' : 'bg-slate-400'}`}
                        style={{ width: `${Math.min(100, item.evalResult.utilization)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(item.lastUpdated).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-medium italic">
                  暂无历史评估记录。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalTable;
