import { User } from '@/shared/api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}
