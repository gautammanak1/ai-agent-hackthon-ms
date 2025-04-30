"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Roadmap } from "@/types/roadmap"
import RoadmapTimeline from "@/components/roadmap-timeline"
import ResourceList from "@/components/resource-list"
import WorkflowAnimation from "@/components/workflow-animation"

interface RoadmapModalProps {
  roadmap: Roadmap
  isOpen: boolean
  onClose: () => void
}

export default function RoadmapModal({ roadmap, isOpen, onClose }: RoadmapModalProps) {
  const [activeTab, setActiveTab] = useState("timeline")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">{roadmap.title}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">{roadmap.description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="pt-4">
            <RoadmapTimeline milestones={roadmap.milestones} />
          </TabsContent>

          <TabsContent value="resources" className="pt-4">
            <ResourceList resources={roadmap.resources} />
          </TabsContent>

          <TabsContent value="workflow" className="pt-4">
            <WorkflowAnimation milestones={roadmap.milestones} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-black text-black dark:border-white dark:text-white"
          >
            Print Roadmap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
