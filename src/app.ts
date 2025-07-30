/**
 * Enhanced Room Booking Application
 * Main application logic with improved error handling, validation, and user experience
 */
import { Booking, MessageType, TimeSlot, AppState } from './types/index.js';
import type { Room } from './types/index.js';
import { 
  saveBooking, 
  isSlotAvailable, 
  getBookings, 
  getBookingsForRoomAndDate 
} from './services/bookingService.js';

// Application state
const appState: AppState = {
  rooms: [
    { id: 1, name: "Sala Alfa", capacity: 8 },
    { id: 2, name: "Sala Beta", capacity: 12 },
    { id: 3, name: "Sala Gamma", capacity: 6 },
  ],
  bookings: [],
  selectedRoom: null,
  selectedDate: null,
  selectedTime: null
};

// Available time slots using enum
const timeSlots: TimeSlot[] = Object.values(TimeSlot);

// DOM Elements interface for better type safety
interface DOMElements {
  roomSelect: HTMLSelectElement | null;
  dateInput: HTMLInputElement | null;
  timeSelect: HTMLSelectElement | null;
  bookingForm: HTMLFormElement | null;
  message: HTMLDivElement | null;
}

// Global DOM elements
let elements: DOMElements = {
  roomSelect: null,
  dateInput: null,
  timeSelect: null,
  bookingForm: null,
  message: null
};

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

/**
 * Initialize DOM elements with null checks
 */
const initializeDOMElements = (): boolean => {
  elements = {
    roomSelect: document.getElementById("room") as HTMLSelectElement,
    dateInput: document.getElementById("date") as HTMLInputElement,
    timeSelect: document.getElementById("time") as HTMLSelectElement,
    bookingForm: document.getElementById("bookingForm") as HTMLFormElement,
    message: document.getElementById("message") as HTMLDivElement
  };

  // Validate all elements exist
  const missingElements = Object.entries(elements)
    .filter(([, element]) => !element)
    .map(([key]) => key);

  if (missingElements.length > 0) {
    console.error('Missing DOM elements:', missingElements);
    return false;
  }

  return true;
};

/**
 * Initialize the application with enhanced error handling
 */
const initializeApp = async (): Promise<void> => {
  try {
    if (!initializeDOMElements()) {
      throw new Error('Failed to initialize DOM elements');
    }

    await loadApplicationData();
    populateRoomSelect();
    populateTimeSlots();
    setMinDate();
    setupEventListeners();
    
    showMessage("Application initialized successfully", MessageType.SUCCESS);
    console.log('Booking application initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    showMessage("Failed to initialize application", MessageType.ERROR);
  }
};

/**
 * Load application data
 */
const loadApplicationData = async (): Promise<void> => {
  try {
    appState.bookings = getBookings();
    console.log(`Loaded ${appState.bookings.length} existing bookings`);
  } catch (error) {
    console.error('Error loading application data:', error);
    throw error;
  }
};

/**
 * Populate room select dropdown with enhanced options
 */
const populateRoomSelect = (): void => {
  if (!elements.roomSelect) return;

  // Clear existing options except the first one
  elements.roomSelect.innerHTML = '<option value="">Seleziona una sala</option>';

  appState.rooms.forEach(room => {
    const option = document.createElement("option");
    option.value = room.id.toString();
    option.textContent = `${room.name} (${room.capacity} posti)`;
    elements.roomSelect!.appendChild(option);
  });
};

/**
 * Populate time slots dropdown
 */
const populateTimeSlots = (): void => {
  if (!elements.timeSelect) return;

  elements.timeSelect.innerHTML = '<option value="">Seleziona un orario</option>';

  timeSlots.forEach(time => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    elements.timeSelect!.appendChild(option);
  });
};

/**
 * Set minimum date to today with proper formatting
 */
const setMinDate = (): void => {
  if (!elements.dateInput) return;

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  elements.dateInput.min = todayString;
  elements.dateInput.value = todayString;
  appState.selectedDate = todayString;
};

/**
 * Setup event listeners with proper error handling
 */
const setupEventListeners = (): void => {
  if (!elements.bookingForm || !elements.dateInput || !elements.roomSelect) return;

  // Form submission
  elements.bookingForm.addEventListener("submit", handleBookingSubmission);

  // Debounced availability updates
  const debouncedUpdate = debounce(updateAvailableTimeSlots, 300);
  
  elements.dateInput.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement;
    appState.selectedDate = target.value;
    debouncedUpdate();
  });

  elements.roomSelect.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    appState.selectedRoom = target.value ? parseInt(target.value) : null;
    debouncedUpdate();
  });

  // Time selection
  elements.timeSelect?.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    appState.selectedTime = target.value || null;
  });
};

/**
 * Enhanced booking submission handler
 */
