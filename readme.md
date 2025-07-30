# WorkSphere Booking System

Sistema di prenotazione sale riunioni sviluppato con TypeScript e Tailwind CSS 4.

## Caratteristiche Principali

- **TypeScript**: Tipizzazione rigorosa per maggiore sicurezza e manutenibilità
- **Tailwind CSS 4**: Styling moderno e responsive con PostCSS
- **Gestione Stato**: State management robusto per l'applicazione
- **Validazione**: Validazione client-side e server-side completa
- **UX Avanzata**: Interfaccia utente moderna con animazioni e feedback

## Struttura del Progetto

```
src/
├── types/           # Type definitions
│   └── index.ts
├── services/        # Business logic services
│   └── bookingService.ts
├── models/          # Data models (deprecated, moved to types)
├── app.ts          # Main application logic
└── input.css       # Tailwind CSS entry point

dist/               # Compiled output
├── app.js
├── types/
├── services/
└── output.css      # Generated CSS
```

## Installazione e Setup

### Prerequisiti
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installazione
```bash
# Clona il repository
git clone <repository-url>
cd worksphere-booking

# Installa le dipendenze
npm install

# Configura Tailwind CSS
npx tailwindcss init -p
```

### Sviluppo
```bash
# Build del progetto
npm run build

# Modalità sviluppo con watch
npm run dev

# Solo TypeScript watch
npm run watch

# Solo CSS watch
npm run watch:css

# Server di sviluppo
npm start
```

## Configurazione Tailwind CSS 4

Il progetto utilizza Tailwind CSS 4 come plugin PostCSS con ES modules:

```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {
      config: './tailwind.config.js'
    },
    autoprefixer: {},
  },
}
```

### Input CSS per Tailwind 4
```css
// src/input.css
@import "tailwindcss";

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700;
  }
}
```

## Architettura del Codice

### Type System
```typescript
// Enhanced type definitions
interface Booking {
  id?: string;
  roomId: number;
  date: string;
  time: string;
  duration?: number;
  bookedBy?: string;
  createdAt?: Date;
}

enum MessageType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}
```

### Service Layer
```typescript
// Async booking operations with error handling
export const saveBooking = (booking: Booking): Promise<Booking> => {
  // Enhanced validation and error handling
}
```

### State Management
```typescript
// Application state interface
interface AppState {
  rooms: Room[];
  bookings: Booking[];
  selectedRoom: number | null;
  selectedDate: string | null;
  selectedTime: string | null;
}
```

## Funzionalità Implementate

### Core Features
- ✅ Selezione sale con informazioni capacità
- ✅ Calendario con validazione date
- ✅ Gestione orari con disponibilità real-time
- ✅ Validazione completa form
- ✅ Persistenza dati localStorage
- ✅ Feedback utente avanzato

### Enhanced Features
- ✅ Debouncing per performance
- ✅ Error boundary globale
- ✅ Loading states
- ✅ Animazioni CSS personalizzate
- ✅ Accessibilità (ARIA labels)
- ✅ Responsive design
- ✅ Type-safe DOM manipulation

### Validation System
```typescript
// Multi-layer validation
const validateBooking = (booking: Booking): BookingValidationResult => {
  const errors: string[] = [];
  
  // Date validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }
  
  // Past date check
  const bookingDate = new Date(booking.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (bookingDate < today) {
    errors.push('Cannot book dates in the past');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

## Miglioramenti Implementati

### 1. Configurazione Tailwind 4 ✅
- Configurazione corretta come plugin PostCSS con ES modules
- Sintassi aggiornata con `@import "tailwindcss"`
- File `tailwind.config.js` con personalizzazioni
- Animazioni custom per UX migliore
- Risolti problemi MIME type e 404 errors

### 2. Type Safety
- Interface complete per tutti gli oggetti
- Enums per valori costanti
- Null-safety per DOM elements
- Promise-based async operations

### 3. Error Handling
- Try-catch globale
- Validazione multi-livello
- User-friendly error messages
- Console logging per debugging

### 4. Performance
- Debouncing per eventi frequenti
- Lazy loading dei dati
- Ottimizzazione DOM queries
- State management efficiente

### 5. User Experience
- Loading states durante operazioni async
- Animazioni smooth
- Feedback visivo immediato
- Accessibilità completa

## Browser Support
- Chrome/Edge >= 88
- Firefox >= 85
- Safari >= 14

## Scripts Disponibili

| Script | Descrizione |
|--------|-------------|
| `npm run build` | Build completo TypeScript + CSS |
| `npm run dev` | Modalità sviluppo con watch |
| `npm run watch` | Watch solo TypeScript |
| `npm run watch:css` | Watch solo CSS |
| `npm start` | Build e server statico |
| `npm run clean` | Pulisce directory dist |
| `npm run lint` | Type checking senza emit |

## Troubleshooting

### Problemi Comuni

1. **CSS non compilato**
   ```bash
   npm run build:css
   ```

2. **TypeScript errors**
   ```bash
   npm run lint
   ```

3. **Tailwind classes non funzionanti**
   - Verifica `tailwind.config.js`
   - Controlla `content` paths
   - Rigenera CSS con `npm run build:css`

4. **Errori ES Module ("module is not defined")**
   - Assicurati che tutti i config files usino `export default` invece di `module.exports`
   - Verifica che `"type": "module"` sia presente in `package.json`

5. **Errori 404 per moduli nel browser**
   - Aggiungi estensioni `.js` agli import TypeScript
   - Usa `npm start` invece di Live Server per servire i file

6. **MIME type errors per CSS**
   - Usa `npm start` che configura correttamente i MIME types
   - Evita Live Server per progetti con strutture di cartelle complesse

### Configurazione ES Modules

Questo progetto usa ES modules. Assicurati che:

```json
// package.json
{
  "type": "module"
}
```

```javascript
// Tutti i config files devono usare:
export default {
  // configurazione
}
```

```typescript
// Import con estensioni .js per compatibilità browser
import { something } from './path/to/module.js';
```

## Roadmap Future

- [ ] Unit testing con Jest
- [ ] E2E testing con Playwright
- [ ] PWA capabilities
- [ ] Offline support
- [ ] Multi-language support
- [ ] Advanced booking conflicts resolution
- [ ] Calendar integration
- [ ] Email notifications

## Contribuire

1. Fork del repository
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## License

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.