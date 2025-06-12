import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Mail,
  Settings,
  Crown,
  Shield,
  Eye,
  MoreHorizontal,
  UserPlus,
  Search,
} from 'lucide-react';
import { Team, TeamMember, TeamInvitation } from '@/types/team';
import { teamApi } from '@/services/api/teamApi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface TeamManagementProps {
  team: Team;
  onTeamUpdate?: (team: Team) => void;
}

export const TeamManagement: React.FC<TeamManagementProps>;
