import React, { useState, useEffect } from 'react';
import { MOCK_TICKETS, MOCK_EQUIPMENT } from '../api/mockData';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUI } from '../context/UIContext';
import { 
  AlertTriangle, 
  AlertCircle, 
  MessageSquare, 
  Camera, 
  Plus, 
  X, 
  Save, 
  Send, 
  WifiOff, 
  User as UserIcon, 
  ChevronRight, 
  ChevronDown, 
  Cpu, 
  FolderOpen, 
  Folder, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Info, 
  Languages 
} from 'lucide-react';
import { 
  format, 
  isToday, 
  isWithinInterval, 
  startOfToday, 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  endOfDay,
  subDays,
  isAfter
} from 'date-fns';
import { ru } from 'date-fns/locale';

const buildTree = (items, parentId = null) => items.filter(item => item.parentId === parentId).map(item => ({ ...item, children: buildTree(items, item.id) }));

const autoTranslate = (text, targetLang) => {
  if (targetLang === 'pt') {
    return `[Traduzido] ${text} (Simulação)`;
  }
  return `[Переведено] ${text} (Имитация)`;
};

const CommentItem = ({ comment, currentLang, t }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const commentLang = comment.lang || 'ru';
  const needsTranslation = commentLang !== currentLang;
  
  const displayText = (needsTranslation && !showOriginal) 
    ? autoTranslate(comment.text, currentLang) 
    : comment.text;

  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-primary">{comment.authorName.charAt(0)}</span>
      </div>
      <div className="bg-dark-surface p-3 rounded-xl flex-1 border border-dark-border">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary">{comment.authorName}</span>
            {needsTranslation && (
              <span className="flex items-center gap-1 text-[9px] text-primary/60 px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10">
                <Languages className="w-2.5 h-2.5" />
                {t('tickets.translated_label')}
              </span>
            )}
          </div>
          <span className="text-[10px] text-text-muted">{format(new Date(comment.timestamp), 'HH:mm')}</span>
        </div>
        <p className="text-xs text-text-main leading-relaxed">{displayText}</p>
        {needsTranslation && (
          <button 
            onClick={() => setShowOriginal(!showOriginal)}
            className="mt-2 text-[10px] text-primary hover:underline font-medium"
          >
            {showOriginal ? t('tickets.show_translated') : t('tickets.show_original')}
          </button>
        )}
      </div>
    </div>
  );
};

