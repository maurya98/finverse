export enum Role {
  ADMIN = "admin",
  MAINTAINER = "maintainer",
  USER = "user",
}

export enum Permission {
  READ = "read",
  WRITE = "write",
  UPDATE = "update",
  DELETE = "delete",
}

export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.READ,
    Permission.WRITE,
    Permission.UPDATE,
    Permission.DELETE,
  ],

  [Role.MAINTAINER]: [
    Permission.READ,
    Permission.WRITE,
    Permission.UPDATE,
  ],

  [Role.USER]: [
    Permission.READ,
  ],
};