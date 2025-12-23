import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AccountSwitchProvider } from "@/components/providers/AccountSwitchProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Easy School - School Management Platform",
  description: "A comprehensive platform connecting teachers, students, and parents",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <AccountSwitchProvider>{children}</AccountSwitchProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

