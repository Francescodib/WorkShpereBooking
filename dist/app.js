import { saveBooking, isSlotAvailable, getBookings } from "./services/bookingService";
// Initialize rooms data
const rooms = [
    { id: 1, name: "Sala Alfa" },
    { id: 2, name: "Sala Beta" },
    { id: 3, name: "Sala Gamma" },
];
// Initialize time slots
const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "14:00", "15:00", "16:00", "17:00"
];
// DOM Elements
const elements = {
    roomSelect: document.getElementById("room"),
    dateInput: document.getElementById("date"),
    timeSelect: document.getElementById("time"),
    bookButton: document.getElementById("bookBtn"),
    message: document.getElementById("message")
};
// Initialize the application
function initializeApp() {
    populateRoomSelect();
    populateTimeSlots();
    setMinDate();
    setupEventListeners();
    loadExistingBookings();
}
// Populate room select dropdown
function populateRoomSelect() {
    const { roomSelect } = elements;
    rooms.forEach(room => {
        const option = document.createElement("option");
        option.value = room.id.toString();
        option.textContent = room.name;
        roomSelect.appendChild(option);
    });
}
// Populate time slots
function populateTimeSlots() {
    const { timeSelect } = elements;
    timeSlots.forEach(time => {
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}
// Set minimum date to today
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.dateInput.min = today;
    elements.dateInput.value = today;
}
// Setup event listeners
function setupEventListeners() {
    elements.bookButton.addEventListener("click", handleBooking);
    elements.dateInput.addEventListener("change", updateAvailableTimeSlots);
    elements.roomSelect.addEventListener("change", updateAvailableTimeSlots);
}
// Load existing bookings
function loadExistingBookings() {
    const bookings = getBookings();
    console.log('Existing bookings:', bookings);
}
// Handle booking submission
function handleBooking(event) {
    var _a;
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
    const booking = { roomId, date, time };
    try {
        saveBooking(booking);
        const roomName = ((_a = rooms.find(r => r.id === roomId)) === null || _a === void 0 ? void 0 : _a.name) || 'Sala';
        const formattedDate = new Date(date).toLocaleDateString('it-IT');
        showMessage(`Prenotazione confermata per ${roomName} il ${formattedDate} alle ${time}`, 'success');
        resetForm();
        updateAvailableTimeSlots();
    }
    catch (error) {
        console.error('Booking error:', error);
        showMessage("Si è verificato un errore durante il salvataggio della prenotazione", 'error');
    }
}
// Validate form inputs
function validateInputs(roomId, date, time) {
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
function updateAvailableTimeSlots() {
    const { roomSelect, dateInput, timeSelect } = elements;
    const roomId = parseInt(roomSelect.value);
    const date = dateInput.value;
    if (!roomId || !date)
        return;
    const bookings = getBookings();
    const bookedSlots = bookings
        .filter(b => b.roomId === roomId && b.date === date)
        .map(b => b.time);
    Array.from(timeSelect.options).forEach(option => {
        option.disabled = bookedSlots.includes(option.value);
    });
}
// Show message to user
function showMessage(text, type) {
    const { message } = elements;
    message.textContent = text;
    message.className = `mt-6 p-4 rounded-lg text-center text-sm font-medium ${type === 'success'
        ? 'bg-green-100 text-green-800 border border-green-200'
        : 'bg-red-100 text-red-800 border border-red-200'}`;
    message.classList.remove('hidden');
    setTimeout(() => {
        message.classList.add('hidden');
    }, 5000);
}
// Reset form
function resetForm() {
    elements.roomSelect.value = '';
    elements.timeSelect.value = '';
    elements.dateInput.value = new Date().toISOString().split('T')[0];
}
// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
