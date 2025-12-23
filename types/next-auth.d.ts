import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "Teacher" | "Student" | "Parent";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "Teacher" | "Student" | "Parent";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "Teacher" | "Student" | "Parent";
  }
}

