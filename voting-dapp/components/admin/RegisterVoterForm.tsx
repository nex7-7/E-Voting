"use client";

import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Define registration methods
type RegistrationMethod = "single" | "multiple" | "csv";

// Define the form schemas with Zod
const singleVoterSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
});

const multipleVotersSchema = z.object({
  addresses: z
    .string()
    .min(1, "Addresses are required")
    .refine((val) => {
      const addresses = val.split("\n").map(addr => addr.trim()).filter(Boolean);
      return addresses.every(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));
    }, "One or more addresses are invalid. Each address should be on a new line."),
});

type SingleFormData = z.infer<typeof singleVoterSchema>;
type MultipleFormData = z.infer<typeof multipleVotersSchema>;

export default function RegisterVoterForm() {
  const { registerVoter, batchRegisterVoters, electionStarted } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>("single");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvAddresses, setCsvAddresses] = useState<string[]>([]);

  // Initialize the forms with react-hook-form
  const singleForm = useForm<SingleFormData>({
    resolver: zodResolver(singleVoterSchema),
    defaultValues: { address: "" },
  });

  const multipleForm = useForm<MultipleFormData>({
    resolver: zodResolver(multipleVotersSchema),
    defaultValues: { addresses: "" },
  });

  // Handle CSV file upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const addresses = text.split('\n')
        .map(line => line.trim())
        .filter(line => /^0x[a-fA-F0-9]{40}$/.test(line));
      
      setCsvAddresses(addresses);
    };
    reader.readAsText(file);
  };

  // Single voter registration
  const onSingleSubmit = async (data: SingleFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await registerVoter(data.address);
      if (success) {
        singleForm.reset();
        toast.success("Voter registered successfully");
      } else {
        toast.error("Failed to register voter. Transaction may have been rejected.");
      }
    } catch (error) {
      console.error("Error registering voter:", error);
      toast.error("Failed to register voter");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multiple voters registration
  const onMultipleSubmit = async (data: MultipleFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const addresses = data.addresses.split("\n").map(addr => addr.trim()).filter(Boolean);
      
      // Use batch registration for efficiency
      const success = await batchRegisterVoters(addresses);
      
      if (success) {
        multipleForm.reset();
        toast.success(`Successfully submitted transaction to register ${addresses.length} voters`);
      } else {
        toast.error("Failed to register voters. Transaction may have been rejected.");
      }
    } catch (error) {
      console.error("Error registering voters:", error);
      toast.error("Failed to register voters");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV upload submission
  const onCsvSubmit = async () => {
    if (isSubmitting || csvAddresses.length === 0) return;
    
    setIsSubmitting(true);
    try {
      // Use batch registration for CSV addresses
      const success = await batchRegisterVoters(csvAddresses);
      
      if (success) {
        setCsvFile(null);
        setCsvAddresses([]);
        toast.success(`Successfully submitted transaction to register ${csvAddresses.length} voters`);
      } else {
        toast.error("Failed to register voters. Transaction may have been rejected.");
      }
    } catch (error) {
      console.error("Error registering voters from CSV:", error);
      toast.error("Failed to register voters from CSV");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Voter</CardTitle>
        <CardDescription>Add eligible voters to the election</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="single" onValueChange={(value) => setRegistrationMethod(value as RegistrationMethod)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="single">Single Voter</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Voters</TabsTrigger>
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4">
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-4">
                <FormField
                  control={singleForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ethereum Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting || electionStarted}>
                  {isSubmitting ? "Registering..." : "Register Voter"}
                </Button>
                {electionStarted && (
                  <p className="text-sm text-red-500 mt-2">
                    Cannot register voters after election has started
                  </p>
                )}
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="multiple" className="space-y-4">
            <Form {...multipleForm}>
              <form onSubmit={multipleForm.handleSubmit(onMultipleSubmit)} className="space-y-4">
                <FormField
                  control={multipleForm.control}
                  name="addresses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ethereum Addresses (one per line)</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="0x...\n0x...\n0x..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting || electionStarted}>
                  {isSubmitting ? "Registering..." : "Register Voters"}
                </Button>
                {electionStarted && (
                  <p className="text-sm text-red-500 mt-2">
                    Cannot register voters after election has started
                  </p>
                )}
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">
                  Upload CSV File (One address per line)
                </label>
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvUpload}
                  disabled={isSubmitting || electionStarted}
                />
              </div>
              
              {csvAddresses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {csvAddresses.length} valid addresses found
                  </p>
                  <Button onClick={onCsvSubmit} disabled={isSubmitting || electionStarted}>
                    {isSubmitting ? "Registering..." : `Register ${csvAddresses.length} Voters`}
                  </Button>
                </div>
              )}
              {electionStarted && (
                <p className="text-sm text-red-500">
                  Cannot register voters after election has started
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}