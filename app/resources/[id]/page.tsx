"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResourcePreview } from "@/components/ResourcePreview";
import Link from "next/link";

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResource();
  }, [params.id]);

  const fetchResource = async () => {
    try {
      const res = await fetch(`/api/resources/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setResource(data.data);
      } else {
        setError("Failed to load resource");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const res = await fetch(`/api/resources/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/resources");
      } else {
        setError("Failed to delete resource");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !resource) {
    return <div className="text-destructive">{error || "Resource not found"}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{resource.title}</h1>
          <p className="text-muted-foreground">
            {resource.classId?.name || "Resource Details"}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/resources?classId=${resource.classId?._id}`}>
            <Button variant="outline">Back to Resources</Button>
          </Link>
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>Download</Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ResourcePreview resource={resource} showFullDetails={true} />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">File Type</p>
                <p className="font-medium">{resource.fileType}</p>
              </div>
              {resource.fileSize && (
                <div>
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="font-medium">
                    {(resource.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
              {resource.createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {resource.classId && (
            <Card>
              <CardHeader>
                <CardTitle>Class</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/classes/${resource.classId._id}`}>
                  <Button variant="outline" className="w-full">
                    View Class
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

