# Application Architecture Documentation

This document describes the refactored architecture of the Polish Lesson web application, following Domain-Driven Design (DDD) and Hexagonal Architecture principles with MVVM pattern for the presentation layer.

## 📐 Architecture Overview

The application is organized into **4 distinct layers**, each with specific responsibilities:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (MVVM: Views, ViewModels, Components)                      │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │   Views      │  │  ViewModels    │  │  Components    │  │
│  │  (Builders)  │←→│   (State)      │  │  (UI Elements) │  │
│  └──────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│         (Business Logic & Orchestration)                     │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ LessonService  │  │ DictionaryService│  │ProgressSvc  │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│         (Adapters for External Services)                     │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │  ApiAdapter    │  │ SpeechApiAdapter │  │ StorageAdpt │ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│              (Core Business Entities)                        │
│  ┌──────┐  ┌────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Word │  │ Lesson │  │ Dialogue │  │  Value Objects   │  │
│  └──────┘  └────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 1. 🗄️ Domain Layer (`js/domain/`)

**Purpose:** The core of the application containing business entities and value objects. This layer has **no dependencies** on other layers.

### Entities

Located in `js/domain/entities/`:

- **`Word.js`** - Represents a Polish word with translations, pronunciation, inflections, and examples
- **`Lesson.js`** - Represents a complete lesson with metadata, dialogue, grammar, and exercises
- **`DialogueLine.js`** - Represents a single line in a dialogue
- **`Exercise.js`** - Represents an exercise with questions and solutions
- **`GrammarTopic.js`** - Represents a grammar topic/rule
- **`Category.js`** - Represents a lesson category in the catalog

### Value Objects

Located in `js/domain/value-objects/`:

- **`Translation.js`** - Word translations in different languages
- **`Pronunciation.js`** - Phonetic information (IPA, Russian transcription)
- **`Morphology.js`** - Morphological properties (aspect, gender, etc.)
- **`Inflection.js`** - Inflected forms (conjugations, declensions)
- **`Example.js`** - Usage examples with translations

### Example Usage

```javascript
import { Word } from './domain/entities/Word.js';

const word = Word.fromData({
  lemma: 'być',
  part_of_speech: 'verb',
  translations: { ru: 'быть' },
  // ... other properties
});

console.log(word.getLemma());         // 'być'
console.log(word.getTranslation());   // 'быть'
console.log(word.isVerb());           // true
```

## 2. 🔌 Infrastructure Layer (`js/infrastructure/`)

**Purpose:** Adapters for external services and APIs. Isolates the application from implementation details.

### Adapters

- **`ApiAdapter.js`** (`infrastructure/api/`)
  - Wraps the core API for fetching lessons, dictionary, catalog
  - Converts raw JSON to domain entities
  - Handles caching and request deduplication

- **`SpeechApiAdapter.js`** (`infrastructure/speech/`)
  - Wraps the Web Speech Synthesis API
  - Provides text-to-speech functionality for Polish

- **`StorageAdapter.js`** (`infrastructure/storage/`)
  - Wraps localStorage for data persistence
  - Manages user progress, preferences, bookmarks

- **`IndexedDBAdapter.js`** (`infrastructure/storage/`)
  - Future implementation for offline-first storage

### Example Usage

```javascript
import { ApiAdapter } from './infrastructure/api/ApiAdapter.js';

const apiAdapter = new ApiAdapter('data/');
const catalog = await apiAdapter.getCatalog();     // Returns Catalog entity
const lesson = await apiAdapter.getLesson('id');   // Returns Lesson entity
```

## 3. 🎯 Application Layer (`js/application/services/`)

**Purpose:** Coordinates domain entities and infrastructure adapters to implement business logic.

### Services

- **`DictionaryService.js`**
  - Manages dictionary loading and word lookups
  - Provides search and filtering capabilities
  - Handles phonetic rules

