# Page Structure

This document describes the organized page structure using Next.js route groups.

## 📁 Current Structure

```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout
│
├── (auth)/                     # Authentication pages (route group)
│   └── login/
│       └── page.tsx            # /login
│
└── (main)/                     # Main app pages (route group)
    ├── live/
    │   └── page.tsx            # /live (AI Chat)
    ├── map/
    │   └── page.tsx            # /map
    ├── groups/
    │   ├── page.tsx            # /groups (Groups List)
    │   └── [groupId]/
    │       └── page.tsx        # /groups/:groupId (Group Detail)
    ├── profile/                # (Future) /profile
    └── quests/                 # (Future) /quests
```

## 🎯 Route Groups

### `(auth)` - Authentication Pages
**Purpose**: Pages for user authentication
- `/login` - Login page
- `/register` - (Future) Registration page

**Note**: Route groups (parentheses) don't affect URLs. `(auth)/login` → `/login`

### `(main)` - Main Application Pages
**Purpose**: Core application pages
- `/live` - Main AI chat interface
- `/map` - Map view with locations and photos
- `/groups` - Groups list and management
- `/groups/:groupId` - Individual group details
- `/profile` - (Future) User profile
- `/quests` - (Future) Quest management

## 📝 URL Structure

All URLs remain the same - route groups are for organization only:

| Route Group | File Path | URL |
|------------|-----------|-----|
| `(auth)/login` | `app/(auth)/login/page.tsx` | `/login` |
| `(main)/live` | `app/(main)/live/page.tsx` | `/live` |
| `(main)/map` | `app/(main)/map/page.tsx` | `/map` |
| `(main)/groups` | `app/(main)/groups/page.tsx` | `/groups` |
| `(main)/groups/[groupId]` | `app/(main)/groups/[groupId]/page.tsx` | `/groups/:groupId` |

## 🔄 Benefits

1. **Organization**: Pages grouped by purpose
2. **Layouts**: Can add group-specific layouts later
3. **Clarity**: Clear separation of auth vs main pages
4. **Scalability**: Easy to add new pages to appropriate groups

## 📋 Future Pages

### Profile (`(main)/profile/`)
- `/profile` - User profile, stats, achievements

### Quests (`(main)/quests/`)
- `/quests` - Quest list
- `/quests/:questId` - Quest details

### Register (`(auth)/register/`)
- `/register` - User registration

## 🚀 Adding New Pages

### To add a new main page:
```bash
mkdir -p app/(main)/new-page
touch app/(main)/new-page/page.tsx
```

### To add a new auth page:
```bash
mkdir -p app/(auth)/new-auth
touch app/(auth)/new-auth/page.tsx
```

### To add a dynamic route:
```bash
mkdir -p app/(main)/feature/[id]
touch app/(main)/feature/[id]/page.tsx
```

## 📚 Related Documentation

- [DEVELOPMENT_WORKFLOW.md](../DEVELOPMENT_WORKFLOW.md) - Overall workflow
- [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md) - Component organization

---

**Last Updated**: 2025-01-XX

