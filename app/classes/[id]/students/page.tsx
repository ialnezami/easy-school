"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ManageStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<any>(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchClass();
  }, [params.id]);

  const fetchClass = async () => {
    try {
      const res = await fetch(`/api/classes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setClassData(data.data);
      }
    } catch (err) {
      setError("Failed to load class");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);

    try {
      // Find student by email
      const findRes = await fetch(`/api/users?email=${studentEmail}&role=Student`);
      if (!findRes.ok) {
        throw new Error("Student not found");
      }

      const findData = await findRes.json();
      const student = findData.data?.[0];

      if (!student) {
        throw new Error("Student not found");
      }

      // Add student to class
      const addRes = await fetch(`/api/classes/${params.id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student._id }),
      });

      if (!addRes.ok) {
        const data = await addRes.json();
        throw new Error(data.error || "Failed to add student");
      }

      setSuccess("Student added successfully");
      setStudentEmail("");
      fetchClass();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;

    try {
      const res = await fetch(
        `/api/classes/${params.id}/students?studentId=${studentId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        fetchClass();
      } else {
        setError("Failed to remove student");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <p className="text-muted-foreground">
          Add or remove students from {classData?.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddStudent} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Student Email</Label>
              <Input
                id="studentEmail"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />
            </div>
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add Student"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Enrolled Students ({classData?.studentIds?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classData?.studentIds && classData.studentIds.length > 0 ? (
            <div className="space-y-2">
              {classData.studentIds.map((student: any) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveStudent(student._id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No students enrolled yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

