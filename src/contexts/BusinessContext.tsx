import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BusinessInfo {
  shopName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}

interface BusinessContextType {
  businessInfo: BusinessInfo;
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void;
}

const defaultBusinessInfo: BusinessInfo = {
  shopName: 'Engada SPOT',
  address: 'Main Street, Manippai, Jaffna, Sri Lanka',
  phone: '+94 11 234 5678',
  email: 'hello@spot.lk'
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusinessInfo = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessInfo must be used within a BusinessProvider');
  }
  return context;
};

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(defaultBusinessInfo);

  const updateBusinessInfo = (info: Partial<BusinessInfo>) => {
    setBusinessInfo(prev => ({ ...prev, ...info }));
  };

  return (
    <BusinessContext.Provider value={{ businessInfo, updateBusinessInfo }}>
      {children}
    </BusinessContext.Provider>
  );
};