/**
 * Booking Service Module
 * Provides booking management logic for meeting rooms.
 * All functions are strictly typed and validated.
 */
import { Booking } from "../models/Booking";

const BOOKINGS_KEY = 'roomBookings';

/**
 * Save a booking to localStorage.
 * @param booking - The booking to save
 */
export const saveBooking = (booking: Booking): void => {
  try {
    const bookings = getBookings();
    bookings.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving booking:', error);
    throw new Error('Failed to save booking');
  }
};

/**
 * Retrieve all bookings from localStorage.
 * @returns Array of bookings
 */
export const getBookings = (): Booking[] => {
  try {
    const data = localStorage.getItem(BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving bookings:', error);
    return [];
  }
};

/**
 * Check if a slot is available for a specific room, date, and time.
 * @param roomId - Room ID
 * @param date - Date string (YYYY-MM-DD)
 * @param time - Time string (HH:mm)
 * @returns True if slot is available, false otherwise
 */
export const isSlotAvailable = (roomId: number, date: string, time: string): boolean => {
  const bookings = getBookings();
  return !bookings.some(
    (b) => b.roomId === roomId && b.date === date && b.time === time
  );
};