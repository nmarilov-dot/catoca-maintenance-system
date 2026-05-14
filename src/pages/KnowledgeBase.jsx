import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Plus, Wrench, Clock, CheckCircle2, AlertTriangle, X, Search } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { MOCK_EQUIPMENT } from '../api/mockData';
import { useTranslation } from 'react-i18next';

const MaintenanceCalendar = () => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Май 2026
  const [selectedDay, setSelectedDay] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Имитация данных ППР
  const maintenanceEvents = [
    { id: 1, date: new Date(2026, 4, 15), title: 'ППР: Мельница ПСМ-1', eqId: 'f-2-1-1', type: 'planned', status: 'pending' },
    { id: 2, date: new Date(2026, 4, 15), title: 'Замена масла: Грохот 1', eqId: 'f-2-1-2', type: 'planned', status: 'pending' },
    { id: 3, date: new Date(2026, 4, 10), title: 'Инспекция: Бункер 2', eqId: 'f-2-1-3', type: 'inspection', status: 'completed' },
    { id: 4, date: new Date(2026, 4, 20), title: 'ППР: Питатель 1', eqId: 'f-2-1-4', type: 'planned', status: 'pending' },
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({
    start: addDays(monthStart, -monthStart.getDay() + 1), // Начинаем с понедельника
    end: addDays(monthEnd, 7 - monthEnd.getDay())
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="p-4 md:p-8 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CalendarIcon className="text-primary w-6 h-6" />
            {t('nav.calendar')}
          </h1>
          <p className="text-text-muted text-sm mt-1">График планово-предупредительных работ</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-dark-surface border border-dark-border rounded-xl p-1">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <div className="px-4 py-2 text-sm font-bold text-white uppercase min-w-[140px] text-center">
              {format(currentMonth, 'LLLL yyyy', { locale: ru })}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-dark-bg p-3 rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-dark-surface border border-dark-border rounded-3xl overflow-hidden flex flex-col shadow-xl">
          <div className="grid grid-cols-7 border-b border-dark-border bg-dark-bg/50">
            {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-text-muted tracking-widest">{day}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, idx) => {
              const dayEvents = maintenanceEvents.filter(e => isSameDay(e.date, day));
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[100px] p-2 border-r border-b border-dark-border/50 transition-all cursor-pointer relative group ${
                    !isSameMonth(day, currentMonth) ? 'opacity-20 grayscale' : 'hover:bg-primary/5'
                  } ${isSelected ? 'bg-primary/10 ring-1 ring-inset ring-primary/50' : ''}`}
                >
                  <span className={`text-xs font-bold ${isToday(day) ? 'bg-primary text-dark-bg px-1.5 py-0.5 rounded shadow-lg shadow-primary/20' : 'text-text-muted'}`}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`text-[8px] p-1 rounded font-bold truncate border ${
                          event.status === 'completed' 
                            ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                            : 'bg-primary/10 border-primary/30 text-primary'
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                  
                  {isSameMonth(day, currentMonth) && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected Day Details */}
        <div className="flex flex-col gap-6">
          <div className="bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-lg flex-1">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              ПЛАН НА {selectedDay ? format(selectedDay, 'dd MMMM', { locale: ru }).toUpperCase() : 'ДЕНЬ'}
            </h3>
            
            <div className="space-y-4">
              {selectedDay ? (
                maintenanceEvents.filter(e => isSameDay(e.date, selectedDay)).length > 0 ? (
                  maintenanceEvents.filter(e => isSameDay(e.date, selectedDay)).map(event => (
                    <div key={event.id} className="p-4 bg-dark-bg border border-dark-border rounded-2xl group hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          event.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
                        }`}>
                          {event.status === 'completed' ? 'Выполнено' : 'В плане'}
                        </span>
                        <Wrench className="w-4 h-4 text-text-muted" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{event.title}</h4>
                      <p className="text-[10px] text-text-muted mb-4">{MOCK_EQUIPMENT.find(e => e.id === event.eqId)?.name}</p>
                      
                      <button className="w-full py-2 bg-dark-surface border border-dark-border rounded-lg text-[9px] font-black uppercase text-text-muted hover:text-white hover:border-primary transition-all">
                        ОТКРЫТЬ ТИКЕТ
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-dark-bg border border-dark-border rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-text-muted opacity-20" />
                    </div>
                    <p className="text-xs text-text-muted italic">Работ не запланировано</p>
                  </div>
                )
              ) : (
                <div className="py-10 text-center text-text-muted text-xs italic">
                  Выберите день в календаре
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> СЛЕДУЮЩИЙ ППР
            </h4>
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Мельница ПСМ-1</p>
              <p className="text-[10px] text-text-muted">Через 1 день (15 мая)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-dark-surface border border-dark-border rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 bg-primary/10 border-b border-primary/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">ПЛАНИРОВАНИЕ ТО</h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">ДАТА ПРОВЕДЕНИЯ</label>
                  <input type="date" className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">ТИП РАБОТ</label>
                  <select className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-primary">
                    <option>Плановое ТО</option>
                    <option>Инспекция</option>
                    <option>Смазка/Замена масла</option>
                    <option>Замена футеровки</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">ОБОРУДОВАНИЕ</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <select className="w-full bg-dark-bg border border-dark-border rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary appearance-none">
                    <option value="" disabled selected>Поиск по базе...</option>
                    {MOCK_EQUIPMENT.filter(e => e.isEquipment).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">ОПИСАНИЕ РАБОТ</label>
                <textarea 
                  className="w-full bg-dark-bg border border-dark-border rounded-2xl px-4 py-4 text-sm text-white outline-none focus:border-primary min-h-[100px] resize-none" 
                  placeholder="Перечень регламентных работ..."
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-2 bg-primary/20 rounded-lg"><Info className="w-4 h-4 text-primary" /></div>
                <div className="text-[10px] text-text-muted leading-relaxed">
                  При создании планового ТО система автоматически создаст <span className="text-primary font-bold">черновик заявки</span> и зарезервирует необходимые ТМЦ на складе.
                </div>
              </div>
            </div>

            <div className="p-6 bg-dark-bg/50 border-t border-dark-border flex gap-4">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 px-6 py-3 border border-dark-border rounded-xl text-sm font-bold text-text-muted hover:bg-dark-surface-light transition-all"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={() => {
                  alert('ТО добавлено!');
                  setIsCreateModalOpen(false);
                }}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-dark-bg font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceCalendar;
