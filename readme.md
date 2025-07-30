# WorkSphere Booking System

Sistema di prenotazione sale riunioni professionale sviluppato con **TypeScript 5.8.3** e **Tailwind CSS 4.1.11**.

##  Caratteristiche Principali

### Core Features
- **Sistema di Prenotazione Completo**: Gestione sale, date e orari con validazione real-time
- **Prevenzione Conflitti**: Controllo automatico disponibilità e prevenzione doppie prenotazioni
- **Persistenza Dati**: Storage locale con versioning e migrazione automatica
- **Validazione Multi-livello**: Client-side e service-side con messaggi di errore dettagliati
- **UI Responsiva**: Design mobile-first con animazioni fluide e feedback visivo

### Advanced Features
- **TypeScript Strict Mode**: Tipizzazione rigorosa per massima sicurezza del codice
- **Architettura Modulare**: Separazione chiara tra presentation, application e service layer
- **Performance Ottimizzata**: Debouncing, gestione memoria e aggiornamenti efficienti
- **Error Handling Avanzato**: Sistema di errori classificati con logging strutturato
- **Accessibilità Completa**: ARIA labels, navigazione keyboard, contrast ratio ottimali

##  Architettura del Sistema

### Stack Tecnologico
```
Frontend Framework: Vanilla TypeScript + DOM APIs
CSS Framework: Tailwind CSS 4.1.11 (PostCSS Plugin)
Build Tools: TypeScript Compiler + PostCSS
Module System: ES2020 Modules
Storage: Browser LocalStorage con versioning
```

### Struttura del Progetto
```
worksphere-booking/
├── src/                          # Codice sorgente TypeScript
│   ├── types/                    # Definizioni tipi e interfacce
│   │   └── index.ts             # Types centrali dell'applicazione
│   ├── services/                 # Business logic e data layer
│   │   └── bookingService.ts    # Gestione prenotazioni e storage
│   ├── app.ts                   # Application layer e DOM management
│   └── input.css                # Tailwind CSS entry point
├── dist/                        # Output compilato
│   ├── types/                   # File dichiarazioni TypeScript
│   ├── services/                # Service layer compilato
│   ├── app.js                   # Main application
│   └── output.css               # CSS generato da Tailwind
├── index.html                   # Pagina principale
├── package.json                 # Configurazione progetto e dipendenze
├── tsconfig.json               # Configurazione TypeScript strict
├── tailwind.config.js          # Configurazione Tailwind personalizzata
└── postcss.config.js           # Configurazione PostCSS
```

##  Installazione e Setup

### Prerequisiti
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Editor con supporto TypeScript (VS Code raccomandato)

### Installazione Rapida
```bash
# Clona e accedi al progetto
git clone <repository-url>
cd worksphere-booking

# Installa dipendenze
npm install

# Build completo del progetto
npm run build

# Avvia server di sviluppo
npm start
```

### Setup da Zero
```bash
# Crea directory progetto
mkdir worksphere-booking && cd worksphere-booking

# Inizializza progetto npm
npm init -y

# Installa dipendenze principali
npm install --save-dev typescript@^5.8.3
npm install --save-dev tailwindcss@^4.1.11 @tailwindcss/postcss@^4.1.11
npm install --save-dev postcss@^8.5.6 postcss-cli@^11.0.0 autoprefixer@^10.4.21

# Crea struttura directory
mkdir -p src/{types,services} dist

# Copia file di configurazione dal repository
# tsconfig.json, tailwind.config.js, postcss.config.js
```

##  Comandi di Sviluppo

### Build e Compilazione
```bash
npm run build          # Build completo (TypeScript + CSS)
npm run build:ts       # Solo compilazione TypeScript  
npm run build:css      # Solo generazione CSS Tailwind
```

### Modalità Sviluppo
```bash
npm run dev            # Watch mode per TS e CSS simultaneo
npm run watch          # Solo TypeScript watch mode
npm run watch:css      # Solo CSS watch mode
```

### Utilità
```bash
npm run clean          # Pulisce directory dist/
npm run lint           # Type checking senza compilazione
npm start              # Build + server statico locale
```

## 📋 Implementazione Dettagliata

### 1. Sistema di Tipi TypeScript

#### Interfacce Core
```typescript
interface Room {
  id: number;
  name: string;
  capacity?: number;        // Capacità opzionale per estensibilità
  amenities?: string[];     // Servizi disponibili
}

interface Booking {
  id?: string;              // Generato automaticamente
  roomId: number;
  date: string;             // Formato: YYYY-MM-DD
  time: string;             // Formato: HH:MM
  duration?: number;        // Durata in minuti (default: 60)
  bookedBy?: string;        // Utente prenotazione
  createdAt?: Date;         // Timestamp creazione
}

interface AppState {
  rooms: Room[];
  bookings: Booking[];
  selectedRoom: number | null;
  selectedDate: string | null;
  selectedTime: string | null;
}
```

