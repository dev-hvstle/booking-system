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
  serviceId?: string; // Optional: if set, this slot is only for this service
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

export interface BlockedPeriod {
  id: string;
  merchantId: string;
  startDate: Date;
  endDate: Date;
  reason?: string; // Optional reason for blocking (e.g., "Vacation", "Holiday")
  createdAt: Date;
}

export interface Service {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  photos: string[]; // Array of image URLs
  price: number;
  duration: number; // in minutes
  category?: string; // Optional category (e.g., "Haircut", "Massage", "Consultation")
  isActive: boolean;
  createdAt: Date;
}
