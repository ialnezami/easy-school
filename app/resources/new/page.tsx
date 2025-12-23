"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export default function NewResourcePage() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    fileUrl: "",
    fileType: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("classId", formData.classId);
      formDataToSend.append("fileUrl", formData.fileUrl);
      formDataToSend.append("fileType", formData.fileType);
      formDataToSend.append("tags", JSON.stringify(formData.tags.split(",").map(t => t.trim()).filter(Boolean)));

      const res = await fetch("/api/resources", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload resource");
        return;
      }

      router.push("/resources");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Resource</h1>
        <p className="text-muted-foreground">Share educational resources with your classes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="classId">Class *</Label>
              <Select
                id="classId"
                value={formData.classId}
                onChange={(e) =>
                  setFormData({ ...formData, classId: e.target.value })
                }
                required
              >
                <option value="">Select a class</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileUrl">File URL *</Label>
              <Input
                id="fileUrl"
                type="url"
                value={formData.fileUrl}
                onChange={(e) =>
                  setFormData({ ...formData, fileUrl: e.target.value })
                }
                placeholder="https://example.com/file.pdf"
                required
              />
              <p className="text-xs text-muted-foreground">
                For now, please provide a URL to the file. File upload will be added later.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileType">File Type *</Label>
              <Input
                id="fileType"
                value={formData.fileType}
                onChange={(e) =>
                  setFormData({ ...formData, fileType: e.target.value })
                }
                placeholder="PDF, DOCX, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="homework, assignment, notes"
              />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Resource"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

