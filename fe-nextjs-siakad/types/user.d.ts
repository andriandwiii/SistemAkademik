export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  password?: string;
  [key: string]: any; // untuk field lain yang opsional
}
