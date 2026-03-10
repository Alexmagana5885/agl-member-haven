import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Mail, CalendarDays, Send, X, Search, Users, UserCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchMembers, MemberSearchResult, sendMessage, MessagePayload } from "@/services/api";

type RecipientType = "all_members" | "officials" | "specific_recipients";

interface SelectedRecipient {
  email: string;
  name: string;
  member_type: "personal" | "organization";
}

const MessagesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"compose" | "inbox">("compose");
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
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock messages for inbox (replace with API call in production)
  const messages = [
    { subject: "Annual General Meeting Notice", from: "AGL Admin", date: "20 Feb 2026", preview: "Dear members, you are invited to the upcoming AGM scheduled for March 15, 2026...", read: true },
    { subject: "Membership Renewal Reminder", from: "Finance Dept", date: "15 Feb 2026", preview: "This is a reminder that your annual membership fee is due by March 31, 2026...", read: false },
    { subject: "New Library Management Workshop", from: "Events Team", date: "10 Feb 2026", preview: "We are excited to announce a hands-on workshop on modern library management systems...", read: true },
    { subject: "CPD Points Update", from: "Education Committee", date: "5 Feb 2026", preview: "Your CPD points for Q4 2025 have been updated. You currently have 45 points...", read: false },
    { subject: "Digital Literacy Program Launch", from: "AGL Admin", date: "28 Jan 2026", preview: "We are launching a new digital literacy program for government librarians across the country...", read: true },
    { subject: "Holiday Greetings", from: "AGL President", date: "24 Dec 2025", preview: "Season's greetings to all our esteemed members. Wishing you a wonderful holiday season...", read: true },
  ];

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search members as user types
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.length >= 2 && recipientType === "specific_recipients") {
        setIsSearching(true);
        try {
          const results = await searchMembers(searchQuery);
          // Filter out already selected recipients
          const filtered = results.filter(
            (r) => !selectedRecipients.some((sr) => sr.email === r.email)
          );
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

  const handleSelectRecipient = (member: MemberSearchResult) => {
    const newRecipient: SelectedRecipient = {
      email: member.email,
      name: member.member_name,
      member_type: member.member_type,
    };
    setSelectedRecipients([...selectedRecipients, newRecipient]);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleRemoveRecipient = (email: string) => {
    setSelectedRecipients(selectedRecipients.filter((r) => r.email !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (recipientType === "specific_recipients" && selectedRecipients.length === 0) {
      setErrorMessage("Please select at least one recipient");
      return;
    }
    if (!subject.trim()) {
      setErrorMessage("Please enter a subject");
      return;
    }
    if (!message.trim()) {
      setErrorMessage("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      const payload: MessagePayload = {
        recipient_group: {
          type: recipientType,
          recipients:
            recipientType === "specific_recipients"
              ? selectedRecipients.map((r) => r.email)
              : undefined,
        },
        subject: subject.trim(),
        message: message.trim(),
        sender_name: senderName.trim() || "AGL Admin",
        sender_email: senderEmail.trim() || "admin@agl.or.ke",
      };

      const response = await sendMessage(payload);

      if (response.success) {
        setSuccessMessage(response.message);
        // Reset form
        setSubject("");
        setMessage("");
        setSelectedRecipients([]);
        setRecipientType("all_members");
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

  const getRecipientTypeLabel = (type: RecipientType) => {
    switch (type) {
      case "all_members":
        return "All Members";
      case "officials":
        return "Officials Only";
      case "specific_recipients":
        return "Specific Recipients";
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "compose" ? "default" : "outline"}
            onClick={() => setActiveTab("compose")}
            className="gap-2"
          >
            <Send className="h-4 w-4" /> Compose
          </Button>
          <Button
            variant={activeTab === "inbox" ? "default" : "outline"}
            onClick={() => setActiveTab("inbox")}
            className="gap-2"
          >
            <Mail className="h-4 w-4" /> Inbox ({messages.length})
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
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success/Error Messages */}
                {successMessage && (
                  <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
                    {successMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
                    {errorMessage}
                  </div>
                )}

                {/* Recipient Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Select Recipients</Label>
                  <RadioGroup
                    value={recipientType}
                    onValueChange={(value) => {
                      setRecipientType(value as RecipientType);
                      setSelectedRecipients([]);
                      setSearchQuery("");
                    }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
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

                {/* Specific Recipients Input */}
                {recipientType === "specific_recipients" && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Search and Select Recipients</Label>
                    <div ref={dropdownRef} className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                          className="pl-10"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Dropdown Results */}
                      {showDropdown && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                          {searchResults.map((member) => (
                            <button
                              key={`${member.member_type}-${member.id}`}
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

                    {/* Selected Recipients */}
                    {selectedRecipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRecipients.map((recipient) => (
                          <Badge
                            key={recipient.email}
                            variant="secondary"
                            className="flex items-center gap-1 py-1.5 pr-1"
                          >
                            <span>{recipient.name}</span>
                            <span className="text-muted-foreground text-xs">({recipient.email})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipient(recipient.email)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {selectedRecipients.length} recipient(s) selected
                    </p>
                  </div>
                )}

                {/* Sender Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender_name">Sender Name</Label>
                    <Input
                      id="sender_name"
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="AGL Admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender_email">Sender Email</Label>
                    <Input
                      id="sender_email"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="admin@agl.or.ke"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter message subject..."
                  />
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={8}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSubject("");
                      setMessage("");
                      setSelectedRecipients([]);
                      setRecipientType("all_members");
                      setSuccessMessage("");
                      setErrorMessage("");
                    }}
                  >
                    Clear
                  </Button>
                  <Button type="submit" disabled={isSending}>
                    {isSending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
          /* Inbox View */
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <MessageSquare className="h-5 w-5 text-accent-foreground" />
                Messages ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/30 ${
                      !msg.read ? "border-primary/40 bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm truncate ${!msg.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                            {msg.subject}
                          </h4>
                          {!msg.read && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 shrink-0">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {msg.from}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 shrink-0">
                        <CalendarDays className="h-3 w-3" /> {msg.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MessagesPage;

