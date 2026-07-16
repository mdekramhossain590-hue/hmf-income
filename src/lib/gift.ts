import { Timestamp } from '@/src/lib/mock-firestore';

export interface GiftCode {
  id?: string;
  code: string;
  type: 'fixed' | 'random';
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  maxUses: number;
  usedBy: string[];
  expiresAt: Timestamp | null;
  status: 'active' | 'expired' | 'exhausted';
  createdAt: Timestamp;
  createdBy: string;
}
