import type { User, Salon, Service, Queue, Offer, Review } from "@shared/schema";

export interface SalonPhoto {
  id: string;
  salonId: string;
  url: string;
  publicId: string;
  createdAt: string;
}

export interface SalonWithDetails extends Salon {
  services: Service[];
  queueCount: number;
  estimatedWaitTime: number;
  offers: Offer[];
  photos: SalonPhoto[];
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}

export interface SalonDetails extends Salon {
  services: Service[];
  offers: Offer[];
  reviews: Review[];
  queueCount: number;
  estimatedWaitTime: number;
  latitude?: number;
  longitude?: number;
  fullAddress?: string;
}

export interface QueueWithDetails extends Queue {
  salon: Salon | null;
  service: Service | null;
  services?: Service[];
  user?: User | null;
  totalInQueue?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Analytics {
  customersToday: number;
  totalCustomers: number;
  avgWaitTime: number;
  rating: number;
  showRate: number;
  revenue: number;
  popularServices: (Service & { bookings: number })[];
}

export interface WebSocketMessage {
  type: 'queue_update' | 'notification';
  salonId?: string;
  data?: any;
}
