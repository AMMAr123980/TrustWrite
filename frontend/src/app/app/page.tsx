import { WritingWorkspace } from "@/components/workspace/WritingWorkspace";

export const metadata = {
  title: "Workspace | TrustWrite - AI-Powered Writing Intelligence",
  description: "Interactive writing analysis, grammar corrections, readability metrics, and citation review.",
};

export default function AppPage() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100/60 text-slate-900">
      <WritingWorkspace />
    </div>
  );
}
