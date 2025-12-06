# Component Structure

This document describes the organized component structure implemented according to the development workflow.

## 📁 Directory Structure

```
components/
├── ui/                          # Pure UI Components (No Logic)
│   ├── Button.tsx               # Reusable button component
│   ├── Card.tsx                 # Reusable card component
│   ├── Avatar.tsx               # User avatar component
│   ├── Badge.tsx                # Badge/label component
│   ├── LoadingSpinner.tsx       # Loading spinner
│   └── index.ts                 # Export all UI components
│
├── features/                    # Feature Components (UI + Logic)
│   ├── photo/
│   │   ├── PhotoCapture.tsx     # Photo capture with upload logic
│   │   ├── PhotoFeed.tsx        # Photo feed display
│   │   └── index.ts
│   │
│   ├── map/
│   │   ├── InteractiveMap.tsx    # Map with location logic
│   │   ├── MapDrawer.tsx        # Map drawer component
│   │   └── index.ts
│   │
│   ├── game/
│   │   ├── GameProgressBar.tsx  # Game progress display
│   │   ├── GameActions.tsx      # Game actions panel
│   │   ├── AchievementToast.tsx # Achievement notifications
│   │   └── index.ts
│   │
│   ├── groups/                  # (Future: Group components)
│   ├── chat/                    # (Future: Chat components)
│   └── profile/                 # (Future: Profile components)
│
└── layout/                      # Layout Components
    ├── SignOutButton.tsx
    └── index.ts
```

## 🎯 Component Types

### UI Components (`components/ui/`)
**Purpose**: Pure presentation, reusable across features
- ✅ No API calls
- ✅ No business logic
- ✅ Props-driven
- ✅ Fully typed
- ✅ Mobile-optimized

**Usage**:
```tsx
import { Button, Card, Avatar, Badge } from "@/components/ui";
```

### Feature Components (`components/features/`)
**Purpose**: Business logic + UI combined
- ✅ Contains business logic
- ✅ Uses hooks for data
- ✅ Handles user interactions
- ✅ Feature-specific

**Usage**:
```tsx
import { PhotoCapture } from "@/components/features/photo";
import { InteractiveMap } from "@/components/features/map";
import { GameProgressBar } from "@/components/features/game";
```

### Layout Components (`components/layout/`)
**Purpose**: Page structure and navigation
- ✅ Navigation logic
- ✅ Layout structure
- ✅ Shared UI elements

**Usage**:
```tsx
import { SignOutButton } from "@/components/layout";
```

## 📝 Import Guidelines

### ✅ Good Imports
```tsx
// UI components - use barrel export
import { Button, Card, Avatar } from "@/components/ui";

// Feature components - use feature index
import { PhotoCapture } from "@/components/features/photo";
import { InteractiveMap } from "@/components/features/map";

// Default exports - direct import
import PhotoFeed from "@/components/features/photo/PhotoFeed";
```

### ❌ Bad Imports
```tsx
// Don't import from old locations
import { Button } from "@/components/Button"; // ❌

// Don't import feature components from ui
import { PhotoCapture } from "@/components/ui"; // ❌
```

## 🔄 Migration Status

### ✅ Completed
- [x] Created UI components directory
- [x] Created feature components directory structure
- [x] Moved components to new locations
- [x] Created UI component library (Button, Card, Avatar, Badge, LoadingSpinner)
- [x] Updated imports in app pages
- [x] Created index files for easy imports
- [x] Verified build works

### 📋 Future Tasks
- [ ] Extract more UI components as needed
- [ ] Create group feature components
- [ ] Create chat feature components
- [ ] Create profile feature components
- [ ] Add more reusable UI components (Input, Modal, etc.)

## 🎨 UI Component Library

### Button
```tsx
<Button variant="primary" size="md" loading={isLoading}>
  Click me
</Button>
```

### Card
```tsx
<Card variant="elevated">
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### Avatar
```tsx
<Avatar src={user.avatar} name={user.name} size="md" />
```

### Badge
```tsx
<Badge variant="success">Active</Badge>
```

### LoadingSpinner
```tsx
<LoadingSpinner size="md" />
```

## 📚 Best Practices

1. **Use UI components** for pure presentation
2. **Use feature components** for business logic
3. **Import from index files** when available
4. **Keep components focused** - one responsibility
5. **Mobile-first** - all components optimized for mobile
6. **Type everything** - use TypeScript interfaces

---

**Last Updated**: 2025-01-XX
**Maintainers**: Giorgi, Achi

