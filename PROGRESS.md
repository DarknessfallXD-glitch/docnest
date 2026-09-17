# DocNest - Development Progress Tracker

## Project Overview
Personal document management app (React Native + Expo + TypeScript)
Working name: DocNest / PocketDocs
Platform: Android initially

---

## Completed Phases

### ✅ Phase 1: Foundation
- React Native/Expo project with TypeScript
- Expo Router for navigation
- Dependencies installed: expo-sqlite, expo-file-system, expo-document-picker, expo-sharing, react-native-pdf, react-native-docx, zustand, nativewind (Tailwind)
- Project structure: app/, components/, lib/, hooks/, types/, constants/

### ✅ Phase 2: Database & Navigation
- SQLite database with tables: documents, folders, tags, document_tags, settings, reading_history
- Navigation: 5 tabs (Home, Folders, Tags, Favorites, Settings)
- Theme system (light/dark/system) with persistence
- Basic UI components: Button, Header, DocumentCard, FolderCard, SearchBar, Modal, EmptyState, TabBar, InputDialog, ConfirmDialog

### ✅ Phase 3: File Import & Document Library
- File picker integration (expo-document-picker)
- Document indexing with metadata (name, type, size, URI, timestamps)
- Home screen with recent documents, favorites, categories
- Folder hierarchy with create/rename/delete/move
- Tag management with colors
- Grid/list view modes
- Sorting (name, date, size, type) with asc/desc
- Real-time search across filenames and tags
- Multi-select with bulk actions (delete, move)

### ✅ Phase 4: TXT Reader (`app/viewer/txt/[id].tsx`)
- Text file reading via expo-file-system
- Font size adjustment (14/16/18/20)
- Line spacing adjustment (1.2/1.5/1.8/2.0/2.5)
- Text search with highlighting and navigation
- Copy/Share/Select All context menu
- Dark mode support
- Reading position persistence (scroll, progress, preferences in reading_history table)
- Reading progress indicator
- Font family options (System/Monospace/Serif)

### ✅ Phase 5: PDF Reader (`app/viewer/pdf/[id].tsx`)
- PDF rendering via react-native-pdf
- Page navigation (prev/next, page indicator)
- Zoom support
- Error handling for corrupted files

### ✅ Phase 6: DOCX Reader (`app/viewer/docx/[id].tsx`)
- DOCX parsing via `mammoth` library (HTML conversion)
- Structure rendering: paragraphs, headings (h1-h6), bullet/numbered lists, tables, images, blockquotes, bold/italic
- Font size adjustment (4 sizes)
- Text search with highlighting and match navigation
- Copy/Share/Select All context menu
- Dark mode support
- Reading position persistence (scroll in reading_history table)
- Table rendering with horizontal scrolling
- Image rendering with constraints

### ✅ Phase 7: File Management
- Rename documents/folders
- Delete with confirmation
- Move between folders
- Duplicate documents
- Folder creation
- Favorites toggle
- Recent documents tracking
- Sorting and filtering

### ✅ Phase 9: Settings & Polish
- Theme selection (Light/Dark/System)
- Default sort order configuration
- Show thumbnails toggle
- Reset settings
- Clear all data (with confirmation)
- About section (version, license, GitHub)

---

## In Progress

*All core reader phases complete. Ready for editing features.*

## Pending

### ⏳ Phase 8: Basic DOCX Editing
**Status:** Not started
**Priority:** Medium

**Requirements:**
- Text editing (type, delete, copy, paste, select)
- Formatting: Bold, Italic, Underline
- Font size adjustment
- Alignment (left, center, right, justify)
- Headings
- Bullet/numbered lists
- Simple tables
- Save back to DOCX format

### ⏳ Advanced Features (Future)
- XLSX viewer (spreadsheets)
- PPTX viewer (presentations)
- Document conversion (DOCX→PDF, etc.)
- OCR/Scan documents
- Cloud synchronization
- AI features (summarize, explain, extract)
- App lock / biometric security

---

## Key Technical Decisions

1. **Offline-first architecture** - No cloud required for core features
2. **SQLite for metadata** - Local database for folders, tags, settings, reading history
3. **File system URIs** - Don't copy files to app storage; use Android's document APIs
4. **Native modules for rendering** - PDF via react-native-pdf, DOCX via mammoth (HTML conversion)
5. **Zustand for state** - Lightweight, persists UI preferences
6. **DOCX parsing strategy** - Convert DOCX → HTML via mammoth → React Native components (accurate + readable + fast, not pixel-perfect)
7. **Reading position persistence** - All viewers save scroll position, progress, and preferences to `reading_history` table

---

## Current File Structure
```
App/
├── app/
│   ├── (tabs)/           # 5 tab screens
│   ├── document/[id].tsx # Document detail/actions
│   ├── viewer/
│   │   ├── pdf/[id].tsx  # ✅ PDF viewer
│   │   ├── image/[id].tsx # ✅ Image viewer
│   │   ├── txt/[id].tsx  # ✅ TXT viewer
│   │   └── docx/[id].tsx # ✅ DOCX viewer
│   ├── _layout.tsx       # Root layout with providers
│   └── +not-found.tsx    # 404 screen
├── components/           # 10+ reusable components
├── lib/
│   ├── database.ts       # SQLite schema & helpers
│   ├── documentService.ts # Document CRUD operations
│   └── settingsService.ts # Settings persistence
├── hooks/
│   ├── useAppStore.ts    # UI state (theme, view, sort, selection)
│   ├── useDocuments.ts   # Document/folder/tag operations
│   └── useTheme.ts       # Theme management
├── types/                # TypeScript interfaces
├── constants/            # Colors, mime types, sizes
└── assets/               # Static assets
```

---

## Next Steps (Priority Order)

1. **Integrate DOCX viewer** into document detail screen
   - ✅ Updated `app/document/[id].tsx` to route DOCX and TXT files to viewers

2. **Add DOCX editing capabilities** (Phase 8)
   - **Status:** Not started
   - **Priority:** Medium
   - **Requirements:**
     - Text editing (type, delete, copy, paste, select)
     - Formatting: Bold, Italic, Underline
     - Font size adjustment
     - Alignment (left, center, right, justify)
     - Headings
     - Bullet/numbered lists
     - Simple tables
     - Save modified DOCX
   - **Technical Approach:**
     - Use content-editable WebView or native TextInput-based editor
     - Toolbar with formatting options
     - Parse back to DOCX XML structure on save
     - Use `docx` library (npm) for generating DOCX files

3. **Testing with real documents**
   - Large DOCX files
   - DOCX with images, tables, different fonts
   - Long PDFs, scanned PDFs
   - Huge TXT files
   - Corrupted files
   - Files moved outside app

---

## Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## Notes for Continuation

- The TXT reader is complete and tested pattern - use it as reference for DOCX reader
- The DOCX reader (`app/viewer/docx/[id].tsx`) uses mammoth library for HTML conversion
- Reading history table already exists in database schema
- Theme system works across all screens
- Document detail screen (`app/document/[id].tsx`) handles routing to viewers
- All UI components are in `components/` - reuse them
- State management via Zustand stores in `hooks/useAppStore.ts` and `hooks/useDocuments.ts`
- For DOCX editing (Phase 8): Consider using `docx` npm library for generating DOCX files, and either a WebView-based editor or native TextInput with formatting toolbar