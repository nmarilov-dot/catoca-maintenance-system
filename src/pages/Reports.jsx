import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, FileText, ChevronRight, Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Reports = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('downtime');
  const [timeRange, setTimeRange] = useState('month');

  const reportCards = [
    { id: 'downtime', title: 'Отчет по простоям', icon: Clock, color: 'text-accent-red', description: 'Анализ времени простоя по каждой единице оборудования.' },
    { id: 'maintenance', title: 'Эффективность ТО', icon: Activity, color: 'text-primary', description: 'Статистика выполнения заявок и качество работ.' },
    { id: 'parts', title: 'Расход запчастей', icon: FileText, color: 'text-accent-yellow', description: 'Учет использованных ТМЦ и планирование закупок.' },
    { id: 'reliability', title: 'Надежность оборудования', icon: AlertTriangle, color: 'text-orange-500', description: 'Среднее время между отказами (MTBF).' },
  ];

  return (
    <div className="p-4 md:p-8 h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-primary w-6 h-6" />
            {t('nav.reports')}
          </h1>
          <p className="text-text-muted text-sm mt-1">Аналитические отчеты и производственные показатели</p>
        </div>
        
        <button className="bg-primary hover:bg-primary-dark text-dark-bg px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/20">
          <Download className="w-5 h-5" />
          ВЫГРУЗИТЬ В EXCEL
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportCards.map(card => (
          <div 
            key={card.id}
            onClick={() => setReportType(card.id)}
            className={`p-6 bg-dark-surface border rounded-2xl cursor-pointer transition-all relative overflow-hidden group ${
              reportType === card.id ? 'border-primary ring-1 ring-primary' : 'border-dark-border hover:border-primary/50'
            }`}
          >
            <div className={`p-3 rounded-xl bg-dark-bg border border-dark-border w-fit mb-4 group-hover:scale-110 transition-transform ${card.color}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white mb-2">{card.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{card.description}</p>
            {reportType === card.id && (
              <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 bg-dark-surface border border-dark-border rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-6 border-b border-dark-border bg-dark-bg/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 bg-dark-bg border border-dark-border p-1 rounded-xl">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'week' ? 'bg-primary text-dark-bg shadow-lg shadow-primary/10' : 'text-text-muted hover:text-white'}`}
            >
              Неделя
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'month' ? 'bg-primary text-dark-bg shadow-lg shadow-primary/10' : 'text-text-muted hover:text-white'}`}
            >
              Месяц
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'year' ? 'bg-primary text-dark-bg shadow-lg shadow-primary/10' : 'text-text-muted hover:text-white'}`}
            >
              Квартал
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-text-muted bg-dark-bg px-4 py-2 rounded-xl border border-dark-border">
              <Calendar className="w-4 h-4" />
              <span>01.05.2024 — 31.05.2024</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-border/50">
              <BarChart3 className="w-10 h-10 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">Подготовка данных...</h3>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">Система генерирует подробный отчет по выбранным критериям. Это может занять несколько секунд.</p>
            <div className="w-full h-1 bg-dark-bg rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
