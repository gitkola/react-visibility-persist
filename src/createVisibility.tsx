import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  memo,
  ReactNode,
  CSSProperties,
  FC,
  useEffect
} from 'react';

// Types for the visibility system
type VisibilityState = Record<string, boolean>;
type ToggleFunction = (name: string) => void;

interface VisibilityContextType {
  visibilityState: VisibilityState;
  toggleVisibility: ToggleFunction;
}

interface VisibilityProviderProps {
  children: ReactNode;
  initialState?: VisibilityState;
  persistKey?: string | null;
}

interface BlockProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

interface ToggleProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  activeStyle?: CSSProperties;
  activeClassName?: string;
  inactiveStyle?: CSSProperties;
  inactiveClassName?: string;
}

// Create the visibility system factory
const createVisibilitySystem = () => {
  // Create context
  const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

  // Custom hook for using localStorage persistence
  const usePersistentState = <T,>(key: string | null, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
      if (!key) return initialValue;

      try {
        const persistedValue = localStorage.getItem(key);
        return persistedValue !== null ? JSON.parse(persistedValue) : initialValue;
      } catch (error) {
        console.error(`Error retrieving ${key} from localStorage:`, error);
        return initialValue;
      }
    });

    useEffect(() => {
      if (!key) return;

      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }, [key, state]);

    return [state, setState];
  };

  // Keep track of registered blocks for initialization
  const registeredBlocks: Record<string, boolean> = {};

  // Provider component
  const VisibilityProvider: FC<VisibilityProviderProps> = ({
    children,
    initialState = {},
    persistKey = null
  }) => {
    // Merge provided initial state with registered blocks
    const mergedInitialState = {
      ...registeredBlocks,
      ...initialState
    };

    const [visibilityState, setVisibilityState] = usePersistentState<VisibilityState>(
      persistKey,
      mergedInitialState
    );

    const toggleVisibility = useCallback((name: string) => {
      setVisibilityState(prevState => ({
        ...prevState,
        [name]: !prevState[name]
      }));
    }, [setVisibilityState]);

    return (
      <VisibilityContext.Provider value={{ visibilityState, toggleVisibility }}>
        {children}
      </VisibilityContext.Provider>
    );
  };

  // Hook for consuming visibility context
  const useVisibility = () => {
    const context = useContext(VisibilityContext);
    if (context === undefined) {
      throw new Error('useVisibility must be used within a VisibilityProvider');
    }
    return context;
  };

  // Factory function to create a pair of components for a specific named block
  const createVisibilityBlock = (name: string, defaultVisible: boolean = true) => {
    // Register this block for initial state
    registeredBlocks[name] = defaultVisible;

    // Create the block component that respects visibility
    const NamedBlock: FC<BlockProps> = memo(({ children, style, className }) => {
      // Custom hook to selectively consume only this block's visibility
      const useBlockVisibility = () => {
        const { visibilityState } = useVisibility();
        return visibilityState[name] ?? defaultVisible;
      };

      // Use the selective hook
      const isVisible = useBlockVisibility();

      if (!isVisible) return null;

      return (
        <div
          style={{ position: 'relative', ...style }}
          className={className}
          data-visibility-name={name}
        >
          {children}
        </div>
      );
    });

    NamedBlock.displayName = `VisibilityBlock(${name})`;

    // Create the toggle component for this block
    const NamedBlockToggle: FC<ToggleProps> = memo(({
      children,
      style,
      className,
      activeStyle,
      activeClassName,
      inactiveStyle,
      inactiveClassName
    }) => {
      // Custom hook to selectively consume only what this toggle needs
      const useToggleState = () => {
        const { visibilityState, toggleVisibility } = useVisibility();
        const isVisible = visibilityState[name] ?? defaultVisible;
        const toggle = useCallback(() => toggleVisibility(name), [toggleVisibility]);
        return { isVisible, toggle };
      };

      // Use the selective hook
      const { isVisible, toggle } = useToggleState();

      // Determine styles based on visibility state
      const computedStyle = {
        ...style,
        ...(isVisible ? activeStyle : inactiveStyle)
      };

      // Determine class names based on visibility state
      const computedClassName = [
        className,
        isVisible ? activeClassName : inactiveClassName
      ].filter(Boolean).join(' ');

      return (
        <button
          onClick={toggle}
          style={computedStyle}
          className={computedClassName || undefined}
          data-visibility-toggle={name}
          data-state={isVisible ? 'visible' : 'hidden'}
        >
          {children}
        </button>
      );
    });

    NamedBlockToggle.displayName = `VisibilityToggle(${name})`;

    return [NamedBlock, NamedBlockToggle] as const;
  };

  return {
    VisibilityProvider,
    useVisibility,
    createVisibilityBlock
  };
};

// Create a default instance
const {
  VisibilityProvider,
  useVisibility,
  createVisibilityBlock
} = createVisibilitySystem();

// Export the default instance and the factory
export {
  VisibilityProvider,
  useVisibility,
  createVisibilityBlock,
  createVisibilitySystem as createVisibility
};
