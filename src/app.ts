import { Room } from "./models/Room";
import { Booking } from "./models/Booking";
  
const rooms: Room[] = [
    { id: 1, name: "Sala Alfa" },
    { id: 2, name: "Sala Beta" },
    { id: 3, name: "Sala Gamma" },
];
  
let bookings: Booking[] = [];
  
function populateRoomSelect(): void {
    const select = document.getElementById("room") as HTMLSelectElement;
    rooms.forEach(room => {
      const option = document.createElement("option");
      option.value = room.id.toString();
      option.textContent = room.name;
      select.appendChild(option);
    });
}

function showMessage(text: string, type: 'success' | 'error'): void {
    const message = document.getElementById("message") as HTMLDivElement;
    message.textContent = text;
    message.className = `mt-6 p-4 rounded-lg text-center text-sm font-medium ${
      type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`;
    message.classList.remove('hidden');
    
    // Hide message after 5 seconds
    setTimeout(() => {
      message.classList.add('hidden');
    }, 5000);
}

function bookRoom(): void {
    const roomSelect = document.getElementById("room") as HTMLSelectElement;
    const dateInput = document.getElementById("date") as HTMLInputElement;
    const timeSelect = document.getElementById("time") as HTMLSelectElement;
  
    const roomId = parseInt(roomSelect.value);
    const date = dateInput.value;
    const time = timeSelect.value;
  
    // Validation
    if (!roomId) {
      showMessage("Seleziona una sala!", 'error');
      return;
    }
    
    if (!date) {
      showMessage("Seleziona una data!", 'error');
      return;
    }
    
    if (!time) {
      showMessage("Seleziona una fascia oraria!", 'error');
      return;
    }
  
    const alreadyBooked = bookings.some(b =>
      b.roomId === roomId && b.date === date && b.time === time
    );
  
    if (alreadyBooked) {
      showMessage("La sala è già prenotata per questo orario e data!", 'error');
    } else {
      bookings.push({ roomId, date, time });
      const roomName = rooms.find(r => r.id === roomId)?.name || 'Sala';
      const formattedDate = new Date(date).toLocaleDateString('it-IT');
      showMessage(`Prenotazione confermata per ${roomName} il ${formattedDate} alle ${time}`, 'success');
      
      // Reset form
      roomSelect.value = '';
      timeSelect.value = '';
    }
}
  
window.addEventListener("DOMContentLoaded", () => {
    populateRoomSelect();
    const bookBtn = document.getElementById("bookBtn")!;
    bookBtn.addEventListener("click", bookRoom);
    const dateInput = document.getElementById("date") as HTMLInputElement;
    dateInput.valueAsDate = new Date();
});
  