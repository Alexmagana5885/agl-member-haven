import { MemberType } from "@/services/members";

// const API_BASE_URL = "/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function buildDownloadName(path: string | null | undefined, fallback: string) {
  if (!path) return fallback;
  const parts = String(path).split("/");
  const last = parts[parts.length - 1];
  return last || fallback;
}

export async function downloadCompletionLetter(
  type: MemberType,
  memberId: string,
  completionLetterPath: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/admin/members/${type}/${memberId}/completion-letter`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ path: completionLetterPath }),
    }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const match = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  const filename = match ? match[1].replace(/['"]/g, "") : buildDownloadName(completionLetterPath, `Completion_Letter_${memberId}.pdf`);

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function getPassportImageUrl(type: MemberType, memberId: string, passportPath: string) {
  // The API returns the image directly. The path is passed for security/lookup.
  const url = new URL(`${API_BASE_URL}/api/admin/members/${type}/${memberId}/passport-image`, window.location.origin);
  url.searchParams.set("path", passportPath);
  return url.toString();
}

