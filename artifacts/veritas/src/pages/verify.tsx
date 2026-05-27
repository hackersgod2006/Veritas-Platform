import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubmitVerification } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useLocation } from "wouter";

const verifySchema = z.object({
  bio: z.string().min(20, "Please provide a more detailed professional summary"),
  country: z.string().min(1, "Country is required"),
  skillsCategory: z.string().min(1, "Category is required"),
  proficiencyLevel: z.string().min(1, "Level is required"),
  portfolioLinks: z.string().optional(),
  workHistory: z.string().min(20, "Work history is required"),
  consent: z.boolean().refine(val => val === true, "You must agree to the verification terms")
});

export default function VerifyPage() {
  const submitVerification = useSubmitVerification();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      bio: "",
      country: "",
      skillsCategory: "",
      proficiencyLevel: "",
      portfolioLinks: "",
      workHistory: "",
      consent: false,
    },
  });

  const onSubmit = (data: z.infer<typeof verifySchema>) => {
    const payload = {
      bio: data.bio,
      country: data.country,
      skillsCategory: data.skillsCategory,
      proficiencyLevel: data.proficiencyLevel,
      workHistory: data.workHistory,
      portfolioLinks: data.portfolioLinks ? data.portfolioLinks.split(",").map(s => s.trim()) : [],
    };

    submitVerification.mutate({ data: payload }, {
      onSuccess: () => {
        toast.success("Application Submitted", {
          description: "Your application will be reviewed within 48 hours."
        });
        setLocation("/dashboard/professional");
      },
      onError: () => {
        toast.error("Submission Failed", {
          description: "Please check your inputs and try again."
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-secondary-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <Card className="w-full max-w-[600px] shadow-md border-border">
          <CardHeader className="text-center pb-8 border-b">
            <CardTitle className="text-2xl font-bold text-primary">Trust Passport Verification</CardTitle>
            <CardDescription>Institutional vetting application</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-primary border-b pb-2">Step 1: Personal & Professional Info</h3>
                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <Label>Country of Residence</Label>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Nigeria">Nigeria</SelectItem>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Pakistan">Pakistan</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Philippines">Philippines</SelectItem>
                          <SelectItem value="Brazil">Brazil</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <Label>Professional Summary</Label>
                      <FormControl><Textarea {...field} placeholder="Detailed professional bio..." className="h-24" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-primary border-b pb-2">Step 2: Skills & Expertise</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="skillsCategory" render={({ field }) => (
                      <FormItem>
                        <Label>Primary Category</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                            <SelectItem value="Data Science">Data Science</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Product Management">Product Management</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="proficiencyLevel" render={({ field }) => (
                      <FormItem>
                        <Label>Proficiency</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                            <SelectItem value="Expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-primary border-b pb-2">Step 3 & 4: Evidence</h3>
                  <FormField control={form.control} name="portfolioLinks" render={({ field }) => (
                    <FormItem>
                      <Label>Portfolio Links (comma separated)</Label>
                      <FormControl><Input {...field} placeholder="https://github.com/..., https://linkedin.com/..." /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="workHistory" render={({ field }) => (
                    <FormItem>
                      <Label>Work History</Label>
                      <FormControl><Textarea {...field} placeholder="List relevant roles and accomplishments..." className="h-32" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <FormField control={form.control} name="consent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md bg-muted/50">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label>Consent to Background Verification</Label>
                        <p className="text-sm text-muted-foreground">I hereby authorize Veritas Infrastructure Systems to verify the information provided and conduct necessary background checks.</p>
                      </div>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground h-12" disabled={submitVerification.isPending}>
                  {submitVerification.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
