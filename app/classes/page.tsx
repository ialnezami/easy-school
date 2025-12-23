import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default async function ClassesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "Teacher") {
    redirect("/dashboard");
  }

  const classes = await getClasses();

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

      {classes.length === 0 ? (
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem: any) => (
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

