import { Room } from "./models/Room";
import { Booking } from "./models/Booking";
import { saveBooking, isSlotAvailable, getBookings } from "./services/bookingService";

// Initialize rooms data
const rooms: Room[] = [
  { id: 1, name: "Sala Alfa" },
  { id: 2, name: "Sala Beta" },
  { id: 3, name: "Sala Gamma" },
];

// Initialize time slots
const timeSlots: string[] = [
  "09:00", "10:00", "11:00", "12:00", 
  "14:00", "15:00", "16:00", "17:00"
];

// DOM Elements
const elements = {
  roomSelect: document.getElementById("room") as HTMLSelectElement,
  dateInput: document.getElementById("date") as HTMLInputElement,
  timeSelect: document.getElementById("time") as HTMLSelectElement,
  bookButton: document.getElementById("bookBtn") as HTMLButtonElement,
  message: document.getElementById("message") as HTMLDivElement
};

// Initialize the application
function initializeApp(): void {
  populateRoomSelect();
  populateTimeSlots();
  setMinDate();
  setupEventListeners();
  loadExistingBookings();
}

// Populate room select dropdown
function populateRoomSelect(): void {
  const { roomSelect } = elements;
  rooms.forEach(room => {
    const option = document.createElement("option");
    option.value = room.id.toString();
    option.textContent = room.name;
    roomSelect.appendChild(option);
  });
}

// Populate time slots
function populateTimeSlots(): void {
  const { timeSelect } = elements;
  timeSlots.forEach(time => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
  });
}

// Set minimum date to today
function setMinDate(): void {
  const today = new Date().toISOString().split('T')[0];
  elements.dateInput.min = today;
  elements.dateInput.value = today;
}

// Setup event listeners
function setupEventListeners(): void {
  elements.bookButton.addEventListener("click", handleBooking);
  elements.dateInput.addEventListener("change", updateAvailableTimeSlots);
  elements.roomSelect.addEventListener("change", updateAvailableTimeSlots);
}

// Load existing bookings
function loadExistingBookings(): void {
  const bookings = getBookings();
  console.log('Existing bookings:', bookings);
}

// Handle booking submission
function handleBooking(event: Event): void {
  event.preventDefault();
  
  const { roomSelect, dateInput, timeSelect } = elements;
  const roomId = parseInt(roomSelect.value);
  const date = dateInput.value;
  const time = timeSelect.value;

  if (!validateInputs(roomId, date, time)) {
    return;
  }

  if (!isSlotAvailable(roomId, date, time)) {
    showMessage("La sala è già prenotata per questo orario", 'error');
    return;
  }

  const booking: Booking = { roomId, date, time };
  try {
    saveBooking(booking);
    const roomName = rooms.find(r => r.id === roomId)?.name || 'Sala';
    const formattedDate = new Date(date).toLocaleDateString('it-IT');
    showMessage(
      `Prenotazione confermata per ${roomName} il ${formattedDate} alle ${time}`,
      'success'
    );
    resetForm();
    updateAvailableTimeSlots();
  } catch (error) {
    console.error('Booking error:', error);
    showMessage("Si è verificato un errore durante il salvataggio della prenotazione", 'error');
  }
}

// Validate form inputs
function validateInputs(roomId: number, date: string, time: string): boolean {
  if (!roomId) {
    showMessage("Seleziona una sala", 'error');
    return false;
  }
  
  if (!date) {
    showMessage("Seleziona una data", 'error');
    return false;
  }
  
  if (!time) {
    showMessage("Seleziona un orario", 'error');
    return false;
  }
  
  return true;
}

// Update available time slots based on selected room and date
function updateAvailableTimeSlots(): void {
  const { roomSelect, dateInput, timeSelect } = elements;
  const roomId = parseInt(roomSelect.value);
  const date = dateInput.value;

  if (!roomId || !date) return;

  const bookings = getBookings();
  const bookedSlots = bookings
    .filter(b => b.roomId === roomId && b.date === date)
    .map(b => b.time);

  Array.from(timeSelect.options).forEach(option => {
    option.disabled = bookedSlots.includes(option.value);
  });
}

// Show message to user
function showMessage(text: string, type: 'success' | 'error'): void {
  const { message } = elements;
  message.textContent = text;
  message.className = `mt-6 p-4 rounded-lg text-center text-sm font-medium ${
    type === 'success' 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200'
  }`;
  message.classList.remove('hidden');
  
  setTimeout(() => {
    message.classList.add('hidden');
  }, 5000);
}

// Reset form
function resetForm(): void {
  elements.roomSelect.value = '';
  elements.timeSelect.value = '';
  elements.dateInput.value = new Date().toISOString().split('T')[0];
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);