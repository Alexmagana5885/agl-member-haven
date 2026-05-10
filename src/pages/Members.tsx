import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Mail, Phone, CalendarDays, Download, MoreVertical } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";

import {
  downloadMemberDetailsPdf,
  downloadMembersRecordsPdf,
  fetchMemberDetails,
  fetchMembersByType,
  type BasicMember,
  type MemberDetails,
  type MemberType,
} from "@/services/members";

const toMemberTypeLabel = (t: MemberType) => (t === "personal" ? "Personal Members" : "Organisation Members");

export default function MembersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [memberType, setMemberType] = useState<MemberType>("personal");
  const [members, setMembers] = useState<BasicMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BasicMember | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [details, setDetails] = useState<MemberDetails | null>(null);

  const titleCount = useMemo(() => `Members (${members.length})`, [members.length]);

  async function loadMembers(type: MemberType) {
    setLoading(true);
    try {
      const data = await fetchMembersByType(type);
      setMembers(data.members || []);
    } catch (e: any) {
      toast({
        title: "Failed to load members",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers(memberType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberType]);

  const openMore = async (m: BasicMember) => {
    setSelectedMember(m);
    setDetails(null);
    setMoreOpen(true);

    setDetailsLoading(true);
    try {
      const data = await fetchMemberDetails(m.member_type, m.id);
      setDetails(data.member);
    } catch (e: any) {
      toast({
        title: "Failed to load member details",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handlePrintSelected = async () => {
    if (!selectedMember) return;
    try {
      await downloadMemberDetailsPdf(selectedMember.member_type, selectedMember.id);
    } catch (e: any) {
      toast({
        title: "Failed to print member info",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePrintRecords = async () => {
    try {
      await downloadMembersRecordsPdf(memberType);
    } catch (e: any) {
      toast({
        title: "Failed to print members records",
        description: e?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const detailsRows = useMemo(() => {
    if (!details) return [];
    return Object.entries(details)
      .filter(([k]) => k !== "member_type")
      .map(([k, v]) => ({ key: k, value: String(v ?? "") }));
  }, [details]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={memberType === "personal" ? "default" : "outline"}
              onClick={() => setMemberType("personal")}
              className="gap-2"
            >
              <Users className="h-4 w-4" /> Personal Members
            </Button>
            <Button
              type="button"
              variant={memberType === "organization" ? "default" : "outline"}
              onClick={() => setMemberType("organization")}
              className="gap-2"
            >
              <Users className="h-4 w-4" /> Organisation Members
            </Button>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Users className="h-5 w-5 text-accent-foreground" />
              {titleCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{toMemberTypeLabel(memberType)}</Badge>
              </div>

              <Button variant="outline" className="gap-2" onClick={handlePrintRecords}>
                <Download className="h-4 w-4" /> Print Members Records
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="text-right">More</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((m, idx) => (
                      <TableRow key={`${m.member_type}-${m.id}`} className="hover:bg-accent/30 transition-colors">
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{m.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {m.email}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {m.phone}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" /> {m.joined}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="gap-2 inline-flex" onClick={() => openMore(m)}>
                            <MoreVertical className="h-4 w-4" /> More
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={moreOpen}
          onOpenChange={(open) => {
            setMoreOpen(open);
            if (!open) {
              setSelectedMember(null);
              setDetails(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="secondary">Member Details</Badge>
                <span className="truncate">{selectedMember?.name || ""}</span>
              </DialogTitle>
              <DialogDescription>Full member information.</DialogDescription>
            </DialogHeader>

            {detailsLoading ? (
              <div className="py-6 text-center text-muted-foreground">Loading details...</div>
            ) : !details || !selectedMember ? (
              <div className="py-6 text-center text-muted-foreground">No details.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    {detailsRows.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="w-[260px] font-medium">{row.key.replace(/_/g, " ")}</TableCell>
                        <TableCell className="break-words">{row.value || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setMoreOpen(false)}>
                Close
              </Button>
              <Button onClick={handlePrintSelected} disabled={!selectedMember || detailsLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" /> Print Information
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

