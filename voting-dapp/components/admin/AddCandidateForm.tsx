"use client";

import { useState, useRef } from "react";
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
import { uploadFileToIPFS, getIPFSUrl } from "@/services/ipfsService";

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageHash: "",
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    try {
      toast.info("Uploading image to IPFS...");
      const cid = await uploadFileToIPFS(file);
      form.setValue("imageHash", cid);
      toast.success("Image uploaded to IPFS", {
        description: `CID: ${cid}`,
      });
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await addCandidate(data.name, data.description, data.imageHash || "");
      if (success) {
        form.reset();
        setPreviewImage(null);
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
                  <FormLabel>Candidate Image</FormLabel>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="IPFS CID (optional)"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    {previewImage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="max-h-40 rounded-md"
                        />
                      </div>
                    )}
                    {field.value && !previewImage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">IPFS Image:</p>
                        <img 
                          src={getIPFSUrl(field.value)} 
                          alt="IPFS image" 
                          className="max-h-40 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isSubmitting || uploadingImage}>
              {isSubmitting ? "Adding..." : "Add Candidate"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}