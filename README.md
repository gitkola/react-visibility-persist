# react-visibility-persist

A flexible visibility management system for React components with persistence support. This library provides a simple way to manage the visibility state of components with optional local storage persistence.

## Installation

```bash
npm install react-visibility-persist
# or
yarn add react-visibility-persist
```

## Features

- 🎯 Simple API for managing component visibility
- 💾 Optional persistence to localStorage
- 🔄 Automatic state synchronization
- 🎨 Flexible styling options for visible/hidden states
- 📦 Lightweight and zero dependencies
- 📝 Written in TypeScript with full type support

## Usage

```tsx
import { VisibilityProvider, createVisibilityBlock } from 'react-visibility-persist';

// Create a visibility block with its toggle
const [SidebarBlock, SidebarToggle] = createVisibilityBlock('sidebar', true);

// Use in your app
const App = () => {
  return (
    <VisibilityProvider persistKey="app-visibility">
      <div className="app">
        <SidebarToggle>Toggle Sidebar</SidebarToggle>
        <SidebarBlock>
          {/* Your sidebar content */}
        </SidebarBlock>
      </div>
    </VisibilityProvider>
  );
};
```

## API

### VisibilityProvider

Props:
- `children`: ReactNode
- `initialState?`: Record<string, boolean>
- `persistKey?`: string | null

### createVisibilityBlock(name: string, defaultVisible: boolean = true)

Creates a pair of components for managing visibility:
- A Block component that shows/hides content
- A Toggle component that controls the visibility

Block Props:
- `children?`: ReactNode
- `style?`: CSSProperties
- `className?`: string

Toggle Props:
- `children?`: ReactNode
- `style?`: CSSProperties
- `className?`: string
- `activeStyle?`: CSSProperties
- `activeClassName?`: string
- `inactiveStyle?`: CSSProperties
- `inactiveClassName?`: string

### useVisibility()

A hook that provides access to the visibility context. Returns:
- `visibilityState`: Record<string, boolean>
- `toggleVisibility`: (name: string) => void

### Advanced Usage: Multiple Instances

If you need multiple independent visibility systems, you can use the `createVisibility` factory:

```tsx
import { createVisibility } from 'react-visibility-persist';

const {
  VisibilityProvider: CustomProvider,
  createVisibilityBlock: customCreateBlock
} = createVisibility();
```

## License

MIT
