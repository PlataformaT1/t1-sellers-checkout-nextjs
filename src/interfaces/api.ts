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

export interface Service {
  name: string;
  status: string;
}

export interface Store {
  id: number;
  role: string;
  name: string;
  services: Service[];
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

export interface UserI {
  name: string,
  email: string
  token: string,
  storeId: number
}

// Request params interface
export interface GetUserStoresParams {
  email: string;
}
