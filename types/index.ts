export interface Merchant {
  id: string;
  email: string;
  businessName: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  merchantId: string;
  customerName: string;
  customerEmail: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
}

export interface AvailableSlot {
  id: string;
  merchantId: string;
  date: Date; // Specific date for this availability
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
  isRecurring?: boolean; // If true, repeats weekly on this day
}

export interface PricingTier {
  id: string;
  merchantId: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
  isActive: boolean;
}

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  monthlyRevenue: number;
  monthlyBookings: number;
}
