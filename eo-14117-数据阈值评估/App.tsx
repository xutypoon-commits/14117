
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import DataEntryForm from './components/DataEntryForm';
import EvaluationPanel from './components/EvaluationPanel';
import HistoricalTable from './components/HistoricalTable';
import { DataEntry } from './types';
import { INITIAL_ENTRY_STATE } from './constants';
import { calculateEvaluation } from './services/complianceLogic';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [formData, setFormData] = useState<Omit<DataEntry, 'id' | 'lastUpdated'>>(INITIAL_ENTRY_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('eo14117_entries_v3');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved entries");
      }
    }
  }, []);

  // Save to local storage when entries change
  useEffect(() => {
    localStorage.setItem('eo14117_entries_v3', JSON.stringify(entries));
  }, [entries]);

  const handleFormChange = (field: keyof Omit<DataEntry, 'id' | 'lastUpdated'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSave = () => {
    // Unique record check per Scenario + Date
    const duplicate = entries.find(e => 
      e.asOfDate === formData.asOfDate && 
      e.scenario === formData.scenario && 
      e.id !== editingId
    );
    if (duplicate) {
      setError(`该日期 [${formData.asOfDate}] 下的场景 [${formData.scenario}] 已有记录，请在下方列表中点击修改。`);
      return;
    }

    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? {
        ...formData,
        id: editingId,
        lastUpdated: Date.now()
      } : e));
    } else {
      const newEntry: DataEntry = {
        ...formData,
        id: crypto.randomUUID(),
        lastUpdated: Date.now()
      };
      setEntries(prev => [...prev, newEntry]);
    }

    setFormData(INITIAL_ENTRY_STATE);
    setEditingId(null);
    setError(null);
  };

  const handleDelete = () => {
    if (editingId) {
      setEntries(prev => prev.filter(e => e.id !== editingId));
      setFormData(INITIAL_ENTRY_STATE);
      setEditingId(null);
      setError(null);
    }
  };

  const handleSelectEntry = (entry: DataEntry) => {
    const { id, lastUpdated, ...rest } = entry;
    setFormData(rest);
    setEditingId(id);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const evalResult = useMemo(() => calculateEvaluation(formData), [formData]);

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                {editingId ? '正在修改评估记录' : '发起合规评估'}
              </h2>
              {editingId && (
                <button 
                  onClick={() => { setFormData(INITIAL_ENTRY_STATE); setEditingId(null); setError(null); }}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-200 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  放弃修改并新建
                </button>
              )}
            </div>
            <DataEntryForm 
              formData={formData} 
              onChange={handleFormChange}
              onSave={handleSave}
              onDelete={handleDelete}
              isExisting={!!editingId}
              error={error}
            />
          </div>

          {/* Right Column: Risk Dashboard */}
          <div className="lg:col-span-5">
            <EvaluationPanel result={evalResult} />
          </div>
        </div>

        {/* History Table */}
        <div className="mt-12">
          <HistoricalTable entries={entries} onSelect={handleSelectEntry} />
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-10 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] space-x-4">
          <span>机密文档</span>
          <span>&bull;</span>
          <span>内部合规评估工具</span>
          <span>&bull;</span>
          <span>遵循 12 个月滚动统计口径</span>
        </p>
        <p className="mt-2 text-[10px] text-slate-300 font-medium italic">
          依据 EO 14117：美国个人数据访问合规要求
        </p>
      </footer>
    </div>
  );
};

export default App;
