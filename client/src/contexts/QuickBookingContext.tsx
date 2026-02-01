import { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface QuickBookingContextValue {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const QuickBookingContext = createContext<QuickBookingContextValue | undefined>(undefined);

export function QuickBookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      open,
      openModal: () => setOpen(true),
      closeModal: () => setOpen(false),
    }),
    [open]
  );

  return <QuickBookingContext.Provider value={value}>{children}</QuickBookingContext.Provider>;
}

export function useQuickBooking() {
  const ctx = useContext(QuickBookingContext);
  if (!ctx) {
    throw new Error("useQuickBooking deve ser usado dentro de QuickBookingProvider");
  }
  return ctx;
}
