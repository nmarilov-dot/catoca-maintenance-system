import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { MOCK_EQUIPMENT, MOCK_TICKETS, MOCK_SERVICES } from '../api/mockData';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  ChevronRight, 
  ChevronDown,
  Settings2, 
  Activity, 
  Plus, 
  Clock, 
  User as UserIcon, 
  Folder, 
  Cpu,
  AlertTriangle,
  AlertCircle,
  Wrench,
  FileText,
  Calendar,
  History,
  BookOpen,
  Filter,
  X,
  Search,
  MessageSquare,
  Info,
  ChevronLeft
} from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { ru, ptBR } from 'date-fns/locale';

// Простая модалка без сложной сортировки (стабильная версия)
const MaintenanceHistoryModal = ({ equipment, isOpen, onClose, t, dateLocale }) => {
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterDowntime, setFilterDowntime] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTicketId, setActiveTicketId] = useState(null);

  if (!isOpen) return null;

  const tickets = MOCK_TICKETS.filter(tk => tk.equipmentId === equipment.id);

  const filteredTickets = tickets.filter(tk => {
    const matchesService = filterService === 'all' || tk.service === filterService;
    const matchesStatus = filterStatus === 'all' || tk.status === filterStatus;
    const matchesAuthor = tk.authorName.toLowerCase().includes(filterAuthor.toLowerCase());
    const matchesDowntime = (tk.downtimeDuration || 0) >= filterDowntime;
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const ticketDate = parseISO(tk.createdAt);
      const start = dateFrom ? parseISO(dateFrom) : new Date(0);
      const end = dateTo ? parseISO(dateTo) : new Date(8640000000000000);
      matchesDate = ticketDate >= start && ticketDate <= end;
    }
    return matchesService && matchesStatus && matchesAuthor && matchesDowntime && matchesDate;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-dark-border rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-dark-border flex justify-between items-center bg-dark-bg/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl"><History className="w-6 h-6 text-primary" /></div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">{t('equipment.history_modal_title')}</h2>
              <p className="text-sm text-text-muted">{equipment.name} <span className="mx-2 text-dark-border">|</span> {equipment.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-text-muted" /></button>
        </div>

        <div className="p-6 bg-dark-bg/30 border-b border-dark-border grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase px-1">{t('tickets.table_service')}</label>
            <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white">
              <option value="all">{t('tickets.filter_service_all')}</option>
              {MOCK_SERVICES.map(s => <option key={s} value={s}>{t(`tickets.services.${s}`) || s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase px-1">{t('tickets.table_status')}</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white">
              <option value="all">{t('tickets.filter_all')}</option>
              <option value="open">{t('tickets.status_process')}</option>
              <option value="completed">{t('tickets.status_done')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase px-1">{t('common.author')}</label>
            <input type="text" value={filterAuthor} onChange={(e) => setFilterAuthor(e.target.value)} className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white"/>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase px-1">{t('equipment.filter_downtime')}</label>
            <input type="number" value={filterDowntime} onChange={(e) => setFilterDowntime(Number(e.target.value))} className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-muted uppercase px-1">{t('tickets.table_date')}</label>
            <div className="flex gap-1"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-1/2 bg-dark-surface border border-dark-border rounded-xl px-1 py-1 text-[10px] text-white"/><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-1/2 bg-dark-surface border border-dark-border rounded-xl px-1 py-1 text-[10px] text-white"/></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-dark-border">
                <th className="p-3 w-12">#</th>
                <th className="p-3 w-28">{t('tickets.table_date')}</th>
                <th className="p-3">{t('tickets.table_description')}</th>
                <th className="p-3 w-32">{t('common.author')}</th>
                <th className="p-3 w-20 text-right">{t('reports.hours_short')}</th>
                <th className="p-3 w-24 text-center">{t('tickets.table_status')}</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredTickets.map(tk => (
                <React.Fragment key={tk.id}>
                  <tr onClick={() => setActiveTicketId(activeTicketId === tk.id ? null : tk.id)} className="border-b border-dark-border/30 hover:bg-white/5 cursor-pointer">
                    <td className="p-3 text-center">{tk.type === 'accident' ? <AlertTriangle className="w-3.5 h-3.5 text-accent-red" /> : <Wrench className="w-3.5 h-3.5 text-accent-yellow" />}</td>
                    <td className="p-3 text-text-muted">{format(parseISO(tk.createdAt), 'dd.MM.yyyy')}</td>
                    <td className="p-3 font-bold text-white">{tk.description}</td>
                    <td className="p-3 text-gray-400">{tk.authorName}</td>
                    <td className="p-3 text-right font-bold text-accent-red/80">{tk.downtimeDuration || 0}</td>
                    <td className="p-3 text-center"><span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${tk.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>{tk.status === 'completed' ? t('tickets.status_done') : t('tickets.status_process')}</span></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EquipmentBase = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedEqId, setSelectedEqId] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const dateLocale = i18n.language === 'pt' ? ptBR : ru;

  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId) {
      setSelectedEqId(targetId);
      const path = [];
      let cur = MOCK_EQUIPMENT.find(e => e.id === targetId);
      while (cur && cur.parentId) { path.push(cur.parentId); cur = MOCK_EQUIPMENT.find(e => e.id === cur.parentId); }
      setExpandedIds(prev => [...new Set([...prev, ...path])]);
    }
  }, [searchParams]);

  const selectedEq = useMemo(() => MOCK_EQUIPMENT.find(e => e.id === selectedEqId), [selectedEqId]);

  const toggleFolder = (id) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getAggregateStatus = (parentId) => {
    const children = MOCK_EQUIPMENT.filter(item => {
      let isChild = false; let cur = item;
      while (cur && cur.parentId) { if (cur.parentId === parentId) { isChild = true; break; } cur = MOCK_EQUIPMENT.find(e => e.id === cur.parentId); }
      return isChild;
    });
    const hasAccident = children.some(c => c.status === 'not_working' || c.status === 'accident');
    const hasPPM = children.some(c => c.status === 'ppm');
    if (hasAccident) return 'accident';
    if (hasPPM) return 'ppm';
    return 'working';
  };

  const TreeNode = ({ item, level = 0 }) => {
    const isExpanded = expandedIds.includes(item.id);
    const children = MOCK_EQUIPMENT.filter(e => e.parentId === item.id);
    const hasChildren = children.length > 0;
    const aggStatus = !item.isEquipment ? getAggregateStatus(item.id) : item.status;
    const statusColors = { working: 'bg-green-500', ppm: 'bg-accent-yellow', accident: 'bg-accent-red', not_working: 'bg-accent-red' };

    return (
      <div className="w-full">
        <div onClick={() => { if (!item.isEquipment) toggleFolder(item.id); else { setSelectedEqId(item.id); setSearchParams({ id: item.id }); } }}
          className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${selectedEqId === item.id ? 'bg-primary/20 border-primary' : 'border-transparent hover:bg-white/5'}`}
          style={{ marginLeft: `${level * 12}px` }}>
          <div className="flex items-center gap-2 overflow-hidden">
            {!item.isEquipment && (isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
            <div className={`p-1.5 rounded ${item.isEquipment ? 'bg-dark-surface text-primary' : 'bg-dark-bg text-text-muted group-hover:text-primary'}`}>{item.isEquipment ? <Cpu className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}</div>
            <p className={`text-[11px] font-bold uppercase truncate ${selectedEqId === item.id ? 'text-white' : 'text-gray-400'}`}>{item.name}</p>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${statusColors[aggStatus] || 'bg-gray-500'}`}></div>
        </div>
        {!item.isEquipment && isExpanded && hasChildren && (
          <div className="mt-1 border-l border-dark-border/30 ml-3.5">{children.map(child => (<TreeNode key={child.id} item={child} level={level + 1} />))}</div>
        )}
      </div>
    );
  };

  const rootItems = MOCK_EQUIPMENT.filter(e => !e.parentId);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col md:flex-row gap-6 overflow-hidden bg-dark-bg/30">
      <div className="w-full md:w-1/3 flex flex-col bg-dark-surface rounded-2xl border border-dark-border overflow-hidden h-full">
        <div className="p-4 border-b border-dark-border bg-dark-bg/50"><h2 className="font-bold text-sm uppercase tracking-widest text-white">{t('equipment.title')}</h2></div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">{rootItems.map(item => (<TreeNode key={item.id} item={item} />))}</div>
      </div>

      <div className="flex-1 bg-dark-surface rounded-2xl border border-dark-border overflow-hidden flex flex-col h-full relative">
        {selectedEq ? (
          <>
            <div className="p-6 border-b border-dark-border bg-dark-bg/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-white uppercase mb-3">{selectedEq.name}</h1>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-dark-bg border border-primary/30 rounded-lg">
                    <span className="text-[9px] font-bold text-primary/70 uppercase">ID</span>
                    <span className="text-[11px] font-mono font-bold text-primary">{selectedEq.id}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 ${selectedEq.status === 'working' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-accent-red/10 border-accent-red/30 text-accent-red'}`}>
                    <Activity className="w-5 h-5" /><span className="text-sm font-black uppercase">{t(`equipment.status_${selectedEq.status}`)}</span>
                  </div>
                  <p className="text-[11px] text-white/90 font-medium bg-dark-surface/50 px-2 py-1 rounded border border-dark-border/30">
                    {format(new Date(selectedEq.lastStatusChange), 'dd.MM.yyyy')} <span className="text-primary font-bold mx-1">|</span> {selectedEq.statusAuthor}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-dark-bg/40 p-5 rounded-2xl border border-dark-border/50 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5"><Info className="w-24 h-24 text-primary" /></div>
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-3.5 h-3.5" />{t('tickets.details_title')}</h3>
                    <p className="text-sm text-gray-200 leading-relaxed italic">{t(`equipment.specs.${selectedEq.id.toLowerCase().replace(/-/g, '_')}`) || t('equipment.no_specs')}</p>
                  </div>
                  <div className="flex items-center gap-6 p-5 bg-dark-bg/40 rounded-2xl border border-dark-border/50">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Calendar className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{t('equipment.commissioning_date')}</p><p className="text-lg font-black text-white">{format(new Date(selectedEq.commissioningDate), 'dd.MM.yyyy')}</p></div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 justify-center">
                  <button onClick={() => setIsHistoryModalOpen(true)} className="flex items-center justify-between p-6 bg-primary/10 border border-primary/30 rounded-3xl group hover:bg-primary/20 transition-all">
                    <div className="flex items-center gap-4 text-left"><div className="p-4 bg-primary text-dark-bg rounded-2xl"><History className="w-6 h-6" /></div>
                    <div><p className="text-lg font-black text-white uppercase">{t('equipment.history_btn')}</p><p className="text-[10px] text-primary font-bold uppercase mt-1">Журнал событий</p></div></div>
                    <ChevronRight className="w-6 h-6 text-primary" />
                  </button>
                  <button onClick={() => navigate(`/knowledge?equipmentId=${selectedEq.id}`)} className="flex items-center justify-between p-6 bg-dark-bg/60 border border-dark-border rounded-3xl group hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4 text-left"><div className="p-4 bg-dark-surface text-text-muted rounded-2xl border border-dark-border"><BookOpen className="w-6 h-6" /></div>
                    <div><p className="text-lg font-black text-white uppercase">{t('equipment.kb_btn')}</p><p className="text-[10px] text-text-muted font-bold uppercase mt-1">Инструкции и файлы</p></div></div>
                    <ChevronRight className="w-6 h-6 text-text-muted" />
                  </button>
                </div>
              </section>
            </div>
            <MaintenanceHistoryModal equipment={selectedEq} isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} t={t} dateLocale={dateLocale} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-dark-bg/10">
            <div className="w-24 h-24 bg-dark-bg rounded-full flex items-center justify-center mb-6 border border-dark-border/50"><Settings2 className="w-10 h-10 text-dark-border" /></div>
            <h2 className="text-xl font-bold text-white mb-2">{t('equipment.select_prompt')}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentBase;
