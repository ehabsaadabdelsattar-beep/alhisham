import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface BrochureRequestData {
  projectName: string;
  projectId?: string;
  brochureUrl?: string;
  masterplanUrl?: string;
  defaultType?: 'brochure' | 'masterplan' | 'both';
}

interface BrochureModalContextType {
  isOpen: boolean;
  requestData: BrochureRequestData | null;
  openBrochureModal: (data: BrochureRequestData) => void;
  closeBrochureModal: () => void;
}

const BrochureModalContext = createContext<BrochureModalContextType | undefined>(undefined);

export function BrochureModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestData, setRequestData] = useState<BrochureRequestData | null>(null);

  const openBrochureModal = useCallback((data: BrochureRequestData) => {
    setRequestData(data);
    setIsOpen(true);
  }, []);

  const closeBrochureModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Global delegator for buttons or links with [data-download-brochure] or [data-download-masterplan]
  useEffect(() => {
    const handleGlobalBrochureClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const trigger = target.closest<HTMLElement>('[data-download-brochure], [data-download-masterplan], [data-register-interest]');
      if (!trigger) return;

      e.preventDefault();

      const projectName = trigger.getAttribute('data-project-name') || 'Al Hisham Developments';
      const projectId = trigger.getAttribute('data-project-id') || undefined;
      const brochureUrl = trigger.getAttribute('data-brochure-url') || undefined;
      const masterplanUrl = trigger.getAttribute('data-masterplan-url') || undefined;
      const isMasterplan = trigger.hasAttribute('data-download-masterplan');

      openBrochureModal({
        projectName,
        projectId,
        brochureUrl,
        masterplanUrl,
        defaultType: isMasterplan ? 'masterplan' : 'brochure',
      });
    };

    document.addEventListener('click', handleGlobalBrochureClick);
    return () => document.removeEventListener('click', handleGlobalClickCapture);
    function handleGlobalClickCapture() {
      document.removeEventListener('click', handleGlobalBrochureClick);
    }
  }, [openBrochureModal]);

  return (
    <BrochureModalContext.Provider
      value={{
        isOpen,
        requestData,
        openBrochureModal,
        closeBrochureModal,
      }}
    >
      {children}
    </BrochureModalContext.Provider>
  );
}

export function useBrochureModal(): BrochureModalContextType {
  const context = useContext(BrochureModalContext);
  if (!context) {
    throw new Error('useBrochureModal must be used within a BrochureModalProvider');
  }
  return context;
}
