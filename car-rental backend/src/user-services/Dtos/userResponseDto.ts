import { Role, Status } from '@prisma/client';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  Status: Status;
}
