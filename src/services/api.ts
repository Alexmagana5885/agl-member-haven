const API_BASE_URL = "/api";

async function postData<T>(endpoint: string, data: T): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

async function fetchData(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ─── Admin Endpoints ───

export interface PlannedEventPayload {
  title: string;
  type: string;
  date: string;
  venue: string;
  description: string;
  objectives: string;
  whyAttend: string;
  subthemes: string;
  regAmount: string;
}

export function createPlannedEvent(data: PlannedEventPayload) {
  return postData("/admin/planned-events", data);
}

export interface PastEventPayload {
  title: string;
  type: string;
  date: string;
  venue: string;
  description: string;
  attendees: string;
  highlights: string;
}

export function createPastEvent(data: PastEventPayload) {
  return postData("/admin/past-events", data);
}

export interface BlogPayload {
  title: string;
  author: string;
  shortDescription: string;
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

// ─── Member Search for Autocomplete ───

export interface MemberSearchResult {
  id: string;
  member_name: string;
  email: string;
  member_type: "personal" | "organization";
}

export async function searchMembers(query: string): Promise<MemberSearchResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/messages/members/search?q=${encodeURIComponent(query)}&limit=20`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.members || [];
  } catch (error) {
    console.error("API Error [searchMembers]:", error);
    throw error;
  }
}

// ─── User Messages Endpoints ───

export { fetchData };


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
  try {
    const response = await fetch(`${API_BASE_URL}/admin/messages/my-messages`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error("API Error [getUserMessages]:", error);
    throw error;
  }
}

export interface ReplyPayload {
  message_id: number;
  message: string;
}

export async function replyToMessage(data: ReplyPayload) {
  return postData("/admin/messages/reply", data);
}

// ─── Payment Endpoints ───

export interface PaymentPayload {
  email: string;
  phone: string;
  amount: string;
  type: "fee" | "premium";
}

export function submitPayment(data: PaymentPayload) {
  const endpoint = data.type === "fee" ? "/payments/register-fee" : "/payments/register-premium";
  return postData(endpoint, {
    email: data.email,
    phone: data.phone,
    amount: data.amount
  });
}

// ─── Event Registration Endpoint ───

export interface EventRegistrationPayload {
  eventTitle: string;
  email: string;
  name: string;
  contact: string;
  regAmount: string;
}

export function registerForEvent(data: EventRegistrationPayload) {
  return postData("/events/register", data);
}

// ─── Profile Data Endpoint ───

export interface ProfileData {
  status: string;
  user_type: string;
  name: string;
  email: string;
  registration_date: string;
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

export async function getProfileData(): Promise<ProfileData> {
  return fetchData("/dashboard/user-info/profile");
}

/**
 * Get single blog by ID for detail page
 */
export interface Blog {
  id: number;
  title: string;
  content: string;
  image_path: string;
  created_at: string;
}

export async function getSingleBlog(blogId: string): Promise<Blog> {
  const data = await fetchData(`/admin/blogs/${blogId}`);
  if (!data.success || !data.blog) {
    throw new Error('Blog not found');
  }
  return data.blog;
}

