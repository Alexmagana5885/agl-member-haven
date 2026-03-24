import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CalendarDays, Loader2, Mail, MessageSquare, Search, Send, User, UserCheck, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getUserMessages,
  replyToMessage,
  searchMembers,
  sendMessage,
  type MemberSearchResult,
  type MessagePayload,
  type UserMessage,
} from "@/services/api";
import { stripHtml } from "@/lib/utils";

type RecipientType = "all_members" | "officials" | "specific_recipients";

interface SelectedRecipient {
  email: string;
  name: string;
  member_type: "personal" | "organization";
}

const getPlainText = (html: string) => stripHtml(html || "", 100000).trim();

const MessagesPage = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"compose" | "inbox">("inbox");
  const [recipientType, setRecipientType] = useState<RecipientType>("all_members");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberSearchResult[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<SelectedRecipient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [senderName, setSenderName] = useState("AGL Admin");
  const [senderEmail, setSenderEmail] = useState("admin@agl.or.ke");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchUserMessages();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current &amp;&amp; !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.length >= 2 &amp;&amp; recipientType === "specific_recipients") {
        setIsSearching(true);
        try {
          const results = await searchMembers(searchQuery);
          const filtered = results.filter((result) => !selectedRecipients.some((recipient) => recipient.email === result.email));
          setSearchResults(filtered);
          setShowDropdown(filtered.length > 0);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery, recipientType, selectedRecipients]);

  const fetchUserMessages = async () => {
    try {
      setLoadingMessages(true);
      const messages = await getUserMessages();
      setUserMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectRecipient = (member: MemberSearchResult) => {
    setSelectedRecipients((prev) => [
      ...prev,
      {
        email: member.email,
        name: member.member_name,
        member_type: member.member_type,
      },
    ]);
    setSearchQuery("");
    setShowDropdown(false);
    searchInputRef.current?.focus();
  };

  const handleRemoveRecipient = (email: string) => {
    setSelectedRecipients((prev) => prev.filter((recipient) => recipient.email !== email));
  };

  const handleClearCompose = () => {
    setSubject("");
    setMessage("");
    setSelectedRecipients([]);
    setRecipientType("all_members");
    setSuccessMessage("");
    setErrorMessage("");
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (recipientType === "specific_recipients" &amp;&amp; selectedRecipients.length === 0) {
      setErrorMessage("Please select at least one recipient");
      return;
    }

    if (!subject.trim()) {
      setErrorMessage("Please enter a subject");
      return;
    }

    if (!getPlainText(message)) {
      setErrorMessage("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      const payload: MessagePayload = {
        recipient_group: {
          type: recipientType,
          recipients: recipientType === "specific_recipients" ? selectedRecipients.map((recipient) => recipient.email) : undefined,
        },
        subject: subject.trim(),
        message,
        sender_name: senderName.trim() || "AGL Admin",
        sender_email: senderEmail.trim() || "admin@agl.or.ke",
      };

      const response = await sendMessage(payload);

      if (response.success) {
        setSuccessMessage(response.message);
        handleClearCompose();
      } else {
        setErrorMessage(response.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Send error:", error);
      setErrorMessage("An error occurred while sending the message");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !getPlainText(replyText)) return;

    setSendingReply(true);
    try {
      await replyToMessage({
        message_id: selectedMessage.id,
        message: replyText,
      });
      setReplyText("");
      setSelectedMessage(null);
      fetchUserMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="flex gap-2 mb-4">
          <Button variant={activeTab === "compose" ? "default" : "outline"} onClick={() => setActiveTab("compose")} className="gap-2">
            <Send className="h-4 w-4" /> Compose
          </Button>
          <Button variant={activeTab === "inbox" ? "default" : "outline"} onClick={() => setActiveTab("inbox")} className="gap-2">
            <Mail className="h-4 w-4" /> Inbox ({userMessages.length})
          </Button>
        </div>

        {activeTab === "compose" ? (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <MessageSquare className="h-5 w-5 text-accent-foreground" />
                Compose Message
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[76vh] overflow-y-auto pr-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {successMessage &amp;&amp; (
                  <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
                    {successMessage}
                  </div>
                )}

                {errorMessage &amp;&amp; (
                  <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-base font-medium">Select Recipients</Label>
                  <RadioGroup
                    value={recipientType}
                    onValueChange={(value) => {
                      setRecipientType(value as RecipientType);
                      setSelectedRecipients([]);
                      setSearchQuery("");
                    }}
                    className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all_members" id="all_members" />
                      <Label htmlFor="all_members" className="flex items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4" /> All Members
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="officials" id="officials" />
                      <Label htmlFor="officials" className="flex items-center gap-2 cursor-pointer">
                        <UserCheck className="h-4 w-4" /> Officials Only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="specific_recipients" id="specific_recipients" />
                      <Label htmlFor="specific_recipients" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Specific Recipients
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {recipientType === "specific_recipients" &amp;&amp; (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Search and Select Recipients</Label>
                    <div ref={dropdownRef} className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => searchResults.length > 0 &amp;&amp; setShowDropdown(true)}
                          className="pl-10" />
                        {isSearching &amp;&amp; (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {showDropdown &amp;&amp; searchResults.length > 0 &amp;&amp; (
                        <div className="absolute z-10 w-full mt-1 rounded-md border bg-popover shadow-lg max-h-60 overflow-auto">
                          {searchResults.map((member) => (
                            <button
                              key={ `${member.member_type}-${member.id}` }
                              type="button"
                              onClick={() => handleSelectRecipient(member)}
                              className="w-full px-4 py-2 text-left hover:bg-accent flex flex-col gap-1"
                            >
                              <span className="font-medium text-sm">{member.member_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {member.email} • {member.member_type === "personal" ? "Individual" : "Organization"}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedRecipients.length > 0 &amp;&amp; (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRecipients.map((recipient) => (
                          <Badge key={recipient.email} variant="secondary" className="flex items-center gap-1 py-1.5 pr-1">
                            <span>{recipient.name}</span>
                            <span className="text-muted-foreground text-xs">({recipient.email})</span>
                            <button type="button" onClick={() => handleRemoveRecipient(recipient.email)} className="ml-1 hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">{selectedRecipients.length} recipient(s) selected</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender_name">Sender Name</Label>
                    <Input id="sender_name" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="AGL Admin" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender_email">Sender Email</Label>
                    <Input id="sender_email" type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="admin@agl.or.ke" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter message subject..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <RichTextEditor value={message} onChange={setMessage} placeholder="Type your message here..." />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleClearCompose}>
                    Clear
                  </Button>
                  <Button type="submit" disabled={isSending}>
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <MessageSquare className="h-5 w-5 text-accent-foreground" />
                Messages ({userMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[76vh] overflow-y-auto pr-2">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading messages...</span>
                </div>
              ) : userMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No messages found.</div>
              ) : (
                <div className="space-y-2">
                  {userMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/30 border-border"
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm truncate font-medium text-foreground">{msg.subject}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {msg.sender_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{stripHtml(msg.message || "", 120)}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                          <CalendarDays className="h-3 w-3" /> {formatDate(msg.date_sent)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open &amp;&amp; setSelectedMessage(null)}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedMessage?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              From: {selectedMessage?.sender_name} ({selectedMessage?.sender_email})
              <span className="ml-auto">{selectedMessage &amp;&amp; formatDate(selectedMessage.date_sent)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 rounded-lg bg-muted/30 p-4">
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-lg border bg-background p-4 shadow-sm min-w-0 flex-1">
                <div
                  className="ql-editor prose prose-sm max-w-none text-sm text-foreground"
                  dangerouslySetInnerHTML={{ __html: selectedMessage?.message || "" }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label htmlFor="reply">Reply</Label>
            <RichTextEditor value={replyText} onChange={setReplyText} placeholder="Type your reply..." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                Close
              </Button>
              <Button onClick={handleSendReply} disabled={!getPlainText(replyText) || sendingReply}>
                {sendingReply ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MessagesPage;
