
export type UpdateType = 'price' | 'news' | 'pre-announcement';

export interface ProductChange {
  code: string;
  name: string;
  oldPrice: number;
  newPrice: number;
}

export interface UpdateRecord {
  id: string;
  date: string; // e.g., "DD/MM/YYYY"
  effectiveDate?: string; // for pre-announcements
  type: UpdateType;
  title: string;
  summary?: string; // for news or pre-announcements
  changes?: ProductChange[]; // for price updates and pre-announcements
  stats?: {
    new: number;
    price: number;
    status: number;
  };
  variations?: string[];
  read: boolean;
}
