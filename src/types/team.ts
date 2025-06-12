export interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: TeamMember[];
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
  settings: TeamSettings;
}

export interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  permissions: TeamPermission[];
  lastActiveAt?: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface TeamPermission {
  resource: 'tasks' | 'projects' | 'team' | 'reports';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface TeamSettings {
  isPublic: boolean;
  allowMemberInvites: boolean;
  defaultTaskAssignment: 'auto' | 'manual';
  notificationSettings: {
    taskUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
    dailyDigest: boolean;
  };
}

export interface TeamInvitation {
  _id: string;
  teamId: string;
  invitedBy: string;
  invitedEmail: string;
  role: TeamMember['role'];
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
}
