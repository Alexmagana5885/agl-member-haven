import { fetchData } from './api';

// ─── Events API Functions ───

/**
 * Get user's registered events by email
 */
export async function getRegisteredEvents(email: string): Promise<any> {
  const data = await fetchData(`/events/registered?email=${encodeURIComponent(email)}`);
  return data.events || [];
}

/**
 * Get all planned events
 */
export async function getPlannedEvents(): Promise<any> {
  const data = await fetchData('/admin/planned-events');
  return data.events || [];
}

/**
 * Get all past events
 */
export async function getPastEvents(): Promise<any> {
  const data = await fetchData('/admin/past-events');
  return data.events || [];
}

/**
 * Get latest blogs
 */
export async function getBlogs(): Promise<any> {
  const data = await fetchData('/admin/blogs');
  return data.blogs || [];
}

