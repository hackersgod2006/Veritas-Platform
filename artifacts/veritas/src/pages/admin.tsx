import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  useGetAdminStats,
  useListPendingVerifications,
  useApproveVerification,
  useRejectVerification,
  getGetAdminStatsQueryKey,
  getListPendingVerificationsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, Users, Briefcase, Building, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type PendingItem = {
  id: number;
  name: string;
  email: string;
  country: string | null;
  skillsCategory: string | null;
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<PendingItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: stats } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });

  const { data: pendingVerifications } = useListPendingVerifications({
    query: { queryKey: getListPendingVerificationsQueryKey() }
  });

  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();

  const handleApprove = (id: number) => {
    approveMutation.mutate({ professionalId: id }, {
      onSuccess: () => {
        toast.success("Verification Approved", { description: "Professional has been notified." });
        queryClient.invalidateQueries({ queryKey: getListPendingVerificationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
      onError: () => toast.error("Action failed")
    });
  };

  const handleRejectSubmit = () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim() || "Your application did not meet our current verification standards.";
    rejectMutation.mutate({ professionalId: rejectTarget.id, data: { reason } }, {
      onSuccess: () => {
        toast.success("Verification Rejected", { description: `${rejectTarget.name} has been notified by email.` });
        queryClient.invalidateQueries({ queryKey: getListPendingVerificationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setRejectTarget(null);
        setRejectReason("");
      },
      onError: () => toast.error("Action failed")
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#C9A84C]" />
            Admin Infrastructure
          </h1>
          <p className="text-muted-foreground mt-1">Veritas Infrastructure Systems — Internal Operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0 },
            { icon: Briefcase, label: "Professionals", value: stats?.totalProfessionals ?? 0 },
            { icon: Building, label: "Clients", value: stats?.totalClients ?? 0 },
            { icon: Clock, label: "Waitlist", value: stats?.waitlistCount ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
                  <Icon className="w-4 h-4" /> {label}
                </div>
                <div className="text-3xl font-bold text-primary">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Verifications
              {pendingVerifications && pendingVerifications.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {pendingVerifications.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVerifications && pendingVerifications.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVerifications.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.email}</TableCell>
                        <TableCell>{item.country || "—"}</TableCell>
                        <TableCell>{item.skillsCategory || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50 gap-1"
                              onClick={() => handleApprove(item.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 gap-1"
                              onClick={() => setRejectTarget(item as PendingItem)}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No pending verifications</p>
                <p className="text-sm mt-1">All applications have been reviewed.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) { setRejectTarget(null); setRejectReason(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Verification — {rejectTarget?.name}</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. This will be sent to the professional via email.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label htmlFor="rejection-reason" className="text-sm font-medium mb-2 block">
              Rejection Reason
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="e.g. Portfolio does not demonstrate sufficient enterprise-level experience. Please reapply with additional case studies."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Leave blank to use the default message.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white gap-1"
              onClick={handleRejectSubmit}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="w-4 h-4" />
              {rejectMutation.isPending ? "Sending..." : "Reject & Notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
