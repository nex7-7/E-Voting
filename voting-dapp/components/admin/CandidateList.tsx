"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Candidate } from "@/lib/blockchain/contract";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";

const columns: ColumnDef<Candidate>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate" title={row.original.description}>
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "imageHash",
    header: "Image Hash",
    cell: ({ row }) => (
      <div className="font-mono text-xs max-w-[120px] truncate" title={row.original.imageHash}>
        {row.original.imageHash || "-"}
      </div>
    ),
  },
  {
    accessorKey: "voteCount",
    header: "Votes",
  },
];

export default function CandidateList() {
  const { candidates, refreshCandidates } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the load function to prevent unnecessary re-renders
  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    await refreshCandidates();
    setIsLoading(false);
  }, [refreshCandidates]);

  useEffect(() => {
    loadCandidates();
    // Refresh candidates every 30 seconds instead of on every render
    const intervalId = setInterval(loadCandidates, 30000);
    return () => clearInterval(intervalId);
  }, [loadCandidates]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>
            List of all registered candidates
          </CardDescription>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => loadCandidates()}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-24 flex items-center justify-center">
            Loading candidates...
          </div>
        ) : (
          <DataTable columns={columns} data={candidates} />
        )}
      </CardContent>
    </Card>
  );
}