const handleBookingSubmission = async (event: Event): Promise<void> => {
  event.preventDefault();
  
  if (!elements.roomSelect || !elements.dateInput || !elements.timeSelect) {
    showMessage("Form elements not available", MessageType.ERROR);
    return;
  }

  const roomId = parseInt(elements.roomSelect.value);
  const date = elements.dateInput.value;
  const time = elements.timeSelect.value;

  // Client-side validation
  const validationResult = validateBookingInput(roomId, date, time);
  if (!validationResult.isValid) {
    showMessage(validationResult.errors[0], MessageType.ERROR);
    return;
  }

  // Show loading state
  const submitButton = elements.bookingForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
  const originalText = submitButton?.textContent || '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Prenotazione in corso...';
  }

  try {
    // Double-check availability
    if (!isSlotAvailable(roomId, date, time)) {
      throw new Error("La sala è già prenotata per questo orario");
    }

    const booking: Booking = { roomId, date, time };
    const savedBooking = await saveBooking(booking);
    
    // Update app state
    appState.bookings.push(savedBooking);
    
    // Show success message
    const roomName = appState.rooms.find(r => r.id === roomId)?.name || 'Sala';
    const formattedDate = new Date(date).toLocaleDateString('it-IT');
    
    showMessage(
      `Prenotazione confermata per ${roomName} il ${formattedDate} alle ${time}`,
      MessageType.SUCCESS
    );
    
    resetForm();
    updateAvailableTimeSlots();
    
  } catch (error) {
    console.error('Booking submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Errore durante la prenotazione';
    showMessage(errorMessage, MessageType.ERROR);
  } finally {
    // Reset button state
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
};

/**
 * Enhanced input validation
 */
const validateBookingInput = (roomId: number, date: string, time: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!roomId || isNaN(roomId)) {
    errors.push("Seleziona una sala valida");
  }

  if (!date) {
    errors.push("Seleziona una data");
  } else {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push("Non puoi prenotare date passate");
    }
  }

  if (!time) {
    errors.push("Seleziona un orario");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Update available time slots based on selected room and date
 */
const updateAvailableTimeSlots = (): void => {
  if (!elements.timeSelect || !appState.selectedRoom || !appState.selectedDate) {
    return;
  }

  try {
    const bookings = getBookingsForRoomAndDate(appState.selectedRoom, appState.selectedDate);
    const bookedTimes = new Set(bookings.map(b => b.time));

    // Update option availability
    Array.from(elements.timeSelect.options).forEach(option => {
      if (option.value) {
        const isBooked = bookedTimes.has(option.value);
        option.disabled = isBooked;
        option.textContent = isBooked ? `${option.value} (Occupato)` : option.value;
      }
    });

    // Reset selected time if it's now unavailable
    if (appState.selectedTime && bookedTimes.has(appState.selectedTime)) {
      elements.timeSelect.value = '';
      appState.selectedTime = null;
    }

  } catch (error) {
    console.error('Error updating available time slots:', error);
    showMessage("Errore nel caricamento degli orari disponibili", MessageType.ERROR);
  }
};

/**
 * Enhanced message display with better UX
 */
const showMessage = (text: string, type: MessageType): void => {
  if (!elements.message) return;

  elements.message.textContent = text;
  
  // Remove existing classes
  elements.message.className = elements.message.className
    .split(' ')
    .filter(cls => !cls.includes('bg-') && !cls.includes('text-') && !cls.includes('border-'))
    .join(' ');

  // Add type-specific classes
  const typeClasses = {
    [MessageType.SUCCESS]: 'bg-green-100 text-green-800 border border-green-200',
    [MessageType.ERROR]: 'bg-red-100 text-red-800 border border-red-200',
    [MessageType.WARNING]: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    [MessageType.INFO]: 'bg-blue-100 text-blue-800 border border-blue-200'
  };

  elements.message.className += ` mt-6 p-4 rounded-lg text-center text-sm font-medium animate-slide-up ${typeClasses[type]}`;
  elements.message.classList.remove('hidden');

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (elements.message) {
      elements.message.classList.add('hidden');
    }
  }, 5000);
};

/**
 * Reset form to initial state
 */
const resetForm = (): void => {
  if (!elements.roomSelect || !elements.timeSelect || !elements.dateInput) return;

  elements.roomSelect.value = '';
  elements.timeSelect.value = '';
  
  const today = new Date().toISOString().split('T')[0];
  elements.dateInput.value = today;
  
  // Reset app state
  appState.selectedRoom = null;
  appState.selectedTime = null;
  appState.selectedDate = today;
  
  updateAvailableTimeSlots();
};

/**
 * Handle application errors gracefully
 */
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);
  showMessage("Si è verificato un errore imprevisto", MessageType.ERROR);
});

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', initializeApp);