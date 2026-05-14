import React from 'react';
import { Settings, Users, Shield, Database, Bell, Layout, ArrowRight, ChevronRight, Globe, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Admin = () => {
  const { t } = useTranslation();

  const sections = [
    { id: 'users', title: 'Пользователи', icon: Users, description: 'Управление учетными записями и правами доступа.' },
    { id: 'roles', title: 'Роли и права', icon: Shield, description: 'Настройка полномочий для диспетчеров и механиков.' },
    { id: 'data', title: 'База данных', icon: Database, description: 'Экспорт, импорт и очистка архивных данных.' },
    { id: 'notif', title: 'Уведомления', icon: Bell, description: 'Настройка каналов связи и системных алертов.' },
    { id: 'system', title: 'Системные настройки', icon: Globe, description: 'Общие параметры приложения и локализация.' },
    { id: 'ui', title: 'Интерфейс', icon: Layout, description: 'Брендирование и визуальные параметры консолей.' },
  ];

  return (
    <div className="p-4 md:p-8 h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="text-primary w-6 h-6" />
            {t('nav.admin')}
          </h1>
          <p className="text-text-muted text-sm mt-1">Панель управления системой и конфигурация</p>
        </div>
        <button className="px-6 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-all flex items-center gap-2">
          <Save className="w-4 h-4" />
          СОХРАНИТЬ ВСЁ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(section => (
          <div 
            key={section.id}
            className="p-6 bg-dark-surface border border-dark-border rounded-3xl hover:border-primary/50 transition-all group cursor-pointer shadow-lg"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 rounded-2xl bg-dark-bg border border-dark-border text-primary group-hover:scale-110 transition-transform">
                <section.icon className="w-6 h-6" />
              </div>
              <ChevronRight className="text-text-muted group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">{section.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">{section.description}</p>
            <div className="pt-4 border-t border-dark-border/50 flex justify-between items-center">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Настроить</span>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 mt-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Режим отладки</h3>
            <p className="text-sm text-text-muted leading-relaxed">Включение расширенного логирования и инструментов разработчика. Рекомендуется только для технического персонала при проведении работ по обслуживанию ПО.</p>
          </div>
          <div className="w-16 h-8 bg-dark-bg rounded-full p-1 relative border border-dark-border cursor-pointer">
            <div className="w-6 h-6 bg-text-muted rounded-full transition-all"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
