"use client"

import { BookOpen, Video, Globe, Code, FileText, Podcast, Youtube, Github } from "lucide-react"
import type { Resource } from "@/types/roadmap"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ResourceListProps {
  resources: Resource[]
}

export default function ResourceList({ resources }: ResourceListProps) {
  // Group resources by type
  const groupedResources = resources.reduce(
    (acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = []
      }
      acc[resource.type].push(resource)
      return acc
    },
    {} as Record<string, Resource[]>,
  )

  return (
    <div className="space-y-6">
      {Object.entries(groupedResources).map(([type, typeResources]) => (
        <div key={type} className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center">
            {getResourceTypeIcon(type)}
            <span className="ml-2">{formatResourceType(type)}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typeResources.map((resource, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{resource.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-gray-600 dark:text-gray-300">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-black dark:text-white hover:underline flex items-center font-medium"
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Visit Resource
                    </a>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {resource.level && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-black dark:border-white",
                          resource.level === "beginner" && "bg-gray-100 text-black dark:bg-gray-800 dark:text-white",
                          resource.level === "intermediate" &&
                            "bg-gray-200 text-black dark:bg-gray-700 dark:text-white",
                          resource.level === "advanced" && "bg-gray-300 text-black dark:bg-gray-600 dark:text-white",
                        )}
                      >
                        {resource.level}
                      </Badge>
                    )}
                    {resource.tags &&
                      resource.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function getResourceTypeIcon(type: string) {
  switch (type) {
    case "book":
      return <BookOpen className="w-5 h-5" />
    case "video":
      return <Video className="w-5 h-5" />
    case "course":
      return <FileText className="w-5 h-5" />
    case "website":
      return <Globe className="w-5 h-5" />
    case "repository":
      return <Github className="w-5 h-5" />
    case "tutorial":
      return <Code className="w-5 h-5" />
    case "youtube":
      return <Youtube className="w-5 h-5" />
    case "podcast":
      return <Podcast className="w-5 h-5" />
    default:
      return <BookOpen className="w-5 h-5" />
  }
}

function formatResourceType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1) + "s"
}
