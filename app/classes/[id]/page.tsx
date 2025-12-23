"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClass();
  }, [params.id]);

  const fetchClass = async () => {
    try {
      const res = await fetch(`/api/classes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setClassData(data.data);
      } else {
        setError("Failed to load class");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
      const res = await fetch(`/api/classes/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/classes");
      } else {
        setError("Failed to delete class");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !classData) {
    return <div className="text-destructive">{error || "Class not found"}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          <p className="text-muted-foreground">{classData.subject}</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/classes/${params.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{classData.subject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade Level</p>
              <p className="font-medium">{classData.gradeLevel}</p>
            </div>
            {classData.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{classData.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Teacher</p>
              <p className="font-medium">
                {classData.teacherId?.name || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students ({classData.studentIds?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {classData.studentIds && classData.studentIds.length > 0 ? (
              <div className="space-y-2">
                {classData.studentIds.map((student: any) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No students enrolled yet
              </p>
            )}
            <div className="mt-4">
              <Link href={`/classes/${params.id}/students`}>
                <Button variant="outline" className="w-full">
                  Manage Students
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={`/resources?classId=${params.id}`}>
            <Button variant="outline">View Class Resources</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={`/schedule?classId=${params.id}`}>
            <Button variant="outline">View Class Schedule</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

