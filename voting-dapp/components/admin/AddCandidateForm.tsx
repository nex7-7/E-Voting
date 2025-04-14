"use client";

import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  imageHash: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddCandidateForm() {
  const { addCandidate, electionStarted } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageHash: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await addCandidate(data.name, data.description, data.imageHash || "");
      if (success) {
        form.reset();
        toast.success("Candidate added successfully");
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Error", {
        description: "Failed to add candidate",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (electionStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add Candidate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Cannot add candidates after election has started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Candidate</CardTitle>
        <CardDescription>Add a new candidate to the ballot</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Candidate Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Candidate description or platform"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Hash (IPFS)</FormLabel>
                  <FormControl>
                    <Input placeholder="IPFS hash (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Candidate"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}