"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAccountSwitch } from "./providers/AccountSwitchProvider";

export function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isViewingAsChild, viewingAsChildId, setViewingAsChildId } =
    useAccountSwitch();

  if (!session?.user) return null;

  const { role } = session.user;

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/classes", label: "Classes" },
    { href: "/resources", label: "Resources" },
    { href: "/schedule", label: "Schedule" },
    { href: "/messages", label: "Messages" },
    { href: "/profile", label: "Profile" },
  ];

  // Filter nav items based on role
  const filteredNavItems = navItems.filter((item) => {
    if (item.href === "/classes" && role !== "Teacher") {
      return false;
    }
    return true;
  });

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold text-primary">
            Easy School
          </Link>
          <div className="flex space-x-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isViewingAsChild && (
            <span className="text-sm text-muted-foreground">
              Viewing as Child
            </span>
          )}
          {role === "Parent" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingAsChildId(null)}
            >
              Switch Account
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}

