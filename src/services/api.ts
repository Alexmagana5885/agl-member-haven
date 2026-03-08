const API_BASE_URL = "/api";

async function postData<T>(endpoint: string, data: T): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  recipient: string;
  subject: string;
  message: string;
}

export function sendMessage(data: MessagePayload) {
  return postData("/admin/messages", data);
}

// ─── Payment Endpoints ───

export interface PaymentPayload {
  email: string;
  phone: string;
  amount: string;
  type: "fee" | "premium";
}

export function submitPayment(data: PaymentPayload) {
  // Use separate endpoints for fee and premium payments
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
