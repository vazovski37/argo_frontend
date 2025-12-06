# Argonauts Frontend

AI-powered travel guide for exploring Poti, Georgia.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

## 📁 Project Structure

```
argo_frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (Next.js)
│   ├── live/              # Main AI chat interface
│   ├── map/               # Map view
│   ├── groups/            # Social groups
│   └── login/             # Authentication
│
├── components/
│   ├── ui/                # Pure UI components (reusable)
│   ├── features/          # Feature components (UI + logic)
│   └── layout/            # Layout components
│
├── hooks/                  # React hooks
│   ├── queries/           # Data fetching hooks
│   └── mutations/         # Data mutation hooks
│
├── lib/                    # Utilities
│   ├── api/               # API client
│   ├── schemas/           # Zod schemas
│   └── query/             # React Query setup
│
└── contexts/               # React contexts
```

## 🧩 Component Organization

### UI Components (`components/ui/`)
Pure presentation components - no business logic.

```tsx
import { Button, Card, Avatar, Badge, Modal, Input } from "@/components/ui";
```

**Available Components:**
- `Button` - Reusable button with variants
- `Card` - Card container with variants
- `Avatar` - User avatar with fallback
- `Badge` - Badge/label component
- `Modal` - Modal dialog
- `Input` - Form input with label/error
- `LoadingSpinner` - Loading indicator

### Feature Components (`components/features/`)
Business logic + UI combined.

```tsx
import { PhotoCapture } from "@/components/features/photo";
import { InteractiveMap } from "@/components/features/map";
import { GameProgressBar } from "@/components/features/game";
```

**Feature Areas:**
- `photo/` - Photo capture and feed
- `map/` - Interactive map and drawer
- `game/` - Game progress and actions
- `groups/` - (Future) Group components
- `chat/` - (Future) Chat components
- `profile/` - (Future) Profile components

## 📚 Documentation

- **[DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md)** - Branch strategy and workflow
- **[COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md)** - Component organization guide
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - How to migrate to new structure
- **[MOBILE_FIRST_GUIDE.md](../MOBILE_FIRST_GUIDE.md)** - Mobile-first design patterns

## 🎨 Design System

### Colors
- **Background**: `bg-slate-950` with gradients
- **Accent**: `sky-400/500` and `cyan-400`
- **Borders**: `border-sky-400/40`

### Typography
- **Headings**: `text-white font-bold`
- **Body**: `text-slate-400`
- **Mobile-first**: Responsive text sizes

### Components
- **Cards**: `backdrop-blur-xl bg-slate-950/70 border border-sky-400/40 rounded-2xl`
- **Buttons**: Gradient from `sky-500` to `cyan-400`
- **Touch targets**: Minimum 44x44px

## 🔧 Development

### Branch Strategy
- `main` - Production (auto-deploys to Vercel)
- `giorgi` - Your development branch
- `achi` - Friend's development branch

### Workflow
1. Pull latest from `main`
2. Create feature branch from your dev branch
3. Make changes
4. Test on mobile device
5. Merge to your dev branch
6. Merge to `main` when ready

See [DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md) for details.

### Task Distribution
- **Giorgi**: Photo features, Profile features, UI components
- **Achi**: Map features, Location features, Quest system

## 📱 Mobile-First

99% of users are on mobile. Always:
- Design for mobile first (320px+)
- Test on real devices
- Use touch-friendly targets (44x44px minimum)
- Optimize for performance

See [MOBILE_FIRST_GUIDE.md](../MOBILE_FIRST_GUIDE.md) for patterns.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **State**: React Query (@tanstack/react-query)
- **Maps**: @vis.gl/react-google-maps
- **Forms**: Zod validation
- **UI**: Custom components + Vaul (drawers)

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with hooks
- **Imports**: Use barrel exports when available
- **Naming**: PascalCase for components, camelCase for functions

## 🚨 Common Issues

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Import Errors
Check import paths match new structure:
- UI components: `@/components/ui`
- Feature components: `@/components/features/[feature]`

### Type Errors
Ensure all props are typed with TypeScript interfaces.

## 📞 Getting Help

1. Check documentation files
2. Review component structure guide
3. Check existing code for patterns
4. Ask your co-developer

---

**Happy coding! 🚀**
