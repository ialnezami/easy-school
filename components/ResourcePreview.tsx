"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ResourcePreviewProps {
  resource: {
    _id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    classId?: {
      _id: string;
      name: string;
    };
    uploadedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    tags?: string[];
    createdAt?: string;
  };
  showFullDetails?: boolean;
}

export function ResourcePreview({ resource, showFullDetails = false }: ResourcePreviewProps) {
  const [imageError, setImageError] = useState(false);

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc") || type.includes("word")) return "📝";
    if (type.includes("xls") || type.includes("excel")) return "📊";
    if (type.includes("ppt") || type.includes("powerpoint")) return "📽️";
    if (type.includes("image") || type.includes("jpg") || type.includes("png")) return "🖼️";
    if (type.includes("video")) return "🎥";
    if (type.includes("audio")) return "🎵";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    return "📎";
  };

  const isImage = (fileType: string, fileUrl: string) => {
    const type = fileType.toLowerCase();
    const url = fileUrl.toLowerCase();
    return (
      type.includes("image") ||
      url.includes(".jpg") ||
      url.includes(".jpeg") ||
      url.includes(".png") ||
      url.includes(".gif") ||
      url.includes(".webp")
    );
  };

  const canPreview = isImage(resource.fileType, resource.fileUrl);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {resource.description}
              </p>
            )}
          </div>
          <span className="text-2xl ml-2">{getFileIcon(resource.fileType)}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {canPreview && !imageError && (
          <div className="w-full h-48 rounded-md overflow-hidden bg-muted">
            <img
              src={resource.fileUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        {showFullDetails && (
          <>
            {resource.classId && (
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="text-sm font-medium">{resource.classId.name}</p>
              </div>
            )}

            {resource.uploadedBy && (
              <div>
                <p className="text-xs text-muted-foreground">Uploaded by</p>
                <p className="text-sm font-medium">{resource.uploadedBy.name}</p>
              </div>
            )}

            {resource.createdAt && (
              <div>
                <p className="text-xs text-muted-foreground">Uploaded</p>
                <p className="text-sm font-medium">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </>
        )}

        <div>
          <p className="text-xs text-muted-foreground mb-1">File Type</p>
          <p className="text-sm font-medium">{resource.fileType}</p>
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tags</p>
            <div className="flex flex-wrap gap-1">
              {resource.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-4">
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              Download
            </Button>
          </a>
          {canPreview && (
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="default" className="w-full">
                Preview
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

