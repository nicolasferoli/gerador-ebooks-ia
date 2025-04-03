export type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  role: 'user' | 'admin';
  credits: number;
  subscription?: Subscription;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export type AuthState = {
  user: User | null;
  session: any | null;
  isLoading: boolean;
}; 