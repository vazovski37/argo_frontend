# Migration Guide: Component Reorganization

This guide helps you understand the new component structure and how to migrate existing code.

## 🎯 What Changed?

### Before (Old Structure)
```
components/
├── PhotoCapture.tsx
├── PhotoFeed.tsx
├── InteractiveMap.tsx
├── MapDrawer.tsx
├── GameProgressBar.tsx
├── GameActions.tsx
├── AchievementToast.tsx
└── SignOutButton.tsx
```

### After (New Structure)
```
components/
├── ui/                    # Pure UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── Input.tsx
│   └── LoadingSpinner.tsx
│
├── features/              # Feature components
│   ├── photo/
│   ├── map/
│   └── game/
│
└── layout/                # Layout components
```

## 📝 Import Changes

### Old Imports → New Imports

#### Feature Components
```tsx
// ❌ Old
import { PhotoCapture } from "@/components/PhotoCapture";
import { InteractiveMap } from "@/components/InteractiveMap";
import { GameProgressBar } from "@/components/GameProgressBar";

// ✅ New
import { PhotoCapture } from "@/components/features/photo";
import { InteractiveMap } from "@/components/features/map";
import { GameProgressBar } from "@/components/features/game";
```

#### UI Components (New!)
```tsx
// ✅ Use new UI components
import { Button, Card, Avatar, Badge, Modal, Input } from "@/components/ui";
```

#### Default Exports
```tsx
// ✅ For default exports, use direct path
import PhotoFeed from "@/components/features/photo/PhotoFeed";
```

## 🔄 Migration Steps

### Step 1: Update Feature Component Imports

Find and replace:
```bash
# Photo components
@/components/PhotoCapture → @/components/features/photo
@/components/PhotoFeed → @/components/features/photo/PhotoFeed

# Map components
@/components/InteractiveMap → @/components/features/map
@/components/MapDrawer → @/components/features/map

# Game components
@/components/GameProgressBar → @/components/features/game
@/components/GameActions → @/components/features/game
@/components/AchievementToast → @/components/features/game
```

### Step 2: Replace Custom UI with UI Components

#### Buttons
```tsx
// ❌ Old custom button
<button className="px-4 py-2 bg-amber-500...">
  Click me
</button>

// ✅ New UI Button
import { Button } from "@/components/ui";
<Button variant="primary" size="md">
  Click me
</Button>
```

#### Cards
```tsx
// ❌ Old custom card
<div className="bg-slate-800 rounded-xl p-5...">
  Content
</div>

// ✅ New UI Card
import { Card } from "@/components/ui";
<Card variant="elevated">
  Content
</Card>
```

#### Modals
```tsx
// ❌ Old custom modal
<div className="fixed inset-0...">
  {/* modal code */}
</div>

// ✅ New UI Modal
import { Modal } from "@/components/ui";
<Modal title="Title" onClose={handleClose}>
  Content
</Modal>
```

#### Inputs
```tsx
// ❌ Old custom input
<input className="w-full px-4 py-3 bg-slate-900..." />

// ✅ New UI Input
import { Input } from "@/components/ui";
<Input label="Name" placeholder="Enter name" />
```

### Step 3: Update Dynamic Imports

```tsx
// ❌ Old
const InteractiveMap = dynamic(
  () => import("@/components/InteractiveMap").then((mod) => mod.InteractiveMap),
  { ssr: false }
);

// ✅ New
const InteractiveMap = dynamic(
  () => import("@/components/features/map/InteractiveMap").then((mod) => mod.InteractiveMap),
  { ssr: false }
);
```

## ✅ Verification Checklist

After migration, verify:
- [ ] All imports updated
- [ ] No TypeScript errors
- [ ] Build passes: `npm run build`
- [ ] No runtime errors
- [ ] UI components used where appropriate
- [ ] Feature components still work correctly

## 🆘 Common Issues

### Issue: "Module not found"
**Solution**: Check import path matches new structure

### Issue: "Component not exported"
**Solution**: Use correct export (named vs default)

### Issue: "Type errors"
**Solution**: Import types from component files

## 📚 Examples

### Complete Example: Using UI Components

```tsx
import { Button, Card, Input, Modal, Avatar, Badge } from "@/components/ui";
import { PhotoCapture } from "@/components/features/photo";

export function MyComponent() {
  return (
    <Card variant="elevated">
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={user.avatar} name={user.name} size="md" />
        <div>
          <h3>{user.name}</h3>
          <Badge variant="success">Active</Badge>
        </div>
      </div>
      
      <Input
        label="Name"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      <div className="flex gap-2 mt-4">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} loading={isLoading}>
          Save
        </Button>
      </div>
    </Card>
  );
}
```

## 🎯 Best Practices

1. **Always use UI components** for common patterns
2. **Use feature components** for business logic
3. **Import from index files** when available
4. **Keep components focused** - one responsibility
5. **Type everything** - use TypeScript interfaces

---

**Need help?** Check `COMPONENT_STRUCTURE.md` for detailed component documentation.

