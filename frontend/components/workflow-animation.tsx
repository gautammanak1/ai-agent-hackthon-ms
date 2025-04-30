"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Milestone } from "@/types/roadmap"
import { BookOpen, Code, Lightbulb, CheckCircle2, GraduationCap, ArrowRight } from "lucide-react"

interface WorkflowAnimationProps {
  milestones: Milestone[]
}

export default function WorkflowAnimation({ milestones }: WorkflowAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % milestones.length)
      }, 3000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, milestones.length])

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
    if (isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={togglePlayPause}
          className="text-sm flex items-center px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isPlaying ? "Pause Animation" : "Play Animation"}
        </button>
      </div>

      <div className="relative h-[300px] bg-gray-50 dark:bg-gray-900 rounded-lg p-6 overflow-hidden border border-gray-200 dark:border-gray-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center p-6"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-800">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                  {getMilestoneIcon(milestones[currentStep].type)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{milestones[currentStep].title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{milestones[currentStep].duration}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{milestones[currentStep].description}</p>

              {milestones[currentStep].tasks && milestones[currentStep].tasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Tasks:</h4>
                  <ul className="space-y-1">
                    {milestones[currentStep].tasks.slice(0, 3).map((task, taskIndex) => (
                      <motion.li
                        key={taskIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + taskIndex * 0.1 }}
                        className="flex items-start"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-black dark:text-white" />
                        <span className="text-sm">{task}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1">
          {milestones.map((_, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentStep === index
                    ? "bg-black dark:bg-white"
                    : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
              {index < milestones.length - 1 && <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getMilestoneIcon(type: string) {
  switch (type) {
    case "learning":
      return <BookOpen className="w-6 h-6 text-blue-500" />
    case "project":
      return <Code className="w-6 h-6 text-purple-500" />
    case "concept":
      return <Lightbulb className="w-6 h-6 text-yellow-500" />
    case "assessment":
      return <CheckCircle2 className="w-6 h-6 text-green-500" />
    default:
      return <GraduationCap className="w-6 h-6 text-slate-500" />
  }
}
