"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ResourcePreview } from "@/components/ResourcePreview";

export default function ResourcesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState(searchParams.get("classId") || "");
  const [filterTag, setFilterTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }
    fetchResources();
    fetchClasses();
  }, [session, filterClass]);

  const fetchResources = async () => {
    try {
      const url = new URL("/api/resources", window.location.origin);
      if (filterClass) {
        url.searchParams.set("classId", filterClass);
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const resourcesData = data.data || [];
        setResources(resourcesData);
        
        // Extract all unique tags
        const tags = new Set<string>();
        resourcesData.forEach((resource: any) => {
          if (resource.tags && Array.isArray(resource.tags)) {
            resource.tags.forEach((tag: string) => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags).sort());
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags?.some((tag: string) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesClass = !filterClass || resource.classId?._id === filterClass;
    const matchesTag = !filterTag || resource.tags?.includes(filterTag);
    
    return matchesSearch && matchesClass && matchesTag;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">
            Access and manage educational resources
          </p>
        </div>
        {session.user.role === "Teacher" && (
          <Link href="/resources/new">
            <Button>Upload Resource</Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search resources by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="flex-1"
          >
            <option value="">All Classes</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name}
              </option>
            ))}
          </Select>
          <Select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="flex-1"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {resources.length === 0
                ? "No resources available yet."
                : "No resources match your search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource: any) => (
            <ResourcePreview key={resource._id} resource={resource} showFullDetails={true} />
          ))}
        </div>
      )}
    </div>
  );
}

