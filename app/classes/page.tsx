"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "next/link";

async function getClasses() {
  try {
    const res = await fetch("/api/classes", {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch classes:", error);
  }
  return [];
}

async function getClasses() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  const role = session.user.role;
  const userId = session.user.id;

  const url = new URL(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/classes`);
  if (role === "Teacher") {
    url.searchParams.set("teacherId", userId);
  } else if (role === "Student") {
    url.searchParams.set("studentId", userId);
  }

  try {
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Cookie: `next-auth.session-token=${session.user.id}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch classes:", error);
  }
  return [];
}

export default function ClassesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useState(() => {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "Teacher") {
      router.push("/dashboard");
      return;
    }

    getClasses().then((data) => {
      setClasses(data);
      setLoading(false);
    });
  }, [session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session?.user || session.user.role !== "Teacher") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground">
            Manage your classes and students
          </p>
        </div>
        <Link href="/classes/new">
          <Button>Create New Class</Button>
        </Link>
      </div>

      <ClassesList classes={classes} />

      {classes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any classes yet.
            </p>
            <Link href="/classes/new">
              <Button>Create Your First Class</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClassesList({ classes }: { classes: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterSubject || classItem.subject === filterSubject;

    return matchesSearch && matchesFilter;
  });

  const subjects = Array.from(
    new Set(classes.map((c) => c.subject).filter(Boolean))
  );

  if (classes.length === 0) return null;

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </Select>
      </div>

      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No classes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((classItem: any) => (
            <Card key={classItem._id}>
              <CardHeader>
                <CardTitle>{classItem.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{classItem.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade Level</p>
                  <p className="font-medium">{classItem.gradeLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="font-medium">
                    {classItem.studentIds?.length || 0} students
                  </p>
                </div>
                <Link href={`/classes/${classItem._id}`}>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

