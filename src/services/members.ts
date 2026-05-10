const API_BASE_URL = "/api";

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

export type MemberType = "personal" | "organization";

export type BasicMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  member_type: MemberType;
};

export type MemberDetails = {
  member_type: MemberType;
  [key: string]: string;
};

export async function fetchMembersByType(type: MemberType): Promise<{ success: boolean; members: BasicMember[] }> {
  return getJson(`/admin/members?type=${type}`);
}

export async function fetchMemberDetails(type: MemberType, memberId: string): Promise<{ success: boolean; member: MemberDetails }> {
  return getJson(`/admin/members/${type}/${memberId}/details`);
}

export async function updateMemberDetails(
  type: MemberType,
  memberId: string,
  payload: Partial<MemberDetails>
): Promise<{ success: boolean; message?: string; member?: MemberDetails }> {
  return postJson(`/admin/members/${type}/${memberId}/details`, payload, "PUT");
}

export async function deleteMember(type: MemberType, memberId: string): Promise<{ success: boolean; message?: string }> {
  return postJson(`/admin/members/${type}/${memberId}/details`, {} as any, "DELETE");
}





export async function downloadMembersRecordsPdf(type: MemberType): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/members/print`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ type }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const match = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = match ? match[1].replace(/['"]/g, "") : `AGL_Members_${type}.pdf`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadMemberDetailsPdf(type: MemberType, memberId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/members/${type}/${memberId}/print-details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const match = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = match ? match[1].replace(/['"]/g, "") : `AGL_${type}_Member_${memberId}.pdf`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}


