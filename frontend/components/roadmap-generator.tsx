"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateRoadmap } from "@/app/actions/generate-roadmap"
import RoadmapModal from "@/components/roadmap-modal"
import type { Roadmap } from "@/types/roadmap"

const formSchema = z.object({
  category: z.enum(["education", "software"], {
    required_error: "Please select a category.",
  }),
  topic: z.string().min(2, {
    message: "Topic must be at least 2 characters.",
  }),
  currentLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your current level.",
  }),
  goals: z.string().min(10, {
    message: "Please describe your goals in at least 10 characters.",
  }),
  timeframe: z.enum(["1month", "3months", "6months", "1year"], {
    required_error: "Please select a timeframe.",
  }),
})

export default function RoadmapGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "education",
      topic: "",
      currentLevel: "beginner",
      goals: "",
      timeframe: "3months",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    try {
      const generatedRoadmap = await generateRoadmap(values)
      setRoadmap(generatedRoadmap)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Failed to generate roadmap:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <Tabs defaultValue="education" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="software">Software Development</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Select
                        onValueChange={(value: "education" | "software") => {
                          field.onChange(value)
                          form.setValue("topic", "")
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="software">Software Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value="education">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Educational Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Machine Learning, History, Mathematics" {...field} />
                        </FormControl>
                        <FormDescription>Enter the subject or field you want to learn about.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="software">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Development Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Web Development, Mobile Apps, DevOps" {...field} />
                        </FormControl>
                        <FormDescription>Enter the technology or development area you want to learn.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Your current knowledge level in this area.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeframe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1month">1 Month</SelectItem>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>How long you plan to spend on this learning journey.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you want to achieve with this learning path..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Be specific about what you want to accomplish.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  "Generate Roadmap"
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </div>

      {roadmap && <RoadmapModal roadmap={roadmap} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </>
  )
}
