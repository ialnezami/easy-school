"use client";

import { SessionProvider } from "./SessionProvider";
import { AccountSwitchProvider } from "./AccountSwitchProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AccountSwitchProvider>{children}</AccountSwitchProvider>
    </SessionProvider>
  );
}

