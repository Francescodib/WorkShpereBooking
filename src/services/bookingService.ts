/**
 * Enhanced Booking Service Module
 * Provides comprehensive booking management with improved error handling and validation
 */
import { Booking, BookingValidationResult } from '../types';

const BOOKINGS_KEY = 'roomBookings';
const STORAGE_VERSION = '1.0';
const VERSION_KEY = 'roomBookingsVersion';

/**
 * Generate unique ID for bookings
 */
const generateBookingId = (): string => {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate booking data before saving
 */
const validateBooking = (booking: Booking): BookingValidationResult => {
  const errors: string[] = [];

  if (!booking.roomId || booking.roomId <= 0) {
    errors.push('Room ID must be a positive number');
  }

  if (!booking.date || !/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  if (!booking.time || !/^\d{2}:\d{2}$/.test(booking.time)) {
    errors.push('Time must be in HH:MM format');
  }

  // Check if date is not in the past
  const bookingDate = new Date(booking.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    errors.push('Cannot book dates in the past');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Initialize storage with version check
 */
const initializeStorage = (): void => {
  const currentVersion = localStorage.getItem(VERSION_KEY);
  
  if (currentVersion !== STORAGE_VERSION) {
    // Handle migration logic here if needed
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  }
};

/**
 * Save a booking to localStorage with enhanced validation
 */
export const saveBooking = (booking: Booking): Promise<Booking> => {
  return new Promise((resolve, reject) => {
    try {
      initializeStorage();
      
      const validation = validateBooking(booking);
      if (!validation.isValid) {
        reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
        return;
      }

      // Check if slot is available
      if (!isSlotAvailable(booking.roomId, booking.date, booking.time)) {
        reject(new Error('Selected time slot is no longer available'));
        return;
      }

      const bookings = getBookings();
      const newBooking: Booking = {
        ...booking,
        id: generateBookingId(),
        createdAt: new Date(),
        duration: booking.duration || 60
      };

      bookings.push(newBooking);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      
      resolve(newBooking);
    } catch (error) {
      console.error('Error saving booking:', error);
      reject(new Error('Failed to save booking. Please try again.'));
    }
  });
};

/**
 * Retrieve all bookings from localStorage with error handling
 */
export const getBookings = (): Booking[] => {
  try {
    initializeStorage();
    const data = localStorage.getItem(BOOKINGS_KEY);
    
    if (!data) {
      return [];
    }

    const bookings = JSON.parse(data) as Booking[];
    
    // Validate and filter out invalid bookings
    return bookings.filter(booking => {
      const validation = validateBooking(booking);
      if (!validation.isValid) {
        console.warn('Invalid booking found and filtered out:', booking);
        return false;
      }
      return true;
    });
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    return [];
  }
};

/**
 * Check if a slot is available with enhanced validation
 */
export const isSlotAvailable = (roomId: number, date: string, time: string): boolean => {
  try {
    if (!roomId || !date || !time) {
      return false;
    }

    const bookings = getBookings();
    return !bookings.some(
      (booking) => 
        booking.roomId === roomId && 
        booking.date === date && 
        booking.time === time
    );
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
};

/**
 * Get bookings for a specific room and date
 */
export const getBookingsForRoomAndDate = (roomId: number, date: string): Booking[] => {
  try {
    const bookings = getBookings();
    return bookings.filter(
      booking => booking.roomId === roomId && booking.date === date
    );
  } catch (error) {
    console.error('Error getting bookings for room and date:', error);
    return [];
  }
};

/**
 * Delete a booking by ID
 */
export const deleteBooking = (bookingId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const bookings = getBookings();
      const filteredBookings = bookings.filter(booking => booking.id !== bookingId);
      
      if (filteredBookings.length === bookings.length) {
        reject(new Error('Booking not found'));
        return;
      }

      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filteredBookings));
      resolve(true);
    } catch (error) {
      console.error('Error deleting booking:', error);
      reject(new Error('Failed to delete booking'));
    }
  });
};

/**
 * Clear all bookings (for testing/admin purposes)
 */
export const clearAllBookings = (): void => {
  try {
    localStorage.removeItem(BOOKINGS_KEY);
    console.log('All bookings cleared');
  } catch (error) {
    console.error('Error clearing bookings:', error);
  }
};