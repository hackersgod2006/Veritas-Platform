import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProject } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListMyProjectsQueryKey } from "@workspace/api-client-react";

const projectSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  description: z.string().min(20, "Description is too short"),
  skillsRequired: z.string().min(2, "List at least one skill"),
  duration: z.string().min(1, "Duration is required"),
  budgetMin: z.coerce.number().min(10),
  budgetMax: z.coerce.number().min(10),
  preferredTier: z.string().min(1, "Preferred tier is required"),
});

export default function PostProjectPage() {
  const createProject = useCreateProject();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      skillsRequired: "",
      duration: "",
      budgetMin: 30,
      budgetMax: 150,
      preferredTier: "",
    },
  });

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    const payload = {
      ...data,
      skillsRequired: data.skillsRequired.split(",").map(s => s.trim()),
    };

    createProject.mutate({ data: payload }, {
      onSuccess: () => {
        toast.success("Project Posted", {
          description: "We will match you with the top 3 verified candidates within 24 hours."
        });
        queryClient.invalidateQueries({ queryKey: getListMyProjectsQueryKey() });
        setLocation("/dashboard/client");
      },
      onError: () => {
        toast.error("Error", {
          description: "Could not post project. Please try again."
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-secondary-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-[700px] shadow-md border-border">
          <CardHeader className="text-center pb-8 border-b">
            <CardTitle className="text-2xl font-bold text-primary">Post an Enterprise Project</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <Label>Project Title</Label>
                    <FormControl><Input {...field} placeholder="e.g. Senior React Engineer for Core Platform" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <Label>Project Description</Label>
                    <FormControl><Textarea {...field} placeholder="Detailed project requirements..." className="h-32" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="skillsRequired" render={({ field }) => (
                  <FormItem>
                    <Label>Required Skills (comma separated)</Label>
                    <FormControl><Input {...field} placeholder="React, TypeScript, Node.js" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem>
                      <Label>Duration</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="1-3 months">1-3 months</SelectItem>
                          <SelectItem value="3-6 months">3-6 months</SelectItem>
                          <SelectItem value="6+ months">6+ months</SelectItem>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="preferredTier" render={({ field }) => (
                    <FormItem>
                      <Label>Preferred Trust Tier</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Elite">Elite (801-1000)</SelectItem>
                          <SelectItem value="Advanced">Advanced (601-800)</SelectItem>
                          <SelectItem value="Trusted">Trusted (401-600)</SelectItem>
                          <SelectItem value="Any">Any Verified Tier</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="budgetMin" render={({ field }) => (
                    <FormItem>
                      <Label>Min Budget ($/hr)</Label>
                      <FormControl><Input {...field} type="number" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="budgetMax" render={({ field }) => (
                    <FormItem>
                      <Label>Max Budget ($/hr)</Label>
                      <FormControl><Input {...field} type="number" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground h-12" disabled={createProject.isPending}>
                  {createProject.isPending ? "Posting..." : "Post Project & Find Matches"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
