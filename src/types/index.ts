/**
 * Enhanced type definitions for the booking system
 */

export interface Room {
    id: number;
    name: string;
    capacity?: number;
    amenities?: string[];
  }
  
  export interface Booking {
    id?: string;
    roomId: number;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:MM
    duration?: number; // Duration in minutes, default 60
    bookedBy?: string;
    createdAt?: Date;
  }
  
  export interface BookingValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  export interface AppState {
    rooms: Room[];
    bookings: Booking[];
    selectedRoom: number | null;
    selectedDate: string | null;
    selectedTime: string | null;
  }
  
  // Enums for better type safety
  export enum MessageType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
  }
  
  export enum TimeSlot {
    SLOT_09_00 = '09:00',
    SLOT_10_00 = '10:00',
    SLOT_11_00 = '11:00',
    SLOT_12_00 = '12:00',
    SLOT_14_00 = '14:00',
    SLOT_15_00 = '15:00',
    SLOT_16_00 = '16:00',
    SLOT_17_00 = '17:00'
  }
  
  export type FormElement = HTMLSelectElement | HTMLInputElement | HTMLButtonElement;
  export type MessageHandler = (message: string, type: MessageType) => void;