# DocNest

A modern document management app built with React Native, Expo, and TypeScript.

## Features

- **Document Management**: Import, organize, and view PDF, DOCX, TXT, and image files
- **Folder Organization**: Hierarchical folder structure with drag-and-drop support
- **Tagging System**: Color-coded tags for easy categorization
- **Favorites**: Quick access to important documents
- **Search**: Full-text search across documents and tags
- **Offline First**: All data stored locally with Expo SQLite
- **Theme Support**: Light, dark, and system theme modes
- **Cross Platform**: iOS, Android, and Web support

## Tech Stack

- **Framework**: Expo Router (React Native)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Database**: Expo SQLite
- **State Management**: Zustand
- **Navigation**: Expo Router (file-based)
- **File Operations**: Expo File System, Document Picker, Sharing
- **PDF Rendering**: react-native-pdf

## Project Structure

```
DocNest/
├── app/                    # Expo Router routes
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Documents
│   │   ├── folders.tsx    # Folder browser
│   │   ├── tags.tsx       # Tag management
│   │   ├── favorites.tsx  # Favorite documents
│   │   └── settings.tsx   # App settings
│   ├── document/          # Document detail & actions
│   ├── viewer/            # PDF & Image viewers
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 screen
├── components/            # Reusable UI components
├── lib/                   # Utilities & database
│   ├── database.ts        # SQLite setup & helpers
│   ├── documentService.ts # Document CRUD operations
│   └── settingsService.ts # Settings persistence
├── hooks/                 # Custom React hooks
│   ├── useAppStore.ts     # Global app state (Zustand)
│   ├── useDocuments.ts    # Document operations
│   └── useTheme.ts        # Theme management
├── types/                 # TypeScript definitions
├── constants/             # App constants
└── assets/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator / Android Emulator / Physical device

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

### Development Commands

```bash
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
```

## Key Dependencies

### Core
- `expo-router` - File-based navigation
- `expo-sqlite` - Local database
- `expo-file-system` - File operations
- `expo-document-picker` - File import
- `expo-sharing` - Document sharing

### UI/UX
- `nativewind` - Tailwind CSS for React Native
- `react-native-gesture-handler` - Gestures
- `react-native-reanimated` - Animations
- `react-native-safe-area-context` - Safe areas
- `react-native-screens` - Native navigation
- `@expo/vector-icons` - Icon library

### Document Processing
- `react-native-pdf` - PDF rendering
- `react-native-docx` - DOCX support
- `opentype.js` - Font handling

### State & Utils
- `zustand` - Lightweight state management
- `date-fns` - Date formatting
- `uuid` - Unique ID generation

## Database Schema

```sql
-- Folders table
CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  color TEXT,
  icon TEXT,
  FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uri TEXT NOT NULL,
  thumbnail_uri TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_favorite INTEGER DEFAULT 0,
  folder_id TEXT,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- Tags table
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Document-Tag relationships
CREATE TABLE document_tags (
  document_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (document_id, tag_id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## Customization

### Theming

Edit `tailwind.config.js` to customize colors:

```js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#0EA5E9',  // Your brand color
        // ...other shades
      },
    },
  },
}
```

### Adding Document Types

1. Add type to `types/index.ts`
2. Update `constants/index.ts` with MIME types
3. Add icon/color in `components/DocumentCard.tsx`
4. Handle in `lib/documentService.ts` detection

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## License

MIT License - see LICENSE file for details.