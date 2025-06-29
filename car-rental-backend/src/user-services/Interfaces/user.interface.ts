export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  profileImage: string;
}
