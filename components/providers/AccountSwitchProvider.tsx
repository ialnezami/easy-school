"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface AccountSwitchContextType {
  viewingAsChildId: string | null;
  setViewingAsChildId: (id: string | null) => void;
  isViewingAsChild: boolean;
}

const AccountSwitchContext = createContext<AccountSwitchContextType | undefined>(
  undefined
);

export function AccountSwitchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [viewingAsChildId, setViewingAsChildId] = useState<string | null>(null);

  useEffect(() => {
    // Reset when user changes
    setViewingAsChildId(null);
  }, [session?.user?.id]);

  const isViewingAsChild =
    session?.user?.role === "Parent" && viewingAsChildId !== null;

  return (
    <AccountSwitchContext.Provider
      value={{
        viewingAsChildId,
        setViewingAsChildId,
        isViewingAsChild,
      }}
    >
      {children}
    </AccountSwitchContext.Provider>
  );
}

export function useAccountSwitch() {
  const context = useContext(AccountSwitchContext);
  if (context === undefined) {
    throw new Error(
      "useAccountSwitch must be used within AccountSwitchProvider"
    );
  }
  return context;
}

