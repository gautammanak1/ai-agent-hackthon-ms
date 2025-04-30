'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Page() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);

  const generateResume = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResumeText(data.resume);
    } catch (err) {
      console.error('Resume generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsDoc = () => {
    const blob = new Blob([resumeText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_resume.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="container px-4 py-8 md:py-12 mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-center mb-4">Resume Builder</h1>
          <p className="text-muted-foreground text-center mb-6">
            Paste a job description to generate a tailored resume using AI. Edit as needed and download.
          </p>

          <textarea
            className="w-full min-h-[150px] border rounded-md p-2"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />


          <Button onClick={generateResume} disabled={loading} className="mb-6">
            {loading ? 'Generating Resume...' : 'Generate Resume'}
          </Button>

          {resumeText && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Generated Resume</h2>
              <textarea
                className="w-full min-h-[300px] border rounded-md p-2"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <div className="flex gap-4 mt-4">
                <Button onClick={downloadAsDoc}>Download as .doc</Button>
                <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
