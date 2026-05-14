import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [period, setPeriod] = useState('week'); // today, week, month, year

  return (
    <UIContext.Provider value={{ period, setPeriod }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
