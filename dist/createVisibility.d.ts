import React, { ReactNode, CSSProperties } from 'react';
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
declare const createVisibilitySystem: () => {
    VisibilityProvider: React.FC<VisibilityProviderProps>;
    useVisibility: () => VisibilityContextType;
    createVisibilityBlock: (name: string, defaultVisible?: boolean) => readonly [React.FC<BlockProps>, React.FC<ToggleProps>];
};
declare const VisibilityProvider: React.FC<VisibilityProviderProps>, useVisibility: () => VisibilityContextType, createVisibilityBlock: (name: string, defaultVisible?: boolean) => readonly [React.FC<BlockProps>, React.FC<ToggleProps>];
export { VisibilityProvider, useVisibility, createVisibilityBlock, createVisibilitySystem as createVisibility };
