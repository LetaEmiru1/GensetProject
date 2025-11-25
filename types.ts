export interface GensetLog {
  id?: number;
  created_at?: string;
  contractor: string;
  location: string;
  genset_name: string;
  mechanic_name: string;
  phone_number: string;
  current_hour: number;
  next_service_hour: number;
  service_date: string;
  next_service_date: string;
  checklist: Record<string, boolean>;
  photo_url: string | null;
}

export type ChecklistItem = 
  | 'Oil Change'
  | 'Oil Filter Change'
  | 'Fuel Filter Change'
  | 'Air Cleaner Change'
  | 'Air Cleaner Cleaning';
