import { fetchData } from "./api";

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

// EVENTS API FUNCTIONS

export async function getPlannedEvents(): Promise<PlannedEvent[]> {
  const data = await fetchData("/admin/planned-events");
  return data.events || [];
}

export async function getRegisteredEvents(email: string): Promise<any> {
  const data = await fetchData(
    `/events/registered?email=${encodeURIComponent(email)}`
  );
  return data.events || [];
}

export async function getPastEvent(id: number): Promise<any> {
  return fetchData(`/admin/past-events/${id}`);
}

export async function getPastEvents(): Promise<any> {
  const data = await fetchData("/admin/past-events");
  return data.events || [];
}

export async function getBlogs(): Promise<any> {
  const data = await fetchData("/admin/blogs");
  return data.blogs || [];
}