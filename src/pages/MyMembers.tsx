import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Users, Pencil, Trash2, Plus } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useToast } from "@/hooks/use-toast";

import {
  createMyOrganizationMember,
  deleteMyOrganizationMember,
  fetchMyOrganizationMembers,
  type CreateMemberPayload,
  type MyMember,
  updateMyOrganizationMember,
} from "@/services/myMembers";

type ActionDialogState =
  | { open: false }
  | { open: true; member: MyMember };

const emptyForm: CreateMemberPayload = { name: "", email: "", phone: "" };

export default function MyMembersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [members, setMembers] = useState<MyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionDialog, setActionDialog] = useState<ActionDialogState>({ open: false });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<CreateMemberPayload>(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<CreateMemberPayload>(emptyForm);
  const [addSubmitting, setAddSubmitting] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<MyMember | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const titleCount = useMemo(() => `My Members (${members.length})`, [members.length]);

  async function loadMembers() {
    setLoading(true);
    try {
      const data = await fetchMyOrganizationMembers();
      setMembers(data.members || []);
    } catch (e: any) {
      toast({ title: "Failed to load members", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (member: MyMember) => {
    setActionDialog({ open: false });
    setEditForm({ name: member.name, email: member.email, phone: member.phone });
    setEditOpen(true);
  };

  const openDelete = (member: MyMember) => {
    setActionDialog({ open: false });
    setDeletingMember(member);
    setDeleteConfirmOpen(true);
  };

  const submitEdit = async () => {
    if (!actionDialog.open) {
      // member id comes from deletingMember? We'll derive from the edit dialog by keeping it in a hidden state.
    }
  };

  // Keep selected member id for edit
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  const onClickEditFromAction = () => {
    if (!actionDialog.open) return;
    setEditMemberId(actionDialog.member.id);
    openEdit(actionDialog.member);
  };

  const submitEditSave = async () => {
    if (!editMemberId) return;
    setEditSubmitting(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
      };

      if (!payload.name || !payload.email || !payload.phone) {
        toast({ title: "Missing fields", description: "Name, email and phone are required.", variant: "destructive" });
        return;
      }

      await updateMyOrganizationMember(editMemberId, payload);
      toast({ title: "Member updated", variant: "success" });
      setEditOpen(false);
      setEditMemberId(null);
      setEditForm(emptyForm);
      await loadMembers();
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setEditSubmitting(false);
    }
  };

  const submitAdd = async () => {
    setAddSubmitting(true);
    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
      };

      if (!payload.name || !payload.email || !payload.phone) {
        toast({ title: "Missing fields", description: "Name, email and phone are required.", variant: "destructive" });
        return;
      }

      await createMyOrganizationMember(payload);
      toast({ title: "Member added", variant: "success" });
      setAddOpen(false);
      setAddForm(emptyForm);
      await loadMembers();
    } catch (e: any) {
      toast({ title: "Add failed", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setAddSubmitting(false);
    }
  };

  const submitDelete = async () => {
    if (!deletingMember) return;
    setDeleteSubmitting(true);
    try {
      await deleteMyOrganizationMember(deletingMember.id);
      toast({ title: "Member deleted", variant: "success" });
      setDeleteConfirmOpen(false);
      setDeletingMember(null);
      await loadMembers();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message || "Please try again", variant: "destructive" });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>

          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Users className="h-5 w-5 text-accent-foreground" />
              {titleCount}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((m, idx) => (
                      <TableRow key={m.id} className="hover:bg-accent/30 transition-colors">
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
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActionDialog({ open: true, member: m })}
                            >
                              Action
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action dialog (Edit/Delete) */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false })}>
        {actionDialog.open && (
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="secondary">Member</Badge>
                {actionDialog.member.name}
              </DialogTitle>
              <DialogDescription>Choose what you want to do.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-2">
              <Button
                className="justify-start gap-2"
                variant="outline"
                onClick={() => {
                  setEditMemberId(actionDialog.member.id);
                  setEditForm({ name: actionDialog.member.name, email: actionDialog.member.email, phone: actionDialog.member.phone });
                  setActionDialog({ open: false });
                  setEditOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>

              <Button
                className="justify-start gap-2"
                variant="destructive"
                onClick={() => openDelete(actionDialog.member)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setEditMemberId(null); setEditForm(emptyForm); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>Update the selected member details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm((s) => ({ ...s, phone: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditMemberId(null);
                setEditForm(emptyForm);
              }}
              disabled={editSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={submitEditSave} disabled={editSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {editSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => !open && setDeleteConfirmOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete member?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setDeletingMember(null); }} disabled={deleteSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitDelete} disabled={deleteSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) { setAddOpen(false); setAddForm(emptyForm); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>Enter the new member details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={addForm.name} onChange={(e) => setAddForm((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm((s) => ({ ...s, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input value={addForm.phone} onChange={(e) => setAddForm((s) => ({ ...s, phone: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setAddForm(emptyForm); }} disabled={addSubmitting}>
              Cancel
            </Button>
            <Button onClick={submitAdd} disabled={addSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {addSubmitting ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

