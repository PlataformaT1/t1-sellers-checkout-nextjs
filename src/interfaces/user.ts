// API Response Types
export interface ApiMetadata {
  status: string;
  message: string;
  http_code: number;
  date_time: string;
  execution_time_ms: number;
}

export interface ResponseIdentityI<T> {
  metadata: ApiMetadata;
  data: T;
}

// User and Store Types
export interface StoreService {
  name: string;
  status: string;
}

export interface Store {
  id: number;
  role: string;
  name: string;
  services: StoreService[];
  creation_date: string;
}

export interface UserData {
  sub: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  gender: string;
  birthday: string;
  cell_phone_number: string;
  user_id: number;
  stores: Store[];
}

export interface UserState {
  userData: UserData | null;
  stores: Store[];
  loading: boolean;
  error: string | null;
}

export interface StoreI {
  role: string;
  id: number;
  name: string;
  service: any;
}