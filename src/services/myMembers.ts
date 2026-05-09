// My Members CRUD service (organization members only)

const API_BASE_URL = "/api";

async function getJson<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }
  return data;
}

async function postJson<TReq, TRes>(endpoint: string, body: TReq, method: "POST" | "PUT" | "DELETE"): Promise<TRes> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: method === "DELETE" ? undefined : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export type MyMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type CreateMemberPayload = {
  name: string;
  email: string;
  phone: string;
};

export type UpdateMemberPayload = CreateMemberPayload;

export async function fetchMyOrganizationMembers(): Promise<{ success: boolean; members: MyMember[] }> {
  return getJson(`/admin/my-members`);
}

export async function createMyOrganizationMember(payload: CreateMemberPayload): Promise<{ success: boolean; message?: string; member?: MyMember }> {
  return postJson(`/admin/my-members`, payload, "POST");
}

export async function updateMyOrganizationMember(memberId: string, payload: UpdateMemberPayload): Promise<{ success: boolean; message?: string; member?: MyMember }> {
  return postJson(`/admin/my-members/${memberId}`, payload, "PUT");
}

export async function deleteMyOrganizationMember(memberId: string): Promise<{ success: boolean; message?: string }> {
  return postJson(`/admin/my-members/${memberId}`, {} as any, "DELETE");
}

