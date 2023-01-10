import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export type AllowedRoles = keyof typeof UserRole | "Any";

export const Role = (roles: AllowedRoles[]) => SetMetadata("roles", roles); //  === @SetMetadata("role", UserRole.Owner)

// 메타데이터 설정해논것.