- **`LessonService.js`**
  - Manages lesson catalog and lesson loading
  - Tracks lesson progress and completion
  - Provides lesson statistics

- **`ProgressService.js`**
  - Manages user progress and study statistics
  - Handles bookmarks and word progress
  - Tracks streaks and study time

- **`ExerciseService.js`**
  - Manages exercise state and answers
  - Calculates exercise results
  - Saves and retrieves exercise completion data

### Example Usage

```javascript
import { LessonService } from './application/services/LessonService.js';

const lessonService = new LessonService(apiAdapter, storageAdapter);
await lessonService.init();

const lesson = await lessonService.loadLesson('restaurant-dialogue-1');
lessonService.markLessonCompleted('restaurant-dialogue-1');
```

## 4. 🎨 Presentation Layer (`js/presentation/`)

**Purpose:** MVVM pattern implementation for the UI layer.

### Component Hierarchy

#### Base Components (`components/base/`)

Fundamental, fully reusable UI elements:

- **`Button.js`** - Button with variants (primary, secondary, icon)
- **`Input.js`** - Input fields and textareas
- **`Icon.js`** - Icon wrapper (Font Awesome)
- **`Card.js`** - Card container with header/content/footer
- **`Badge.js`** - Label badges for statuses and counts

#### Composite Components (`components/composite/`)

Combinations of base components:

- **`SoundButton.js`** - Button with audio playback
- **`Modal.js`** - Modal dialog with confirm/alert utilities
- **`SearchField.js`** - Search input with clear button
- **`TabBar.js`** - Tab navigation component

#### Feature Components (`components/features/`)

Large business-specific components:

- **`DialoguePlayer.js`** - Plays dialogue lines with translation/transcription
- **`LessonList.js`** - Displays lesson catalog with search
- **`ExerciseSheet.js`** - Renders and manages exercises
- **`WordDetailsPanel.js`** - Shows detailed word information in modal

### MVVM Pattern

#### ViewModels (`view_models/`)

The "brain" of each view - manages state and business logic:

- **`CatalogViewModel.js`** - State for catalog view
- **`LessonViewModel.js`** - State for lesson view
- **`CategoryViewModel.js`** - State for category view

**Responsibilities:**
- Store view state
- Handle commands from View
- Interact with Application Services
- Notify View of state changes

#### Views (`views/`)

The "builder" of pages - composes UI from components:

- **`CatalogView.js`** - Catalog page builder
- **`LessonView.js`** - Lesson page builder
- **`CategoryView.js`** - Category page builder

**Responsibilities:**
- Compose components on the page
- Listen to DOM events
- Pass events to ViewModel
- Render data from ViewModel

### Example: MVVM Flow

```javascript
// 1. Create ViewModel
const viewModel = new LessonViewModel(
  lessonService,
  dictionaryService,
  exerciseService,
  progressService
);

// 2. Create View
const view = new LessonView(
  viewModel,
  speechAdapter,
  dictionaryService,
  progressService
);

// 3. View subscribes to ViewModel
viewModel.subscribe((state) => {
  view.renderContent(state);
});

// 4. ViewModel loads data
await viewModel.loadLesson('lesson-1');

// 5. User clicks tab -> View calls ViewModel
viewModel.setActiveTab('grammar');

// 6. ViewModel updates state -> View re-renders
```

## 📂 Directory Structure

