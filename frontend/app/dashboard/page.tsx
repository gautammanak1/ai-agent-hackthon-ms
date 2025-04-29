import { AppSidebar } from "@/components/app-sidebar"
import { ResumeAnalyzer } from "@/components/resume-analyzer";
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="container px-4 py-8 md:py-12 mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">Resume Analyzer</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Upload your resume to get an ATS compatibility score, personalized improvement suggestions, 
          and job recommendations matched to your skills and experience.
        </p>
      <ResumeAnalyzer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}