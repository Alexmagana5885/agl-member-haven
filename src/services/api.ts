const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────
// CORE REQUEST HELPERS
// ─────────────────────────────

async function postData<T>(
  endpoint: string,
  data: T
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${response.status})`);
  }

  return response.json();
}

async function putData<T>(
  endpoint: string,
  data: T
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${response.status})`);
  }

  return response.json();
}

async function fetchData(endpoint: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load data");
  }

  return response.json();
}

export { fetchData };

// ─────────────────────────────
// EVENTS / BLOG / MESSAGES
// ─────────────────────────────

export interface PlannedEventPayload {
  title: string;
  date: string;
  venue: string;
  description: string;
  regAmount: string;
}

export function createPlannedEvent(data: PlannedEventPayload) {
  return postData("/admin/planned-events", data);
}


export interface PastEventPayload {
  title: string;
  date: string;
  venue: string;
  description: string;
}

export function createPastEvent(data: PastEventPayload) {
  return postData("/admin/past-events", data);
}

export interface BlogPayload {
  title: string;
  content: string;
}

export function createBlog(data: BlogPayload) {
  return postData("/admin/blogs", data);
}

export interface MessagePayload {
  recipient_group: {
    type: "all_members" | "officials" | "specific_recipients";
    recipients?: string[];
  };
  subject: string;
  message: string;
  sender_name?: string;
  sender_email?: string;
}

export function sendMessage(data: MessagePayload) {
  return postData("/admin/messages", data);
}

// ─────────────────────────────
// SEARCH MEMBERS
// ─────────────────────────────

export interface MemberSearchResult {
  id: string;
  member_name: string;
  email: string;
  member_type: "personal" | "organization";
}

export async function searchMembers(query: string): Promise<MemberSearchResult[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/messages/members/search?q=${encodeURIComponent(query)}&limit=20`,
    { credentials: "include" }
  );

  if (!response.ok) throw new Error(`Request failed (${response.status})`);

  const data = await response.json();
  return data.members || [];
}

// ─────────────────────────────
// USER MESSAGES
// ─────────────────────────────

export interface UserMessage {
  id: number;
  sender_name: string;
  sender_email: string;
  recipient_group: string;
  subject: string;
  message: string;
  date_sent: string;
  has_replied: boolean;
}

export async function getUserMessages(): Promise<UserMessage[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/messages/my-messages`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error(`Request failed (${response.status})`);

  const data = await response.json();
  return data.messages || [];
}

export interface ReplyPayload {
  message_id: number;
  message: string;
}

export function replyToMessage(data: ReplyPayload) {
  return postData("/admin/messages/reply", data);
}

// ─────────────────────────────
// PAYMENTS
// ─────────────────────────────

export interface PaymentPayload {
  email: string;
  phone: string;
  amount: string;
  type: "fee" | "premium";
}

export function submitPayment(data: PaymentPayload) {
  const endpoint =
    data.type === "fee"
      ? "/payments/register-fee"
      : "/payments/register-premium";

  return postData(endpoint, {
    email: data.email,
    phone: data.phone,
    amount: data.amount,
  });
}

export interface EventRegistrationPayload {
  eventTitle: string;
  email: string;
  name: string;
  contact: string;
  regAmount: string;
}

export function registerForEvent(data: EventRegistrationPayload) {
  return postData("/payments/events/register", data);
}

// ─────────────────────────────
// PROFILE
// ─────────────────────────────

export interface BillToData {
  member_type: "personal" | "organization";
  name: string;
  email: string;
  phone: string;
  address?: string;
  profession?: string;
  company?: string;
  position?: string;
  contact_person?: string;
  org_type?: string;
}

export interface ProfileData {
  status: string;
  user_type: string;
  name: string;
  email: string;
  phone?: string;
  registration_date: string;
  bill_to_data: BillToData;
  image_path?: string;
  education?: {
    highest_degree: string;
    institution: string;
    graduation_year: number;
  };
  payments: {
    total_paid_this_year: number;
    required_amount: number;
    fully_paid: boolean;
    status: string;
    next_payment_date: string;
  };
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  highest_degree?: string;
  institution?: string;
  graduation_year?: string;
}

export async function getProfileData(): Promise<ProfileData> {
  return fetchData("/dashboard/user-info/profile");
}

export function updateProfileData(data: ProfileUpdatePayload) {
  return putData("/dashboard/user-info/profile", data);
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `${API_BASE_URL}/api/dashboard/user-info/profile/image`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }

  return response.json();
}

// ─────────────────────────────
// BLOG + INVOICES
// ─────────────────────────────

export interface Blog {
  id: number;
  title: string;
  content: string;
  image_path: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  description: string;
  date: string;
  amount: string;
  status: string;
}

export async function getMyInvoices(): Promise<{ invoices: Invoice[] }> {
  return fetchData("/invoices/my-invoices");
}

export async function getSingleBlog(blogId: string): Promise<Blog> {
  const data = await fetchData(`/admin/blogs/${blogId}`);

  if (!data.success || !data.blog) {
    throw new Error("Blog not found");
  }

  return data.blog;
}

// ─────────────────────────────
// EVENTS (FIXED EXPORTS)
// ─────────────────────────────

export async function getPlannedEvents() {
  return fetchData("/admin/planned-events");
}

export async function getPastEvents() {
  return fetchData("/admin/past-events");
}

export async function getRegisteredEvents(email: string) {
  return fetchData(
    `/events/registered?email=${encodeURIComponent(email)}`
  );
}

export async function getBlogs() {
  return fetchData("/admin/blogs");
}