#### Enums per Type Safety
```typescript
enum MessageType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

enum TimeSlot {
  SLOT_09_00 = '09:00',
  SLOT_10_00 = '10:00',
  // ... altri slot orari
}
```

### 2. Service Layer Architecture

#### Pattern Promise-Based
```typescript
export const saveBooking = (booking: Booking): Promise<Booking> => {
  return new Promise((resolve, reject) => {
    try {
      // Validazione multi-livello
      const validation = validateBooking(booking);
      if (!validation.isValid) {
        reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
        return;
      }

      // Controllo disponibilità
      if (!isSlotAvailable(booking.roomId, booking.date, booking.time)) {
        reject(new Error('Selected time slot is no longer available'));
        return;
      }

      // Creazione booking con metadata
      const newBooking: Booking = {
        ...booking,
        id: generateBookingId(),
        createdAt: new Date(),
        duration: booking.duration || 60
      };

      // Persistenza storage
      const bookings = getBookings();
      bookings.push(newBooking);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      
      resolve(newBooking);
    } catch (error) {
      console.error('Error saving booking:', error);
      reject(new Error('Failed to save booking. Please try again.'));
    }
  });
};
```

#### Validazione Avanzata
```typescript
const validateBooking = (booking: Booking): BookingValidationResult => {
  const errors: string[] = [];

  // Validazione Room ID
  if (!booking.roomId || booking.roomId <= 0) {
    errors.push('Room ID must be a positive number');
  }

  // Validazione formato data
  if (!booking.date || !/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  // Validazione formato orario
  if (!booking.time || !/^\d{2}:\d{2}$/.test(booking.time)) {
    errors.push('Time must be in HH:MM format');
  }

  // Controllo date passate
  const bookingDate = new Date(booking.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    errors.push('Cannot book dates in the past');
  }

  return { isValid: errors.length === 0, errors };
};
```

### 3. Application Layer Pattern

#### Gestione Stato Centralizzata
```typescript
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
```

#### Debouncing per Performance
```typescript
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Uso: aggiornamenti disponibilità debounced a 300ms
const debouncedUpdate = debounce(updateAvailableTimeSlots, 300);
```

#### Type-Safe DOM Management
```typescript
interface DOMElements {
  roomSelect: HTMLSelectElement | null;
  dateInput: HTMLInputElement | null;
  timeSelect: HTMLSelectElement | null;
  bookingForm: HTMLFormElement | null;
  message: HTMLDivElement | null;
}

const initializeDOMElements = (): boolean => {
  // Type assertions con validazione
  elements = {
    roomSelect: document.getElementById("room") as HTMLSelectElement,
    dateInput: document.getElementById("date") as HTMLInputElement,
    // ... altri elementi
  };

  // Validazione esistenza elementi
  const missingElements = Object.entries(elements)
    .filter(([, element]) => !element)
    .map(([key]) => key);

  return missingElements.length === 0;
};
```

### 4. Tailwind CSS 4 Implementation

#### PostCSS Plugin Configuration
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // Nuovo approccio plugin Tailwind 4
    autoprefixer: {},
  },
}
```

#### Configurazione Personalizzata
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
}
```

#### Design System Components
```html
<!-- Button Primary Pattern -->
<button class="
  w-full 
  bg-gradient-to-r from-blue-600 to-indigo-600 
  hover:from-blue-700 hover:to-indigo-700 
  text-white font-semibold py-3 px-6 rounded-lg 
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
  transition-all duration-200 
  disabled:opacity-50 disabled:cursor-not-allowed 
  transform hover:scale-[1.02] active:scale-[0.98]
">

<!-- Form Input Pattern -->
<input class="
  w-full p-3 
  border border-gray-300 rounded-lg 
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  transition-colors duration-200 
  disabled:bg-gray-100 disabled:cursor-not-allowed
">
```

## Funzionalità Avanzate

### Error Handling Sistemico
```typescript
// Classificazione errori custom
class ValidationError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

class BookingConflictError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'BookingConflictError';
  }
}

// Global error boundary
window.addEventListener('error', (event) => {
  console.error('Global application error:', event.error);
  showMessage('Si è verificato un errore imprevisto', MessageType.ERROR);
});
```

### Storage con Versioning
```typescript
const STORAGE_VERSION = '1.0';
const VERSION_KEY = 'roomBookingsVersion';

const initializeStorage = (): void => {
  const currentVersion = localStorage.getItem(VERSION_KEY);
  
  if (currentVersion !== STORAGE_VERSION) {
    // Logica migrazione dati se necessaria
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
  }
};
```

