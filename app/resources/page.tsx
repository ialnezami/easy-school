import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getResources() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  try {
    const url = new URL(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/resources`
    );
    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch resources:", error);
  }
  return [];
}

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const resources = await getResources();

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

      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No resources available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource: any) => (
            <Card key={resource._id}>
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resource.description && (
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">
                    {resource.classId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">File Type</p>
                  <p className="font-medium">{resource.fileType}</p>
                </div>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full">
                    Download
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

