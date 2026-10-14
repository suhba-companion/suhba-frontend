export interface Dhikr {
  id: string;
  ar: string;
  latin: string;
  de: string;
  count: string;
  hadithInfo: string;
}

export interface Duaa {
  id: string;
  title: string;
  ar: string;
  latin: string;
  de: string;
}

export type SpotType = 'Moschee' | 'Gebetsort' | 'Sonstige';

export interface PrayerSpot {
  id: string;
  name: string;
  type: SpotType;
  address: string;
  district: string;
  lat: number;
  lng: number;
  open: boolean;
  jumaTime: string | null;
  jumaTimeSummer?: string;
  jumaTimeWinter?: string;
  wudu: boolean;
  sisters: boolean;
  parking: boolean;
  hijab?: boolean;
  prayerClothes?: boolean;
  openingHours?: string;
  language?: string;
  verified?: boolean;
  distanceKm?: number;
}

export type BusinessType =
  | 'Restaurant'
  | 'Café'
  | 'Metzgerei'
  | 'Lebensmittel'
  | 'Sonstige';

export type CertStatus =
  | 'HMA-Zertifiziert'
  | 'Selbst-zertifiziert'
  | 'Muslim-Owned';

export interface HalalBusiness {
  id: string;
  name: string;
  type: BusinessType;
  address: string;
  district: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  certStatus: CertStatus;
  rating?: number;
  featured: boolean;
  parking?: boolean;
  distanceKm?: number;
}

export interface FeedEvent {
  id: string;
  title: string;
  location?: string;
  address?: string;
  district?: string;
  distanceKm?: number;
  tag: string;
  time: string;
  kind?: 'spot' | 'halal' | 'event';
  lat?: number;
  lng?: number;
}

export type EventCategory =
  | 'Gebet'
  | 'Vortrag'
  | 'Kurs'
  | 'Community'
  | 'Jugend'
  | 'Sport'
  | 'Spende'
  | 'Sonstige';

export interface Event {
  id: string;
  title: string;
  description?: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  startTime: string;
  endTime?: string;
  categories: EventCategory[];
  organizer?: string;
  contactInfo?: string;
  isFree: boolean;
  registrationUrl?: string;
  distanceKm?: number;
}