const Tickets = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { period, setPeriod } = useUI();

  const serviceMap = {
    'Механики': 'Mechanics',
    'Электрики': 'Electrical',
    'Автоматики': 'Automation',
    'Снабжение': 'Supply',
    'Общая служба': 'General'
  };
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState(location.state?.filter || 'all');
  const [activeService, setActiveService] = useState('all');
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [formData, setFormData] = useState({ equipmentId: '', type: 'accident', description: '', targetService: '' });
  const [isSelectingEq, setIsSelectingEq] = useState(false);
  const [expandedEqNodes, setExpandedEqNodes] = useState(new Set(['f-2', 'f-2-1']));
  const treeData = buildTree(MOCK_EQUIPMENT);

  const SERVICES = ['Механики', 'Электрики', 'Автоматики', 'Снабжение'];
  
  const getFilteredByTime = (data) => {
    const now = new Date();
    let daysToSub = 7;
    if (period === 'today') daysToSub = 1;
    if (period === 'month') daysToSub = 30;
    if (period === 'year') daysToSub = 365;

    const startDate = subDays(now, daysToSub);
    
    return data.filter(t => isAfter(new Date(t.createdAt), startDate));
  };

  const timeFilteredTickets = getFilteredByTime(tickets);

  const serviceFilteredTickets = timeFilteredTickets.filter(t => {
    if (activeService === 'all') return true;
    return t.service === activeService;
  });

  const stats = {
    total: serviceFilteredTickets.length,
    accidents: serviceFilteredTickets.filter(t => t.type === 'accident').length,
    warnings: serviceFilteredTickets.filter(t => t.type === 'warning').length,
    ppm: serviceFilteredTickets.filter(t => t.type === 'ppm').length,
    pending: serviceFilteredTickets.filter(t => t.status === 'not_completed').length,
    completed: serviceFilteredTickets.filter(t => t.status === 'completed').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const filteredTickets = serviceFilteredTickets.filter(t => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'accident') return t.type === 'accident';
    if (activeFilter === 'warning') return t.type === 'warning';
    if (activeFilter === 'ppm') return t.type === 'ppm';
    if (activeFilter === 'pending') return t.status === 'not_completed';
    if (activeFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const toggleEqNode = (nodeId) => {
    const newExpanded = new Set(expandedEqNodes);
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId); else newExpanded.add(nodeId);
    setExpandedEqNodes(newExpanded);
  };

  useEffect(() => {
    const draft = localStorage.getItem('catoca_ticket_draft');
    if (draft) { setFormData(JSON.parse(draft)); setDraftSaved(true); }

    const params = new URLSearchParams(location.search);
    const ticketId = params.get('id');
    if (ticketId) {
      setActiveCommentId(ticketId);
      setTimeout(() => {
        const element = document.getElementById(`ticket-row-${ticketId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [location.search]);

  const handleFormChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);
    localStorage.setItem('catoca_ticket_draft', JSON.stringify(newData));
    setDraftSaved(true);
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    
    let finalService = formData.targetService;
    if (formData.type === 'ppm') {
      finalService = user.service || 'Общая служба';
    }

    const newTicket = { 
      id: `t-${Date.now()}`, 
      equipmentId: formData.equipmentId, 
      author: user.username, 
      authorName: user.name, 
      service: finalService,
      status: 'not_completed', 
      type: formData.type, 
      description: formData.description, 
      createdAt: new Date().toISOString(), 
      targetDate: new Date(Date.now() + 86400000).toISOString(), 
      comments: [] 
    };
    
    setTickets([newTicket, ...tickets]);
    setIsModalOpen(false);
    setFormData({ equipmentId: '', type: 'accident', description: '', targetService: '' });
    localStorage.removeItem('catoca_ticket_draft');
    setDraftSaved(false);
    setIsSelectingEq(false);
  };

  const [activeCommentId, setActiveCommentId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = (ticketId) => {
    if (!commentText.trim()) return;
    setTickets(tickets.map(t => t.id === ticketId ? { 
      ...t, 
      comments: [
        ...t.comments, 
        { 
          id: `c-${Date.now()}`, 
          authorName: user.name, 
          text: commentText, 
          timestamp: new Date().toISOString(),
          lang: i18n.language 
        } 
      ] 
    } : t));
    setCommentText('');
    setActiveCommentId(null);
  };

  const getEquipmentName = (id) => MOCK_EQUIPMENT.find(e => e.id === id)?.name || 'Неизвестно';

  const EqTreeNode = ({ node, level = 0 }) => {
    const isExpanded = expandedEqNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    return (
      <div className="w-full">
        <div className={`flex items-center gap-2 py-1.5 px-2 my-0.5 cursor-pointer transition-all rounded-lg select-none ${node.isEquipment ? 'hover:bg-primary/20 text-gray-300' : 'hover:bg-dark-surface-light font-medium text-white'}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => { if (hasChildren || !node.isEquipment) toggleEqNode(node.id); if (node.isEquipment) { handleFormChange({ target: { name: 'equipmentId', value: node.id } }); setIsSelectingEq(false); } }}>
          <div className="w-4 shrink-0 flex justify-center">{hasChildren ? (isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-text-muted" />) : null}</div>
          {node.isEquipment ? <Cpu className="w-4 h-4 text-text-muted shrink-0" /> : (isExpanded ? <FolderOpen className="w-4 h-4 text-primary shrink-0" /> : <Folder className="w-4 h-4 text-text-muted shrink-0" />)}
          <span className="truncate text-sm">{node.name}</span>
        </div>
        {isExpanded && hasChildren && <div className="flex flex-col w-full border-l border-dark-border/50 ml-[14px]">{node.children.map(child => <EqTreeNode key={child.id} node={child} level={level + 1} />)}</div>}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-red/10 rounded-lg">
              <AlertTriangle className="text-accent-red w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">
                {t('tickets.title')}
              </h1>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">
                {t('tickets.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center gap-4">
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

            <div className="flex items-center gap-1.5 p-1 bg-dark-surface/30 border border-dark-border/50 rounded-2xl overflow-x-auto no-scrollbar max-w-[400px]">
              <button
                onClick={() => setActiveService('all')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all ${
                  activeService === 'all' 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {t('tickets.filter_service_all').toUpperCase()}
              </button>
              {SERVICES.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveService(s)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all ${
                    activeService === s 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {t(`tickets.services.${serviceMap[s] || 'General'}`).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-primary hover:bg-primary-dark text-dark-bg px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/10 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /><span>{t('tickets.create')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div 
          onClick={() => setActiveFilter('all')}
          className={`bg-dark-surface border p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${activeFilter === 'all' ? 'border-accent-yellow ring-2 ring-accent-yellow shadow-lg shadow-accent-yellow/20' : 'border-dark-border hover:border-dark-border/80'}`}
        >
          <p className="text-[10px] text-accent-yellow uppercase font-bold tracking-widest mb-1">{t('tickets.filter_all')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.total}</span>
            <span className="text-xs text-text-muted text-nowrap">{t('tickets.unit_works')}</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('pending')}
          className={`bg-dark-surface border p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${activeFilter === 'pending' ? 'border-blue-500 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : 'border-dark-border hover:border-dark-border/80'}`}
        >
          <p className="text-[10px] text-blue-500 uppercase font-bold tracking-widest mb-1 text-nowrap">{t('tickets.filter_pending')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.pending}</span>
            <span className="text-xs text-text-muted text-nowrap">{t('tickets.unit_orders')}</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('completed')}
          className={`bg-dark-surface border p-4 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${activeFilter === 'completed' ? 'border-green-500 ring-2 ring-green-500 shadow-lg shadow-green-500/20' : 'border-dark-border hover:border-dark-border/80'}`}
        >
          <div className="relative z-10">
            <p className="text-[10px] text-green-500 uppercase font-bold tracking-widest mb-1">{t('tickets.filter_completed')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.completed}</span>
              <span className="text-xs text-text-muted text-nowrap">{t('tickets.unit_works')}</span>
            </div>
          </div>
          <CheckCircle className="absolute -right-2 -bottom-2 w-12 h-12 text-green-500 opacity-5 group-hover:opacity-10 transition-opacity" />
        </div>
        
        <div 
          onClick={() => setActiveFilter('ppm')}
          className={`bg-dark-surface border p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${activeFilter === 'ppm' ? 'border-accent-yellow ring-2 ring-accent-yellow shadow-lg shadow-accent-yellow/20' : 'border-dark-border hover:border-dark-border/80'}`}
        >
          <p className="text-[10px] text-accent-yellow uppercase font-bold tracking-widest mb-1">{t('tickets.filter_ppm')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.ppm}</span>
            <span className="text-xs text-text-muted text-nowrap">{t('tickets.unit_plans')}</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter('accident')}
          className={`bg-dark-surface border p-4 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${activeFilter === 'accident' ? 'border-accent-red ring-2 ring-accent-red shadow-lg shadow-accent-red/20' : 'border-dark-border hover:border-dark-border/80'}`}
        >
          <p className="text-[10px] text-accent-red uppercase font-bold tracking-widest mb-1">{t('tickets.filter_accident')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.accidents}</span>
            <span className="text-xs text-text-muted text-nowrap">{t('tickets.unit_incidents')}</span>
          </div>
          <AlertTriangle className="absolute -right-2 -bottom-2 w-12 h-12 text-accent-red opacity-5 group-hover:opacity-10 transition-opacity" />
        </div>

        <div 
          onClick={() => setActiveFilter('warning')}
          className={`bg-dark-surface border p-4 rounded-2xl relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${activeFilter === 'warning' ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-dark-border hover:border-dark-border/80'}`}
        >
          <p className="text-[10px] text-yellow-400 uppercase font-bold tracking-widest mb-1">{t('tickets.filter_warning')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.warnings}</span>
            <span className="text-xs text-text-muted text-nowrap">{t('tickets.unit_defects')}</span>
          </div>
          <AlertCircle className="absolute -right-2 -bottom-2 w-12 h-12 text-yellow-400 opacity-5 group-hover:opacity-10 transition-opacity" />
        </div>
      </div>

      {draftSaved && !isModalOpen && (
        <div className="mb-4 p-3 bg-accent-yellow/10 border border-accent-yellow/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent-yellow text-sm"><Save className="w-4 h-4" />У вас есть несохраненный черновик тикета.</div>
          <button onClick={() => setIsModalOpen(true)} className="text-xs bg-accent-yellow/20 px-3 py-1.5 rounded-lg text-accent-yellow hover:bg-accent-yellow/30 font-medium">Продолжить</button>
        </div>
      )}

      <div className="flex-1 min-h-0 bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-20">
              <tr className="bg-dark-surface-light border-b border-dark-border shadow-sm">
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest w-16 text-center">{t('tickets.table_type')}</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest w-32">{t('tickets.table_date')}</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest w-64">{t('tickets.table_equipment')}</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest w-40">{t('tickets.table_service')}</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('tickets.table_description')}</th>
                <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest w-32 text-right">{t('tickets.table_status')}</th>
              </tr>
            </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <React.Fragment key={ticket.id}>
                <tr 
                  id={`ticket-row-${ticket.id}`}
                  onClick={() => setActiveCommentId(activeCommentId === ticket.id ? null : ticket.id)}
                  className={`border-b border-dark-border/50 hover:bg-primary/5 cursor-pointer transition-colors group ${activeCommentId === ticket.id ? 'bg-primary/5' : ''}`}
                >
                  <td className="p-4 text-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto ${
                      ticket.type === 'accident' ? 'bg-accent-red/20 text-accent-red' : 
                      ticket.type === 'warning' ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-accent-yellow/20 text-accent-yellow'
                    }`}>
                      {ticket.type === 'accident' ? <AlertTriangle className="w-4 h-4" /> : 
                       ticket.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                       <Wrench className="w-4 h-4" />}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-text-muted whitespace-nowrap">
                    {format(new Date(ticket.createdAt), 'dd.MM HH:mm')}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                      {getEquipmentName(ticket.equipmentId)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-primary/80 uppercase tracking-wider">
                      {t(`tickets.services.${serviceMap[ticket.service] || 'General'}`)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400 truncate max-w-0">
                    {ticket.description}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${
                      ticket.status === 'completed' 
                      ? 'text-green-400 bg-green-500/10' 
                      : 'text-text-muted bg-dark-bg'
                    }`}>
                      {ticket.status === 'completed' ? t('tickets.status_done') : t('tickets.status_process')}
                    </span>
                  </td>
                </tr>
                
                {activeCommentId === ticket.id && (
                  <tr>
                    <td colSpan="6" className="p-6 bg-dark-bg/30 border-b border-dark-border">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-200">
                        <div>
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> {t('tickets.details_title')}
                          </h4>
                          <div className="bg-dark-surface border border-dark-border p-4 rounded-xl text-sm text-text-main leading-relaxed">
                            {ticket.description}
                          </div>
                          <div className="mt-4 flex gap-4">
                            <div className="text-xs text-text-muted">
                              {t('common.author')}: <span className="text-white font-medium">{ticket.authorName}</span>
                            </div>
                            <div className="text-xs text-text-muted">
                              {t('tickets.table_service')}: <span className="text-white font-medium">{t(`tickets.services.${serviceMap[ticket.service] || 'General'}`)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> {t('tickets.history_title')}
                          </h4>
                          <div className="space-y-3 mb-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
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
                              className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                            />
                            <button 
                              onClick={() => handleAddComment(ticket.id)}
                              className="bg-primary hover:bg-primary-dark text-dark-bg p-2 rounded-lg transition-colors"
                            >
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
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <div className="p-20 text-center text-text-muted italic">
            {t('calendar.no_records')}
          </div>
        )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
              <h2 className="font-bold text-lg">{t('tickets.modal_title')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
              {draftSaved && <div className="text-xs flex items-center gap-1 text-text-muted mb-2"><Save className="w-3 h-3" />{t('tickets.draft_saved')}</div>}
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">{t('tickets.type_label')}</label>
                <select name="type" value={formData.type} onChange={handleFormChange} className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white font-medium">
                  <option value="accident">{t('tickets.type_accident')} ({t('dashboard.active_accidents').toLowerCase()})</option>
                  <option value="warning">{t('tickets.type_warning')}</option>
                  <option value="ppm">{t('tickets.type_ppm')}</option>
                </select>
              </div>
              
              {(formData.type === 'accident' || formData.type === 'warning') && (
                <div className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                  <label className="text-sm font-medium text-text-muted">{t('tickets.target_service_label')}</label>
                  <select 
                    name="targetService" 
                    required 
                    value={formData.targetService} 
                    onChange={handleFormChange} 
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
                  >
                    <option value="" disabled>{t('tickets.select_service_placeholder')}</option>
                    {SERVICES.map(s => <option key={s} value={s}>{t(`tickets.services.${serviceMap[s] || 'General'}`)}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">{t('common.equipment')}</label>
                {isSelectingEq ? (
                  <div className="border border-dark-border rounded-xl p-2 max-h-64 overflow-y-auto bg-dark-bg custom-scrollbar">{treeData.map(node => <EqTreeNode key={node.id} node={node} level={0} />)}</div>
                ) : (
                  <div onClick={() => setIsSelectingEq(true)} className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm cursor-pointer hover:border-primary transition-colors flex justify-between items-center">
                    <span className={formData.equipmentId ? 'text-white' : 'text-text-muted'}>{formData.equipmentId ? getEquipmentName(formData.equipmentId) : t('tickets.select_eq_placeholder')}</span>
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted">{t('tickets.description_label')}</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} required rows={4} className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white resize-none" placeholder={t('tickets.description_placeholder')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">{t('tickets.photos_label')}</label>
                <div className="border-2 border-dashed border-dark-border rounded-xl p-6 flex flex-col items-center text-center hover:bg-dark-bg/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/30"><Camera className="w-6 h-6" /></div>
                  <p className="text-sm text-white font-medium mb-1">{t('tickets.photos_hint')}</p>
                  <p className="text-xs text-text-muted flex items-center gap-1"><WifiOff className="w-3 h-3" />{t('tickets.compression_hint')}</p>
                </div>
              </div>
            </form>
            <div className="p-4 border-t border-dark-border bg-dark-bg/50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-dark-bg border border-dark-border text-white rounded-xl font-medium hover:bg-dark-surface-light transition-colors" type="button">{t('common.cancel')}</button>
              <button onClick={handleCreateTicket} className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">{t('tickets.create')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
