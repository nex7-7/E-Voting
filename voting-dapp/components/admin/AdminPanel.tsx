"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import AddCandidateForm from "@/components/admin/AddCandidateForm";
import RegisterVoterForm from "@/components/admin/RegisterVoterForm";
import ElectionControls from "@/components/admin/ElectionControls";
import CandidateList from "@/components/admin/CandidateList";

export default function AdminPanel() {
  const { isAdmin, isConnected } = useWeb3();
  
  if (!isConnected) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Connected</AlertTitle>
        <AlertDescription>
          Please connect your wallet to access the admin panel.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Only the contract administrator can access this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <AddCandidateForm />
        <RegisterVoterForm />
      </div>
      
      <ElectionControls />
      
      <CandidateList />
    </div>
  );
}