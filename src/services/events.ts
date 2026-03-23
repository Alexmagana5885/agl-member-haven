import { fetchData } from './api';

export interface PlannedEvent {
  id: number;
  event_name: string;
  event_image_path: string;
  event_description: string;
  event_location: string;
  event_date: string;
  created_at: string;
  RegistrationAmount: number;
}

// ─── Events API Functions ───

/**
 * Get all planned events
 */
export async function getPlannedEvents(): Promise<PlannedEvent[]> {
  const data = await fetchData('/admin/planned-events');
  return data.events || [];
}

/**
 * Get user's registered events by email
 */
export async function getRegisteredEvents(email: string): Promise<any> {
  const data = await fetchData(`/events/registered?email=${encodeURIComponent(email)}`);
  return data.events || [];
}


/** Empty - duplicate removed */


export async function getPastEvent(id: number): Promise<any> {
  const data = await fetchData(`/admin/past-events/${id}`);
  return data;
}

export async function getPastEvents(): Promise<any> {
  const data = await fetchData('/admin/past-events');
  return data.events || [];
}

export async function getBlogs(): Promise<any> {
  const data = await fetchData('/admin/blogs');
  return data.blogs || [];
}


