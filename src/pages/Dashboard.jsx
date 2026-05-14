import React, { useState, useMemo } from 'react';
import { MOCK_EQUIPMENT, MOCK_TICKETS, MOCK_DOWNTIME_LOG } from '../api/mockData';
import { 
  Activity, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Settings2, 
  Wrench, 
  X, 
  MessageSquare, 
  Languages, 
  Send, 
  User as UserIcon,
  Info,
  LayoutDashboard,
  Plus,
  History
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, subDays, isAfter } from 'date-fns';
import { ru, ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';

const TopDowntimeItem = ({ name, hours, status, maxHours, t }) => {
  const percentage = (hours / maxHours) * 100;
  const statusColors = {
    working: 'bg-green-500',
    ppm: 'bg-accent-yellow',
    not_working: 'bg-accent-red'
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[11px]">
        <div className="flex items-center gap-2 max-w-[70%]">
          <div className={`w-2 h-2 rounded-full shrink-0 ${statusColors[status] || 'bg-gray-500'} animate-pulse`}></div>
          <span className="text-text-main font-medium truncate">{name}</span>
        </div>
        <span className="text-accent-red font-bold">{hours}h</span>
      </div>
      <div className="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden border border-dark-border/30">
        <div 
          className="h-full bg-gradient-to-r from-primary/40 to-accent-red transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { period, setPeriod } = useUI();
  const [selectedDowntimeId, setSelectedDowntimeId] = useState(null);
  const [isDowntimeModalOpen, setIsDowntimeModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [ticketViewId, setTicketViewId] = useState(null);
  const [ticketComment, setTicketComment] = useState('');

  const [tickets, setTickets] = useState(MOCK_TICKETS);

  const filteredData = useMemo(() => {
    const now = new Date();
    let daysToSub = 7;
    if (period === 'today') daysToSub = 1;
    if (period === 'month') daysToSub = 30;
    if (period === 'year') daysToSub = 365;

    const startDate = subDays(now, daysToSub);

    const periodTickets = tickets.filter(tk => isAfter(new Date(tk.createdAt), startDate));
    
    const downtimeMap = periodTickets.reduce((acc, tk) => {
      const eid = tk.equipmentId;
      if (!acc[eid]) acc[eid] = 0;
      acc[eid] += (tk.downtimeDuration || 0);
      return acc;
    }, {});

    const periodDowntimes = Object.entries(downtimeMap).map(([equipmentId, hours]) => ({
      equipmentId,
      hours
    }));

    return { tickets: periodTickets, downtimes: periodDowntimes };
  }, [period, tickets]);

  const stats = useMemo(() => {
    const { tickets } = filteredData;
    return {
      total: tickets.length,
      inWork: tickets.filter(t => t.status !== 'completed').length,
      done: tickets.filter(t => t.status === 'completed').length,
      accidents: tickets.filter(t => t.type === 'accident').length,
      ppms: tickets.filter(t => t.type === 'ppm').length,
      warnings: tickets.filter(t => t.type === 'warning').length,
    };
  }, [filteredData]);

  const topDowntime = useMemo(() => {
    const { downtimes } = filteredData;
    const sorted = [...downtimes].sort((a, b) => b.hours - a.hours).slice(0, 7);
    return sorted.map(d => ({
      ...d,
      equipmentName: MOCK_EQUIPMENT.find(e => e.id === d.equipmentId)?.name || 'N/A',
      status: MOCK_EQUIPMENT.find(e => e.id === d.equipmentId)?.status || 'working'
    }));
  }, [filteredData]);

  const maxDowntime = topDowntime[0]?.hours || 100;

  const filteredTickets = useMemo(() => {
    return filteredData.tickets
      .filter(t => {
        if (filterMode === 'all') return true;
        if (filterMode === 'in_work') return t.status !== 'completed';
        if (filterMode === 'completed') return t.status === 'completed';
        return t.type === filterMode;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [filteredData, filterMode]);

  const dateRangeLabel = useMemo(() => {
    const now = new Date();
    const endStr = format(now, 'dd.MM.yyyy');
    if (period === 'today') return endStr;
    
    let days = 7;
    if (period === 'month') days = 30;
    if (period === 'year') days = 365;
    
    const startStr = format(subDays(now, days), 'dd.MM.yyyy');
    return `${startStr} - ${endStr}`;
  }, [period]);

  const modalTotalDowntime = useMemo(() => {
    return filteredData.tickets
      .filter(tk => tk.equipmentId === selectedDowntimeId)
      .reduce((sum, tk) => sum + (tk.downtimeDuration || 0), 0);
  }, [filteredData.tickets, selectedDowntimeId]);
  
  const getEquipmentName = (id) => MOCK_EQUIPMENT.find(e => e.id === id)?.name || t('common.unknown');
  const dateLocale = i18n.language === 'pt' ? ptBR : ru;

  const autoTranslate = (text, targetLang) => {
    if (targetLang === 'pt') return `[Traduzido] ${text} (Simulação)`;
    return `[Переведено] ${text} (Имитация)`;
  };

  const CommentItem = ({ comment, currentLang, t }) => {
    const [showOriginal, setShowOriginal] = useState(false);
    const commentLang = comment.lang || 'ru';
    const needsTranslation = commentLang !== currentLang;
    const displayText = (needsTranslation && !showOriginal) ? autoTranslate(comment.text, currentLang) : comment.text;

    return (
      <div className="flex gap-3">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-primary">{comment.authorName.charAt(0)}</span>
        </div>
        <div className="bg-dark-surface-light p-3 rounded-xl flex-1 border border-dark-border">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary">{comment.authorName}</span>
              {needsTranslation && (
                <span className="flex items-center gap-1 text-[9px] text-primary/60 px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
                  <Languages className="w-2.5 h-2.5" /> {t('tickets.translated_label')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-text-muted">{format(new Date(comment.timestamp), 'HH:mm')}</span>
          </div>
          <p className="text-xs text-text-main leading-relaxed">{displayText}</p>
          {needsTranslation && (
            <button onClick={() => setShowOriginal(!showOriginal)} className="mt-2 text-[10px] text-primary hover:underline font-medium">
              {showOriginal ? t('tickets.show_translated') : t('tickets.show_original')}
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleAddComment = (ticketId) => {
    if (!commentText.trim()) return;
    const updatedTickets = tickets.map(t => t.id === ticketId ? { 
      ...t, 
      comments: [...t.comments, { id: `c-${Date.now()}`, authorName: user?.name || 'Администратор', text: commentText, timestamp: new Date().toISOString(), lang: i18n.language }] 
    } : t);
    setTickets(updatedTickets);
    setCommentText('');
  };

  const handleAddModalComment = (ticketId) => {
    if (!ticketComment.trim()) return;
    const updatedTickets = tickets.map(t => t.id === ticketId ? { 
      ...t, 
      comments: [...t.comments, { id: `c-${Date.now()}`, authorName: user?.name || 'Администратор', text: ticketComment, timestamp: new Date().toISOString(), lang: i18n.language }] 
    } : t);
    setTickets(updatedTickets);
    setTicketComment('');
  };

  const getDynamicTitle = () => {
    const base = t('dashboard.recent_tickets').toUpperCase();
    if (filterMode === 'all') return base;
    
    let label = '';
    let colorClass = '';
    
    switch(filterMode) {
      case 'in_work': label = t('tickets.status_process'); colorClass = 'text-blue-400'; break;
      case 'completed': label = t('tickets.status_done'); colorClass = 'text-green-500'; break;
      case 'accident': label = t('tickets.type_accident'); colorClass = 'text-accent-red'; break;
      case 'warning': label = t('tickets.type_warning'); colorClass = 'text-yellow-400'; break;
      case 'ppm': label = t('tickets.type_ppm'); colorClass = 'text-accent-yellow'; break;
      default: label = '';
    }
    
    return (
      <span className="flex items-center gap-2">
        {base}: <span className={colorClass}>{label.toUpperCase()}</span>
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar">
      {/* Header with Centered Period Selector */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                {t('dashboard.title')}
              </h1>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 p-1 bg-dark-surface/30 border border-dark-border/50 rounded-2xl">
              {[
                { id: 'today', label: t('common.today') },
                { id: 'week', label: t('common.week') },
                { id: 'month', label: t('common.month') },
                { id: 'year', label: t('common.year') }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                    period === p.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {p.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block w-[200px]"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* ВСЕГО */}
        <div 
          onClick={() => setFilterMode('all')}
          className={`bg-dark-surface border rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer transition-all ${filterMode === 'all' ? 'border-primary ring-1 ring-primary' : 'border-dark-border hover:border-primary/50'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-primary/20 rounded-xl"><Settings2 className="w-6 h-6 text-primary" /></div>
            <span className={`text-[10px] font-bold bg-dark-bg px-2 py-1 rounded-lg uppercase tracking-widest transition-colors ${filterMode === 'all' ? 'text-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-text-muted'}`}>
              {t('tickets.filter_all').toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 relative">{stats.total}</h3><p className="text-[10px] text-text-muted relative uppercase">{t('dashboard.recent_tickets')}</p>
        </div>

        {/* В РАБОТЕ (ОТКРЫТЫЕ) */}
        <div 
          onClick={() => setFilterMode('in_work')}
          className={`bg-dark-surface border rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer transition-all ${filterMode === 'in_work' ? 'border-blue-400 ring-1 ring-blue-400' : 'border-dark-border hover:border-blue-400/50'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400/10 rounded-full group-hover:scale-110 transition-transform pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-blue-400/20 rounded-xl"><Clock className="w-6 h-6 text-blue-400" /></div>
            <span className={`text-[10px] font-bold bg-dark-bg px-2 py-1 rounded-lg uppercase tracking-widest transition-colors ${filterMode === 'in_work' ? 'text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]' : 'text-text-muted'}`}>
              {t('tickets.status_process').toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 relative">{stats.inWork}</h3><p className="text-[10px] text-text-muted relative uppercase">{t('dashboard.active_in_work')}</p>
        </div>

        {/* ГОТОВО (ЗАКРЫТЫЕ) */}
        <div 
          onClick={() => setFilterMode('completed')}
          className={`bg-dark-surface border rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer transition-all ${filterMode === 'completed' ? 'border-green-500 ring-1 ring-green-500' : 'border-dark-border hover:border-green-500/50'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-110 transition-transform pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-green-500/20 rounded-xl"><CheckCircle className="w-6 h-6 text-green-500" /></div>
            <span className={`text-[10px] font-bold bg-dark-bg px-2 py-1 rounded-lg uppercase tracking-widest transition-colors ${filterMode === 'completed' ? 'text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-text-muted'}`}>
              {t('tickets.status_done').toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 relative">{stats.done}</h3><p className="text-[10px] text-text-muted relative uppercase">{t('tickets.filter_completed')}</p>
        </div>

        {/* ППР */}
        <div 
          onClick={() => setFilterMode('ppm')}
          className={`bg-dark-surface border rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer transition-all ${filterMode === 'ppm' ? 'border-accent-yellow ring-1 ring-accent-yellow' : 'border-dark-border hover:border-accent-yellow/50'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-yellow/10 rounded-full group-hover:scale-110 transition-transform pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-accent-yellow/20 rounded-xl"><Wrench className="w-6 h-6 text-accent-yellow" /></div>
            <span className={`text-[10px] font-bold bg-dark-bg px-2 py-1 rounded-lg uppercase tracking-widest transition-colors ${filterMode === 'ppm' ? 'text-accent-yellow shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'text-text-muted'}`}>
              {t('tickets.type_ppm').toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 relative">{stats.ppms}</h3><p className="text-[10px] text-text-muted relative uppercase">{t('dashboard.active_ppm')}</p>
        </div>

        {/* АВАРИЯ */}
        <div 
          onClick={() => setFilterMode('accident')}
          className={`bg-dark-surface border rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer transition-all ${filterMode === 'accident' ? 'border-accent-red ring-1 ring-accent-red' : 'border-dark-border hover:border-accent-red/50'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-red/10 rounded-full group-hover:scale-110 transition-transform pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-accent-red/20 rounded-xl"><AlertTriangle className="w-6 h-6 text-accent-red" /></div>
            <span className={`text-[10px] font-bold bg-dark-bg px-2 py-1 rounded-lg uppercase tracking-widest transition-colors ${filterMode === 'accident' ? 'text-accent-red shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-text-muted'}`}>
              {t('tickets.type_accident').toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 relative">{stats.accidents}</h3><p className="text-[10px] text-text-muted relative uppercase">{t('dashboard.active_accidents')}</p>
        </div>

        {/* ВНИМАНИЕ */}
        <div 
          onClick={() => setFilterMode('warning')}
          className={`bg-dark-surface border rounded-2xl p-5 shadow-lg relative overflow-hidden group cursor-pointer transition-all ${filterMode === 'warning' ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-dark-border hover:border-yellow-400/50'}`}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-400/10 rounded-full group-hover:scale-110 transition-transform pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative">
            <div className="p-3 bg-yellow-400/20 rounded-xl"><AlertCircle className="w-6 h-6 text-yellow-400" /></div>
            <span className={`text-[10px] font-bold bg-dark-bg px-2 py-1 rounded-lg uppercase tracking-widest transition-colors ${filterMode === 'warning' ? 'text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'text-text-muted'}`}>
              {t('tickets.type_warning').toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1 relative">{stats.warnings}</h3><p className="text-[10px] text-text-muted relative uppercase">{t('dashboard.active_warnings')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-lg flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('dashboard.top_downtime') || 'ТОП ПРОСТОЕВ'}</h3>
              <span className="text-[10px] text-accent-red font-bold bg-accent-red/10 px-2 py-0.5 rounded tracking-tighter animate-pulse">LIVE</span>
            </div>
            
            <div className="flex-1 space-y-5">
              {topDowntime.map((item) => (
                <div 
                  key={item.id} 
                  className="cursor-pointer hover:bg-white/5 p-1 rounded-lg transition-colors"
                  onClick={() => {
                    setSelectedDowntimeId(item.equipmentId);
                    setIsDowntimeModalOpen(true);
                  }}
                >
                  <TopDowntimeItem 
                    name={item.equipmentName} 
                    hours={item.hours} 
                    status={item.status}
                    maxHours={maxDowntime}
                    t={t}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-dark-border/50">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  {t('dashboard.total_downtime_24h')}
                </span>
                <span className="text-lg font-black text-accent-red shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  {topDowntime.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)} <span className="text-xs">{t('reports.hours_short')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-lg flex flex-col h-full">
            <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-surface-light/50">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">{getDynamicTitle()}</h3>
              <Link to="/tickets" className="text-sm text-primary hover:text-primary-light flex items-center gap-1 transition-colors">{t('dashboard.view_all')} <ChevronRight className="w-4 h-4" /></Link>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-dark-bg/80 backdrop-blur-sm border-b border-dark-border">
                    <th className="p-3 text-[10px] font-bold text-text-muted uppercase tracking-widest w-12 text-center">#</th>
                    <th className="p-3 text-[10px] font-bold text-text-muted uppercase tracking-widest w-24">{t('tickets.table_date')}</th>
                    <th className="p-3 text-[10px] font-bold text-text-muted uppercase tracking-widest w-40">{t('tickets.table_equipment')}</th>
                    <th className="p-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('tickets.table_description')}</th>
                    <th className="p-3 text-[10px] font-bold text-text-muted uppercase tracking-widest w-24 text-right">{t('tickets.table_status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <React.Fragment key={ticket.id}>
                      <tr 
                        onClick={() => setActiveTicketId(activeTicketId === ticket.id ? null : ticket.id)}
                        className={`border-b border-dark-border/50 hover:bg-primary/5 cursor-pointer transition-colors group ${activeTicketId === ticket.id ? 'bg-primary/5' : ''}`}
                      >
                        <td className="p-3 text-center">
                          <div className={`w-6 h-6 rounded flex items-center justify-center mx-auto ${
                            ticket.type === 'accident' ? 'bg-accent-red/20 text-accent-red' : 
                            ticket.type === 'warning' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-accent-yellow/20 text-accent-yellow'
                          }`}>
                            {ticket.type === 'accident' ? <AlertTriangle className="w-3.5 h-3.5" /> : 
                             ticket.type === 'warning' ? <AlertCircle className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                          </div>
                        </td>
                        <td className="p-3 text-[11px] text-text-muted whitespace-nowrap">
                          {format(new Date(ticket.createdAt), 'dd.MM HH:mm')}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-xs text-white group-hover:text-primary transition-colors truncate w-32">
                            {getEquipmentName(ticket.equipmentId)}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-gray-400 truncate max-w-0">
                          {ticket.description}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            ticket.status === 'completed' ? 'text-green-400 bg-green-500/10' : 'text-text-muted bg-dark-bg'
                          }`}>
                            {ticket.status === 'completed' ? t('tickets.status_done') : t('tickets.status_process')}
                          </span>
                        </td>
                      </tr>

                      {activeTicketId === ticket.id && (
                        <tr>
                          <td colSpan="5" className="p-4 bg-dark-bg/50 border-b border-dark-border animate-in slide-in-from-top-1 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <Info className="w-3 h-3" /> {t('tickets.details_title')}
                                </h4>
                                <p className="text-xs text-text-main bg-dark-surface p-3 rounded-xl border border-dark-border leading-relaxed">
                                  {ticket.description}
                                </p>
                                <div className="mt-4 flex gap-2">
                                  <Link 
                                    to={`/materials?ticketId=${ticket.id}&eqId=${ticket.equipmentId}`}
                                    className="flex-1 flex items-center justify-center gap-2 bg-dark-bg hover:bg-dark-surface-light text-primary border border-primary/30 rounded-xl py-2 text-[10px] font-bold uppercase transition-all"
                                  >
                                    <Settings2 className="w-3 h-3" /> {t('tickets.order_materials') || 'ЗАКАЗАТЬ ЗАПЧАСТИ'}
                                  </Link>
                                </div>
                                <div className="mt-2 text-[10px] text-text-muted">
                                  {t('common.author')}: <span className="text-white">{ticket.authorName}</span> | {t('tickets.table_service')}: <span className="text-white">{ticket.service}</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" /> {t('tickets.history_title')}
                                </h4>
                                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                  {ticket.comments.map(c => (
                                    <CommentItem key={c.id} comment={c} currentLang={i18n.language} t={t} />
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(ticket.id)}
                                    placeholder={t('tickets.comment_placeholder')}
                                    className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                                  />
                                  <button onClick={() => handleAddComment(ticket.id)} className="bg-primary hover:bg-primary-dark text-dark-bg p-1.5 rounded-xl transition-all">
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-text-muted italic border-dashed border-2 border-dark-border/20 m-4 rounded-2xl bg-dark-bg/10">
                        {t('dashboard.no_recent')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Модалка быстрого разбора простоя (для Босса) */}
      {isDowntimeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-surface-light/30 shrink-0">
              <div className="flex items-center gap-4">
                {ticketViewId ? (
                  <>
                    <button 
                      onClick={() => setTicketViewId(null)}
                      className="p-2 hover:bg-white/10 rounded-xl text-primary transition-colors flex items-center gap-2 group border border-primary/20"
                    >
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.back')}</span>
                    </button>
                    <div className="h-8 w-px bg-dark-border mx-2"></div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const tk = tickets.find(t => t.id === ticketViewId);
                        if (!tk) return null;
                        const parts = tk.equipmentId.split('-');
                        const eqCode = parts.length > 1 ? parts.slice(1).join('') : parts[0];
                        const typeLabel = tk.type === 'accident' ? t('tickets.type_accident') : tk.type === 'ppm' ? t('tickets.type_ppm') : t('tickets.type_warning');
                        return (
                          <>
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                              tk.type === 'accident' ? 'bg-accent-red text-dark-bg shadow-lg shadow-accent-red/20' : 'bg-accent-yellow text-dark-bg shadow-lg shadow-accent-yellow/20'
                            }`}>
                              {typeLabel}
                            </span>
                            <h2 className="font-black text-xs text-text-muted uppercase tracking-[0.2em]">{t('tickets.details_title')}</h2>
                            <span className="text-xs font-mono text-primary font-black ml-2 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              #{eqCode}-{tk.id.split('-').pop()}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-accent-red/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-accent-red" />
                    </div>
                    <h2 className="font-bold text-lg text-white uppercase tracking-tight">{t('dashboard.downtime_modal_title')}</h2>
                  </>
                )}
              </div>
              <button onClick={() => { setIsDowntimeModalOpen(false); setTicketViewId(null); }} className="text-text-muted hover:text-white transition-colors p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 min-h-0">
              {!ticketViewId ? (
                /* VIEW 1: INCIDENT LIST */
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-dark-bg/50 p-6 rounded-2xl border border-dark-border">
                    <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">{t('dashboard.downtime_modal_object')}</p>
                      <h3 className="text-2xl font-black text-white uppercase">{MOCK_EQUIPMENT.find(e => e.id === selectedDowntimeId)?.name}</h3>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">{t('dashboard.downtime_modal_total')}</p>
                        <p className="text-2xl font-black text-accent-red">
                          {modalTotalDowntime} {t('reports.hours_short')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-text-muted uppercase mb-1">{t('dashboard.downtime_modal_current_status')}</p>
                        {(() => {
                          const status = MOCK_EQUIPMENT.find(e => e.id === selectedDowntimeId)?.status;
                          const colorClass = status === 'working' ? 'text-green-500' : status === 'ppm' ? 'text-accent-yellow' : 'text-accent-red';
                          return <p className={`text-sm font-bold uppercase tracking-widest ${colorClass}`}>{t(`equipment.status_${status}`)}</p>;
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {t('dashboard.downtime_modal_history')} ({dateRangeLabel})
                    </h4>
                    
                    <div className="border border-dark-border rounded-2xl overflow-hidden bg-dark-bg/30">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-dark-bg text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-dark-border">
                            <th className="p-3 w-12 text-center">{t('tickets.table_type')}</th>
                            <th className="p-3">{t('tickets.table_description')}</th>
                            <th className="p-3 w-24">{t('tickets.table_service')}</th>
                            <th className="p-3 w-20">{t('tickets.table_date')}</th>
                            <th className="p-3 w-24 text-right">{t('dashboard.total_downtime_24h').split(' ')[1]}</th>
                            <th className="p-3 w-24 text-center">{t('tickets.table_status')}</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs">
                          {filteredData.tickets.filter(tk => tk.equipmentId === selectedDowntimeId).map((tk) => (
                            <React.Fragment key={tk.id}>
                              <tr 
                                onClick={() => setActiveTicketId(activeTicketId === tk.id ? null : tk.id)}
                                className={`border-b border-dark-border/50 hover:bg-white/5 transition-colors cursor-pointer group ${activeTicketId === tk.id ? 'bg-primary/5' : ''}`}
                              >
                                <td className="p-3 text-center">
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); setTicketViewId(tk.id); }}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all cursor-pointer hover:scale-110 active:scale-95 hover:brightness-125 border ${
                                      tk.type === 'accident' ? 'bg-accent-red/10 border-accent-red/30 text-accent-red' : 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow'
                                    }`}
                                    title={t('tickets.view_details')}
                                  >
                                    {tk.type === 'accident' ? <AlertTriangle className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                                  </div>
                                </td>
                                <td className="p-3 font-medium text-gray-300 truncate max-w-[200px]">{tk.description}</td>
                                <td className="p-3">
                                  <span className="text-[10px] font-bold text-primary/80 uppercase truncate block max-w-[100px]">
                                    {t(`tickets.services.${tk.service}`) || tk.service}
                                  </span>
                                </td>
                                <td className="p-3 text-text-muted font-medium">{format(new Date(tk.createdAt), 'dd.MM')}</td>
                                <td className="p-3 text-right font-bold text-accent-red/80">{tk.downtimeDuration || 0}h</td>
                                <td className="p-3 text-center">
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${
                                    tk.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                                  }`}>
                                    {tk.status === 'completed' ? t('tickets.status_done') : t('tickets.status_process')}
                                  </span>
                                </td>
                              </tr>
                              {activeTicketId === tk.id && (
                                <tr className="bg-dark-bg/30 animate-in slide-in-from-top-1">
                                  <td colSpan="5" className="p-4 border-b border-dark-border/50">
                                    <div className="flex justify-between items-start mb-3">
                                      <p className="text-xs text-gray-400 italic">"{tk.description}"</p>
                                      <span className="text-[10px] text-text-muted uppercase font-bold">{t('tickets.table_service')}: <span className="text-white">{t(`tickets.services.${tk.service}`) || tk.service}</span></span>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('tickets.history_title')}:</p>
                                      <div className="space-y-2 pr-2">
                                        {tk.comments.map(c => (
                                          <div key={c.id} className="text-[11px] bg-dark-surface p-2 rounded-lg border border-dark-border">
                                            <span className="text-primary font-bold mr-2">{c.authorName}:</span>
                                            <span className="text-gray-300">{c.text}</span>
                                          </div>
                                        ))}
                                        {tk.comments.length === 0 && <p className="text-[10px] text-text-muted italic">{t('tickets.no_comments')}</p>}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW 2: TICKET DETAILS (DRILL-DOWN) */
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  {(() => {
                    const tk = tickets.find(t => t.id === ticketViewId);
                    if (!tk) return null;
                    return (
                      <>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-black text-white leading-tight">{tk.description}</h3>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tk.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                              {tk.status === 'completed' ? t('tickets.status_done') : t('tickets.status_process')}
                            </span>
                            <p className="text-[10px] text-text-muted mt-2 font-bold uppercase">{format(new Date(tk.createdAt), 'dd MMMM yyyy, HH:mm')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-y border-dark-border/30 mb-6 mt-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{t('common.service')}</span>
                            <span className="text-xs font-bold text-primary uppercase">{t(`tickets.services.${tk.service}`) || tk.service}</span>
                          </div>
                          
                          <div className="flex flex-col gap-0.5 border-l border-dark-border/30 pl-4">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{t('dashboard.opened_label') || 'ОТКРЫТ'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{tk.authorName}</span>
                              <span className="text-[9px] text-text-muted bg-white/5 px-1 rounded">{format(new Date(tk.createdAt), 'dd.MM.yyyy HH:mm')}</span>
                            </div>
                          </div>

                          {tk.status === 'completed' && (
                            <div className="flex flex-col gap-0.5 border-l border-dark-border/30 pl-4">
                              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{t('dashboard.closed_label') || 'ЗАКРЫТ'}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{tk.closedBy || tk.authorName}</span>
                                <span className="text-[9px] text-text-muted bg-green-500/5 px-1 rounded border border-green-500/10">{format(new Date(tk.createdAt), 'dd.MM.yyyy HH:mm')}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                            <History className="w-4 h-4 text-primary" />
                            {t('tickets.history_title')}
                          </p>
                          <div className="space-y-3 pr-2">
                            {tk.comments.length > 0 ? tk.comments.map(c => (
                              <div key={c.id} className="bg-dark-surface-light/30 p-3 rounded-2xl border border-dark-border/50">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-black text-primary uppercase">{c.authorName}</span>
                                  <span className="text-[9px] text-text-muted uppercase">{format(new Date(c.timestamp), 'HH:mm')}</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{c.text}</p>
                              </div>
                            )) : (
                              <div className="text-center py-6 text-text-muted text-xs italic">{t('tickets.no_comments') || 'Нет комментариев'}</div>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-dark-border mt-4">
                          <div className="flex gap-2">
                            <textarea 
                              value={ticketComment}
                              onChange={(e) => setTicketComment(e.target.value)}
                              placeholder={t('tickets.description_placeholder')}
                              className="flex-1 bg-dark-bg border border-dark-border rounded-xl p-3 text-xs outline-none focus:border-primary text-white resize-none"
                              rows={2}
                            />
                            <button 
                              onClick={() => handleAddModalComment(tk.id)}
                              className="bg-primary text-dark-bg p-3 rounded-xl hover:bg-primary-dark transition-colors self-end"
                            >
                              <Plus className="w-5 h-5 font-bold" />
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-dark-border bg-dark-surface-light/30 shrink-0">
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => { setIsDowntimeModalOpen(false); setTicketViewId(null); }} 
                  className="w-48 py-3 px-6 bg-dark-bg border border-dark-border text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-dark-surface-light transition-colors"
                >
                  {t('common.back')}
                </button>
                <button 
                  onClick={() => {
                    setIsDowntimeModalOpen(false);
                    setTicketViewId(null);
                    navigate(`/equipment?id=${selectedDowntimeId}`);
                  }}
                  className="w-48 py-3 px-6 bg-primary text-dark-bg rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  {t('dashboard.downtime_modal_passport')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
