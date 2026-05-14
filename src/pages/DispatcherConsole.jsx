import React, { useState, useMemo } from 'react';
import { MOCK_EQUIPMENT, MOCK_TICKETS, MOCK_SERVICES } from '../api/mockData';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  Wrench, 
  AlertCircle, 
  Plus, 
  History, 
  Settings2, 
  Activity,
  Clock,
  User as UserIcon,
  ChevronRight,
  X,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

const DispatcherConsole = () => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [equipmentList, setEquipmentList] = useState(MOCK_EQUIPMENT.filter(e => e.isEquipment));
  
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [statusLog, setStatusLog] = useState([
    { id: 'log-1', eqId: 'FB2-BN-001', eqName: 'ПРИЕМНЫЙ БУНКЕР', oldStatus: 'working', newStatus: 'accident', author: 'Николай Марилов', timestamp: '2026-05-13T10:00:00Z', reason: 'Обрыв футеровки' },
    { id: 'log-2', eqId: 'FB2-PT-001', eqName: 'ПИТАТЕЛЬ 1', oldStatus: 'ppm', newStatus: 'working', author: 'Николай Марилов', timestamp: '2026-05-13T09:30:00Z', reason: 'ТО завершено' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('accident');

  const stats = useMemo(() => {
    return {
      accidents: equipmentList.filter(e => e.status === 'accident' || e.status === 'not_working').length,
      ppm: equipmentList.filter(e => e.status === 'ppm').length,
      attention: equipmentList.filter(e => e.status === 'attention').length || 0
    };
  }, [equipmentList]);

  const handleStatusChange = (eqId, newStatus) => {
    const eq = equipmentList.find(e => e.id === eqId);
    if (!eq) return;

    const oldStatus = eq.status;
    if (oldStatus === newStatus) return;

    setEquipmentList(prev => prev.map(e => e.id === eqId ? { ...e, status: newStatus, lastStatusChange: new Date().toISOString() } : e));

    const newLogEntry = {
      id: `log-${Date.now()}`,
      eqId,
      eqName: eq.name,
      oldStatus,
      newStatus,
      author: 'Николай Марилов',
      timestamp: new Date().toISOString(),
      reason: newStatus === 'accident' ? 'Экстренная остановка' : 'Оперативное переключение'
    };
    setStatusLog(prev => [newLogEntry, ...prev]);
  };

  const StatusCard = ({ title, count, icon: Icon, color, isActive }) => (
    <div className={`relative flex-1 bg-dark-surface p-6 rounded-[2rem] border transition-all duration-300 ${isActive ? 'border-primary/50 shadow-[0_0_20px_rgba(255,184,0,0.1)]' : 'border-dark-border'}`}>
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 rounded-2xl bg-dark-bg border border-dark-border" style={{ color }}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="bg-dark-bg px-3 py-1 rounded-full border border-dark-border">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{title}</span>
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-5xl font-black text-white">{count}</h3>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">{title}</p>
      </div>
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-10" style={{ backgroundColor: `${color}10` }}></div>
      )}
    </div>
  );

  return (
    <div className="p-8 h-full flex flex-col gap-8 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 flex gap-6 w-full">
          <StatusCard title="ППР" count={stats.ppm} icon={Wrench} color="#FFB800" isActive={true} />
          <StatusCard title="АВАРИИ" count={stats.accidents} icon={AlertTriangle} color="#FF4D4D" />
          <StatusCard title="ВНИМАНИЕ" count={stats.attention} icon={AlertCircle} color="#D4D447" />
        </div>
        
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 flex justify-between items-center shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-accent-red rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE MONITORING</span>
            </div>
            <span className="text-2xl font-mono font-black text-primary tracking-tighter">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setModalType('accident'); setIsModalOpen(true); }} className="flex items-center justify-center gap-3 py-4 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-2xl font-black uppercase tracking-widest hover:bg-accent-red hover:text-white transition-all shadow-lg shadow-accent-red/10">
              <Plus className="w-4 h-4" /> АВАРИЯ
            </button>
            <button onClick={() => { setModalType('ppm'); setIsModalOpen(true); }} className="flex items-center justify-center gap-3 py-4 bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] rounded-2xl font-black uppercase tracking-widest hover:bg-[#FFB800] hover:text-dark-bg transition-all shadow-lg shadow-[#FFB800]/10">
              <Plus className="w-4 h-4" /> ППР
            </button>
          </div>
          <button onClick={() => { setModalType('attention'); setIsModalOpen(true); }} className="flex items-center justify-center gap-3 py-4 bg-[#D4D447]/10 border border-[#D4D447]/30 text-[#D4D447] rounded-2xl font-black uppercase tracking-widest hover:bg-[#D4D447] hover:text-dark-bg transition-all shadow-lg shadow-[#D4D447]/10">
            <Plus className="w-4 h-4" /> ВНИМАНИЕ
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-white uppercase tracking-tighter">ОПЕРАТИВНОЕ УПРАВЛЕНИЕ СТАТУСАМИ</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-dark-surface border border-dark-border rounded-xl p-1">
              <button className="px-4 py-1.5 text-[10px] font-bold text-white bg-primary/20 rounded-lg border border-primary/30 uppercase tracking-widest">ВСЕ</button>
              <button className="px-4 py-1.5 text-[10px] font-bold text-text-muted hover:text-white uppercase tracking-widest">АВАРИИ</button>
              <button className="px-4 py-1.5 text-[10px] font-bold text-text-muted hover:text-white uppercase tracking-widest">ППР</button>
            </div>
            <button className="p-2.5 bg-dark-surface border border-dark-border rounded-xl text-text-muted hover:text-white hover:border-primary transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {equipmentList.map(eq => (
            <div key={eq.id} className="bg-dark-surface border border-dark-border p-5 rounded-3xl hover:border-primary/50 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase truncate">{eq.name}</h4>
                  <p className="text-[10px] font-mono font-bold text-primary/70">{eq.id}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  eq.status === 'working' ? 'bg-green-500' : 
                  eq.status === 'ppm' ? 'bg-[#FFB800]' : 
                  eq.status === 'attention' ? 'bg-[#D4D447]' : 'bg-[#FF4D4D]'
                } ${eq.status === 'accident' ? 'animate-pulse shadow-[0_0_10px_rgba(255,77,77,0.5)]' : ''}`}></div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <button 
                  onClick={() => handleStatusChange(eq.id, 'working')}
                  className={`py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${eq.status === 'working' ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-dark-bg border-dark-border text-text-muted hover:border-green-500/50'}`}
                >
                  РАБОТА
                </button>
                <button 
                  onClick={() => handleStatusChange(eq.id, 'ppm')}
                  className={`py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${eq.status === 'ppm' ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]' : 'bg-dark-bg border-dark-border text-text-muted hover:border-[#FFB800]/50'}`}
                >
                  ППР
                </button>
                <button 
                  onClick={() => handleStatusChange(eq.id, 'attention')}
                  className={`py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${eq.status === 'attention' ? 'bg-[#D4D447]/20 border-[#D4D447] text-[#D4D447]' : 'bg-dark-bg border-dark-border text-text-muted hover:border-[#D4D447]/50'}`}
                >
                  ВНИМАНИЕ
                </button>
                <button 
                  onClick={() => handleStatusChange(eq.id, 'accident')}
                  className={`py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${eq.status === 'accident' || eq.status === 'not_working' ? 'bg-[#FF4D4D]/20 border-[#FF4D4D] text-[#FF4D4D]' : 'bg-dark-bg border-dark-border text-text-muted hover:border-[#FF4D4D]/50'}`}
                >
                  АВАРИЯ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-64 bg-dark-surface border border-dark-border rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-dark-border bg-dark-bg/30 flex justify-between items-center px-8">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-text-muted" />
            <h3 className="text-[11px] font-black text-white uppercase tracking-widest">ЖУРНАЛ СМЕНЫ СОСТОЯНИЙ</h3>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-text-muted font-bold">
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> ПОСЛЕДНИЕ 24 ЧАСА</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-dark-surface z-10">
              <tr className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-dark-border">
                <th className="p-4 px-8">ВРЕМЯ</th>
                <th className="p-4">АГРЕГАТ</th>
                <th className="p-4">ИЗМЕНЕНИЕ</th>
                <th className="p-4">ДИСПЕТЧЕР</th>
                <th className="p-4 px-8">ПРИЧИНА / КОММЕНТАРИЙ</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {statusLog.map(log => (
                <tr key={log.id} className="border-b border-dark-border/30 hover:bg-white/5 transition-colors">
                  <td className="p-4 px-8 font-mono text-text-muted">{format(new Date(log.timestamp), 'HH:mm:ss')} <span className="opacity-50 ml-1">{format(new Date(log.timestamp), 'dd.MM')}</span></td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-black text-white uppercase">{log.eqName}</span>
                      <span className="text-[9px] text-primary font-bold">{log.eqId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 font-black uppercase text-[10px]">
                      <span className="text-text-muted">{log.oldStatus}</span>
                      <ChevronRight className="w-3 h-3 text-primary" />
                      <span className={
                        log.newStatus === 'working' ? 'text-green-500' : 
                        log.newStatus === 'ppm' ? 'text-[#FFB800]' : 
                        log.newStatus === 'attention' ? 'text-[#D4D447]' : 'text-[#FF4D4D]'
                      }>{log.newStatus}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">Н</div>
                      <span className="font-bold text-gray-300">{log.author}</span>
                    </div>
                  </td>
                  <td className="p-4 px-8 italic text-text-muted">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className={`p-6 flex justify-between items-center ${
              modalType === 'accident' ? 'bg-accent-red/20 border-b border-accent-red/30' : 
              modalType === 'ppm' ? 'bg-[#FFB800]/20 border-b border-[#FFB800]/30' : 
              'bg-[#D4D447]/20 border-b border-[#D4D447]/30'
            }`}>
              <div className="flex items-center gap-3">
                {modalType === 'accident' ? <AlertTriangle className="text-accent-red" /> : <Plus className="text-white" />}
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">СОЗДАТЬ: {modalType === 'accident' ? 'АВАРИЯ' : modalType === 'ppm' ? 'ППР' : 'ВНИМАНИЕ'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl"><X className="w-6 h-6 text-white" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">ВЫБЕРИТЕ ОБОРУДОВАНИЕ</label>
                <select className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-primary">
                  {equipmentList.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">СЛУЖБА</label>
                <select className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-primary">
                  {MOCK_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">ОПИСАНИЕ / ПРИЧИНА</label>
                <textarea className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-primary min-h-[120px] resize-none" placeholder="Что произошло?"></textarea>
              </div>
              <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
                modalType === 'accident' ? 'bg-accent-red text-white' : 
                modalType === 'ppm' ? 'bg-[#FFB800] text-dark-bg' : 
                'bg-[#D4D447] text-dark-bg'
              }`}>
                ЗАРЕГИСТРИРОВАТЬ И ОСТАНОВИТЬ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatcherConsole;