```
js/
├── domain/
│   ├── entities/
│   │   ├── Word.js
│   │   ├── Lesson.js
│   │   ├── DialogueLine.js
│   │   ├── Exercise.js
│   │   ├── GrammarTopic.js
│   │   └── Category.js
│   └── value-objects/
│       ├── Translation.js
│       ├── Pronunciation.js
│       ├── Morphology.js
│       ├── Inflection.js
│       └── Example.js
│
├── infrastructure/
│   ├── api/
│   │   └── ApiAdapter.js
│   ├── speech/
│   │   └── SpeechApiAdapter.js
│   └── storage/
│       ├── StorageAdapter.js
│       └── IndexedDBAdapter.js
│
├── application/
│   └── services/
│       ├── DictionaryService.js
│       ├── LessonService.js
│       ├── ProgressService.js
│       └── ExerciseService.js
│
├── presentation/
│   ├── components/
│   │   ├── base/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Icon.js
│   │   │   ├── Card.js
│   │   │   └── Badge.js
│   │   ├── composite/
│   │   │   ├── SoundButton.js
│   │   │   ├── Modal.js
│   │   │   ├── SearchField.js
│   │   │   └── TabBar.js
│   │   └── features/
│   │       ├── DialoguePlayer.js
│   │       ├── LessonList.js
│   │       ├── ExerciseSheet.js
│   │       └── WordDetailsPanel.js
│   ├── view_models/
│   │   ├── CatalogViewModel.js
│   │   ├── LessonViewModel.js
│   │   └── CategoryViewModel.js
│   └── views/
│       ├── CatalogView.js
│       ├── LessonView.js
│       └── CategoryView.js
│
├── core/
│   ├── router.js
│   ├── api.js
│   └── util.js
│
├── services/  (legacy - will be replaced)
├── components/ (legacy - will be replaced)
└── ui/ (legacy - will be replaced)
```

## 🚀 Bootstrap Process

The application initializes in `app-new.js`:

```javascript
// 1. Create infrastructure adapters
const apiAdapter = new ApiAdapter('data/');
const speechAdapter = new SpeechApiAdapter();
const storageAdapter = new StorageAdapter();

// 2. Create application services
const dictionaryService = new DictionaryService(apiAdapter);
const lessonService = new LessonService(apiAdapter, storageAdapter);
// ... other services

// 3. Initialize critical services
await dictionaryService.init();
await speechAdapter.init();

// 4. Setup routing
router.addRoute('/lesson/:id', (params) => {
  const viewModel = new LessonViewModel(/* services */);
  const view = new LessonView(viewModel, /* dependencies */);
  view.render(container, params.id);
});

// 5. Start router
router.start();
```

## 🎨 CSS Organization

CSS follows a mobile-first approach with component-based organization:

```
css/
├── base/
│   ├── variables.css    # Design tokens
│   └── reset.css        # CSS reset
├── components/
│   ├── buttons.css      # Button styles
│   ├── cards.css        # Card styles
│   └── ...              # Other component styles
├── layout/
│   └── ...              # Layout styles
└── base.css             # Main entry point
```

## 🔄 Data Flow

### Example: Loading a Lesson

```
1. User clicks lesson in catalog
   ↓
2. View calls ViewModel.loadLesson(id)
   ↓
3. ViewModel calls LessonService.loadLesson(id)
   ↓
4. LessonService calls ApiAdapter.getLesson(id)
   ↓
5. ApiAdapter fetches JSON and converts to Lesson entity
   ↓
6. Lesson entity returned to ViewModel
   ↓
7. ViewModel updates state and notifies View
   ↓
8. View re-renders with new lesson data
```

## ✅ Benefits of This Architecture

1. **Separation of Concerns** - Each layer has a single, clear responsibility
2. **Testability** - Layers can be tested independently with mocks
3. **Maintainability** - Changes are isolated to specific layers
4. **Scalability** - New features can be added without affecting existing code
5. **Type Safety** - Domain entities provide structure and validation
6. **Reusability** - Components can be reused across views
7. **Independence** - Infrastructure can be swapped (e.g., API → GraphQL)

## 🔜 Future Enhancements

- **IndexedDB Integration** - For offline-first data persistence
- **Service Workers** - For PWA capabilities
- **State Management** - Consider Redux/Vuex for complex state
- **TypeScript** - Add static typing for better developer experience
- **Testing** - Unit tests for each layer
- **Lazy Loading** - Code splitting for better performance

## 📚 Further Reading

- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
