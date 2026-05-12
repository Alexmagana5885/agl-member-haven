import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Mail, Phone, CalendarDays, Download, MoreVertical, Pencil, Trash2, Save, X } from "lucide-react";


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
  updateMemberDetails,
  deleteMember,
  type BasicMember,
  type MemberDetails,
  type MemberType,
} from "@/services/members";

import { downloadCompletionLetter, getPassportImageUrl } from "@/services/members_files";



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

  const [editing, setEditing] = useState(false);
  const [editDetails, setEditDetails] = useState<MemberDetails | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);


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

  const enterEditMode = () => {
    if (!details) return;
    setEditDetails({ ...details });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditDetails(null);
  };

  const submitEditSave = async () => {
    if (!selectedMember || !editDetails) return;
    setEditSubmitting(true);
    try {
      const { member_type, ...rest } = editDetails;
await updateMemberDetails(selectedMember.member_type, selectedMember.id, rest);
      const data = await fetchMemberDetails(selectedMember.member_type, selectedMember.id);
      setDetails(data.member);
      setEditing(false);
      setEditDetails(null);
toast({ title: "Member updated", variant: "default" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setEditSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    setDeleteSubmitting(true);
    try {
      await deleteMember(selectedMember.member_type, selectedMember.id);
toast({ title: "Member deleted", variant: "default" });
      setDeleteConfirmOpen(false);
      setMoreOpen(false);
      setSelectedMember(null);
      setDetails(null);
      setEditing(false);
      setEditDetails(null);
      await loadMembers(memberType);
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setDeleteSubmitting(false);
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

            <div className="relative overflow-x-auto">
              <div className="grid" style={{ gridTemplateRows: "auto minmax(0, 1fr)" }}>
                <div className="w-full" aria-hidden="true">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden md:table-cell">Phone</TableHead>
                        <TableHead className="text-right">More</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                  <Table>
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
              </div>
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
                {/* <Badge variant="secondary">Member Details</Badge> */}
                <span className="truncate">{selectedMember?.name || ""}</span>
              </DialogTitle>
              <DialogDescription>Full member information.</DialogDescription>
            </DialogHeader>

            {detailsLoading ? (
              <div className="py-6 text-center text-muted-foreground">Loading details...</div>
            ) : !details || !selectedMember ? (
              <div className="py-6 text-center text-muted-foreground">No details.</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-600/10 via-sky-500/10 to-cyan-400/10 border border-blue-600/20 shadow-sm p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white border border-blue-600/20 overflow-hidden flex items-center justify-center shadow-sm">
                        {(() => {
                          const passportPath = !editing ? (details as any)?.passport_image : undefined;
                          const url = passportPath ? getPassportImageUrl(selectedMember!.member_type, selectedMember!.id, passportPath) : null;
                          return url ? (
                            <img src={url} alt="Passport" className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-xs text-muted-foreground">No Image</div>
                          );
                        })()}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">
                          {selectedMember?.name || ""}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedMember?.member_type === "personal" ? "Personal Member" : "Organisation Member"}
                        </div>
                      </div>
                    </div>
                    {!editing ? (
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => {
                            setEditDetails(details);
                            setEditing(false);
                          }}
                          style={{ display: "none" }}
                        >
                          Hidden
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-blue-600/10 to-cyan-500/10 border-b border-blue-600/20">
                    <div className="text-sm font-semibold text-foreground">Member Information</div>
                  </div>
                  <div className="max-h-[52vh] overflow-y-auto">
                    <Table>
                      <TableBody>
                        {(editing ? Object.entries(editDetails || {}).filter(([k]) => k !== "member_type") : detailsRows
                          .filter((r) => {
                            const k = r.key;
                            return ![
                              "password",
                              "payment_Number",
                              "payment_code",
                              "payment_date",
                            ].includes(k);
                          })
                          .map((r) => [r.key, r.value] as const)
                        ).map((pair: any) => {
                          const key = pair[0] as string;
                          const value = editing ? (pair[1] ?? "") : (pair[1] ?? "");

                          const passportPath = !editing ? (details as any)?.passport_image : null;
                          if (!editing && (key === "passport_image" || key === "completion_letter" || key === "payment_Number" || key === "payment_code" || key === "payment_date" || key === "password")) {
                            return null;
                          }

                          // Special render: completion_letter & passport_image
                          if (!editing && key === "completion_letter") {
                            const path = String((details as any)?.completion_letter || "");
                            return (
                              <TableRow key={key}>
                                <TableCell className="w-[260px] font-medium">Completion Letter</TableCell>
                                <TableCell>
                                  {path ? (
                                    <Button
                                      variant="outline"
                                      className="gap-2"
                                      onClick={async () => {
                                        try {
                                          await downloadCompletionLetter(selectedMember!.member_type, selectedMember!.id, path);
                                        } catch (e: any) {
                                          toast({ title: "Download failed", description: e?.message || "Please try again", variant: "destructive" });
                                        }
                                      }}
                                    >
                                      <Download className="h-4 w-4" /> Download Letter
                                    </Button>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }

                          if (!editing && key === "passport_image") {
                            const path = String((details as any)?.passport_image || "");
                            return (
                              <TableRow key={key}>
                                <TableCell className="w-[260px] font-medium">Passport Image</TableCell>
                                <TableCell className="flex items-center gap-3">
                                  {path ? (
                                    <img
                                      alt="Passport"
                                      src={getPassportImageUrl(selectedMember!.member_type, selectedMember!.id, path)}
                                      className="h-12 w-12 rounded-md border border-blue-600/20 object-cover shadow-sm"
                                    />
                                  ) : (
                                    <div className="text-muted-foreground">-</div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }

                          return (
                            <TableRow key={key}>
                              <TableCell className="w-[260px] font-medium">{key.replace(/_/g, " ")}</TableCell>
                              <TableCell className="break-words">
                                {editing ? (
                                  <input
                                    aria-label={key}
                                    className="w-full rounded-md border px-2 py-1 text-sm"
                                    value={String(value ?? "")}
                                    onChange={(e) =>
                                      setEditDetails((prev) => {
                                        if (!prev) return prev;
                                        return { ...prev, [key]: e.target.value } as MemberDetails;
                                      })
                                    }
                                  />
                                ) : (
                                  <span>{String(value ?? "") || "-"}</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}



            <DialogFooter className="gap-2 sm:gap-0">
              {!editing ? (
                <>
                  <Button variant="outline" onClick={() => setMoreOpen(false)}>
                    Close
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={enterEditMode} disabled={!details || detailsLoading} className="gap-2">
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={!details || detailsLoading}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                  <Button onClick={handlePrintSelected} disabled={!selectedMember || detailsLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Download className="h-4 w-4 mr-2" /> Print Information
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={cancelEdit} disabled={editSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={submitEditSave} disabled={!editDetails || editSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    {editSubmitting ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(false)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete member?</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleteSubmitting}>
                Cancel
              </Button>
              <Button onClick={confirmDelete} disabled={deleteSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}


