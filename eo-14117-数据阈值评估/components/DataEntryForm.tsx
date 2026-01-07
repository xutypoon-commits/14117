
import React, { useState } from 'react';
import { DataEntry, AccessScenario } from '../types';
import { SCENARIOS } from '../constants';

interface Props {
  formData: Omit<DataEntry, 'id' | 'lastUpdated'>;
  onChange: (field: keyof Omit<DataEntry, 'id' | 'lastUpdated'>, value: any) => void;
  onSave: () => void;
  onDelete: () => void;
  isExisting: boolean;
  error?: string | null;
}

const DataEntryForm: React.FC<Props> = ({ formData, onChange, onSave, onDelete, isExisting, error }) => {
  const [displayValues, setDisplayValues] = useState<Record<string, string>>({});

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/\D/g, '');
    setDisplayValues(prev => ({ ...prev, [name]: sanitizedValue }));
    const numericValue = sanitizedValue === '' ? 0 : parseInt(sanitizedValue, 10);
    onChange(name as any, numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDisplayValues(prev => ({ ...prev, [name]: value }));
    e.target.select();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setDisplayValues(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const getWindowDates = (asOf: string) => {
    if (!asOf) return { start: '-', end: '-' };
    const end = new Date(asOf);
    const start = new Date(asOf);
    start.setFullYear(start.getFullYear() - 1);
    // Note: To be exact on "rolling 12 months preceding", 
    // we use the YYYY-MM-DD of the same day last year.
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const { start, end } = getWindowDates(formData.asOfDate);

  const scenarioLabels: Record<AccessScenario, string> = {
    'Internal Staff (Combined)': '内部员工 (合并统计)',
    'External App – Trustoo Email Popups': '外部应用 - Trustoo Email Popups',
    'External App – 17TRACK': '外部应用 - 17TRACK',
    'External App – QuickCEP': '外部应用 - QuickCEP'
  };

  const coverageFields = [
    { name: 'ipAddress', label: 'IP 地址', group: '网络标识符' },
    { name: 'clientIdCookie', label: 'Client ID Cookie', group: '网络标识符' },
    { name: 'email', label: '电子邮件', group: '人口统计学数据' },
    { name: 'phoneNumber', label: '电话号码', group: '人口统计学数据' },
    { name: 'name', label: '姓名', group: '人口统计学数据' },
    { name: 'address', label: '邮寄地址', group: '人口统计学数据' },
    { name: 'zipCode', label: '邮政编码', group: '人口统计学数据' },
    { name: 'dateOfBirth', label: '出生日期', group: '人口统计学数据' },
  ];

  const inputClass = "w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">一、评估场景与统计周期</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>统计截止日期</label>
            <input 
              type="date" 
              name="asOfDate"
              value={formData.asOfDate}
              onChange={(e) => onChange('asOfDate', e.target.value)}
              className={inputClass} 
            />
          </div>
          <div>
            <label className={labelClass}>涉及的评估场景</label>
            <select 
              name="scenario"
              value={formData.scenario}
              onChange={(e) => onChange('scenario', e.target.value as AccessScenario)}
              className={inputClass}
            >
              {SCENARIOS.map(s => <option key={s} value={s}>{scenarioLabels[s]}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">
          二、{start} 至 {end} 期间涉及的美国用户人数
        </h2>

        {formData.scenario === 'Internal Staff (Combined)' && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg animate-in fade-in slide-in-from-top-2">
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              内部人员数据填写说明
            </h4>
            
            <div className="space-y-4">
              <p className="text-[12px] text-indigo-800 leading-snug">
                此处填写的是所有内部员工<strong>合并去重后</strong>可接触到的美国用户人数。请勿直接累加各员工的独立访问量。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/60 p-2.5 rounded border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">示例：无数据重叠</span>
                  <p className="text-[11px] text-indigo-900">
                    员工 A 和 B 分别接触 100 名<strong>不同</strong>的人。<br/>
                    <strong className="text-indigo-600 font-black">应填写：200</strong>
                  </p>
                </div>
                <div className="bg-white/60 p-2.5 rounded border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">示例：有数据重叠</span>
                  <p className="text-[11px] text-indigo-900">
                    员工 A 和 B 均接触 100 人，其中 50 人为<strong>同一批人</strong>。<br/>
                    <strong className="text-indigo-600 font-black">应填写：150</strong> (去重后人数)
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-bold text-indigo-700 p-2 bg-white/40 rounded italic border-l-2 border-indigo-400">
                注意：统计单位是“自然人数量”，而非数据记录行数。
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {coverageFields.map(field => {
            const displayValue = displayValues[field.name] !== undefined 
              ? displayValues[field.name] 
              : (formData[field.name as keyof typeof formData] || 0).toString();

            return (
              <div key={field.name}>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass}>{field.label}</label>
                  <span className={`text-[9px] font-black uppercase px-1 rounded ${field.group === '网络标识符' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                    {field.group}
                  </span>
                </div>
                <input 
                  type="text"
                  inputMode="numeric"
                  name={field.name}
                  value={displayValue}
                  onChange={handleNumericChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={inputClass}
                  autoComplete="off"
                />
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 sticky bottom-0 bg-white py-4 border-t shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <button 
          onClick={onSave}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
        >
          保存
        </button>
        {isExisting && (
          <button 
            onClick={onDelete}
            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
          >
            删除记录
          </button>
        )}
      </div>
    </div>
  );
};

export default DataEntryForm;