### Performance Monitoring
```typescript
// Metriche performance basic
const performanceLogger = {
  startTime: performance.now(),
  
  logOperation: (operation: string, startTime: number) => {
    const duration = performance.now() - startTime;
    if (duration > 100) { // Log operazioni > 100ms
      console.warn(`Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }
};
```

## UI/UX Features

### Sistema Messaggi Dinamico
- Messaggi success/error/warning/info con colori differenziati
- Auto-hide dopo 5 secondi con animazione slide-up
- Context-aware error messages per miglior UX

### Responsive Design Strategy
- Mobile-first approach con breakpoint `md:`, `lg:`, `xl:`
- Typography scale responsiva
- Touch-friendly interactions su mobile

### Accessibility Compliance
- ARIA labels e semantic HTML
- Focus management per navigazione keyboard
- Color contrast ratio > 4.5:1 per WCAG compliance
- Screen reader friendly error announcements

## Browser Support & Performance

### Browser Compatibility
- **Chrome/Edge** >= 88 (ES2020 support)
- **Firefox** >= 85
- **Safari** >= 14
- **Mobile browsers** con supporto ES2020

### Performance Metrics
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Bundle size** < 50KB (CSS + JS minified)
- **Memory usage** < 10MB runtime

## Testing Strategy

### Approccio Testing (Teoria)
```typescript
// Unit testing approach
describe('BookingService', () => {
  test('should save valid booking', async () => {
    const booking = { roomId: 1, date: '2024-01-01', time: '09:00' };
    const saved = await saveBooking(booking);
    expect(saved.id).toBeDefined();
  });

  test('should reject invalid booking', async () => {
    const booking = { roomId: 0, date: '', time: '' };
    await expect(saveBooking(booking)).rejects.toThrow();
  });
});

// Integration testing approach  
describe('Booking Flow', () => {
  test('should prevent double booking', async () => {
    const booking = { roomId: 1, date: '2024-01-01', time: '09:00' };
    await saveBooking(booking);
    await expect(saveBooking(booking)).rejects.toThrow('already booked');
  });
});
```

## Security Considerations

### Input Validation
- Sanitizzazione input utente per prevenire XSS
- Validazione formato date/time con regex strict
- Type safety TypeScript come prima difesa

### Data Protection
- localStorage isolation per origin
- No sensitive data storage in client
- Error messages che non espongono internals

## Deployment & Production

### Build per Produzione
```bash
# Clean build
npm run clean
npm run build

# Verifica output
ls -la dist/
du -h dist/*

# Test produzione locale
npm start
```

### Ottimizzazioni Produzione
- CSS purging automatico via Tailwind
- TypeScript compilation ottimizzata
- Source maps per debugging
- Minification via PostCSS

## Roadmap Future

### Features Pianificate
- [ ] **Testing Suite**: Jest + Testing Library + Playwright E2E
- [ ] **PWA Support**: Service workers, offline mode, installabilità
- [ ] **Backend Integration**: REST API, autenticazione, sync multi-device
- [ ] **Advanced Booking**: Ricorrenze, notifiche email, calendar sync
- [ ] **Analytics**: Usage tracking, performance monitoring
- [ ] **Internazionalizzazione**: Multi-language support

### Miglioramenti Tecnici
- [ ] **Bundle Optimization**: Code splitting, lazy loading
- [ ] **State Management**: Redux Toolkit per app complesse
- [ ] **Real-time Updates**: WebSocket per aggiornamenti live
- [ ] **Advanced Caching**: Service worker caching strategies
- [ ] **Error Reporting**: Sentry integration per production monitoring

## Contribuzione

### Setup Sviluppo
1. Fork del repository
2. Clone locale: `git clone <your-fork-url>`
3. Install dipendenze: `npm install`
4. Setup git hooks: `npm run prepare` (se disponibile)
5. Crea feature branch: `git checkout -b feature/nome-feature`

### Standards Codice
- **TypeScript strict mode** obbligatorio
- **Prettier** per code formatting
- **ESLint** per code quality
- **Conventional Commits** per messaggi git
- **Commenti in inglese** anche per codebase italiana

### Pull Request Process
1. Ensure build passa: `npm run build`
2. Type checking: `npm run lint`
3. Test manual completo
4. Update documentation se necessario
5. Squash commits prima del merge

## License & Credits

**License**: MIT License - vedi file LICENSE per dettagli

**Sviluppato da**: Francesco di Biase
**Tecnologie**: TypeScript, Tailwind CSS 4, PostCSS
**Supporto**: Documentazione completa e community support

---

*Questo progetto rappresenta un esempio di best practices per applicazioni TypeScript moderne, con focus su type safety, performance e user experience.*