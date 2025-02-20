import React, { createContext, useCallback, useContext, memo, useState, useEffect } from 'react';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// Create the visibility system factory
var createVisibilitySystem = function () {
    // Create context
    var VisibilityContext = createContext(undefined);
    // Custom hook for using localStorage persistence
    var usePersistentState = function (key, initialValue) {
        var _a = useState(function () {
            if (!key)
                return initialValue;
            try {
                var persistedValue = localStorage.getItem(key);
                return persistedValue !== null ? JSON.parse(persistedValue) : initialValue;
            }
            catch (error) {
                console.error("Error retrieving ".concat(key, " from localStorage:"), error);
                return initialValue;
            }
        }), state = _a[0], setState = _a[1];
        useEffect(function () {
            if (!key)
                return;
            try {
                localStorage.setItem(key, JSON.stringify(state));
            }
            catch (error) {
                console.error("Error saving ".concat(key, " to localStorage:"), error);
            }
        }, [key, state]);
        return [state, setState];
    };
    // Keep track of registered blocks for initialization
    var registeredBlocks = {};
    // Provider component
    var VisibilityProvider = function (_a) {
        var children = _a.children, _b = _a.initialState, initialState = _b === void 0 ? {} : _b, _c = _a.persistKey, persistKey = _c === void 0 ? null : _c;
        // Merge provided initial state with registered blocks
        var mergedInitialState = __assign(__assign({}, registeredBlocks), initialState);
        var _d = usePersistentState(persistKey, mergedInitialState), visibilityState = _d[0], setVisibilityState = _d[1];
        var toggleVisibility = useCallback(function (name) {
            setVisibilityState(function (prevState) {
                var _a;
                return (__assign(__assign({}, prevState), (_a = {}, _a[name] = !prevState[name], _a)));
            });
        }, [setVisibilityState]);
        return (React.createElement(VisibilityContext.Provider, { value: { visibilityState: visibilityState, toggleVisibility: toggleVisibility } }, children));
    };
    // Hook for consuming visibility context
    var useVisibility = function () {
        var context = useContext(VisibilityContext);
        if (context === undefined) {
            throw new Error('useVisibility must be used within a VisibilityProvider');
        }
        return context;
    };
    // Factory function to create a pair of components for a specific named block
    var createVisibilityBlock = function (name, defaultVisible) {
        if (defaultVisible === void 0) { defaultVisible = true; }
        // Register this block for initial state
        registeredBlocks[name] = defaultVisible;
        // Create the block component that respects visibility
        var NamedBlock = memo(function (_a) {
            var children = _a.children, style = _a.style, className = _a.className;
            // Custom hook to selectively consume only this block's visibility
            var useBlockVisibility = function () {
                var _a;
                var visibilityState = useVisibility().visibilityState;
                return (_a = visibilityState[name]) !== null && _a !== void 0 ? _a : defaultVisible;
            };
            // Use the selective hook
            var isVisible = useBlockVisibility();
            if (!isVisible)
                return null;
            return (React.createElement("div", { style: __assign({ position: 'relative' }, style), className: className, "data-visibility-name": name }, children));
        });
        NamedBlock.displayName = "VisibilityBlock(".concat(name, ")");
        // Create the toggle component for this block
        var NamedBlockToggle = memo(function (_a) {
            var children = _a.children, style = _a.style, className = _a.className, activeStyle = _a.activeStyle, activeClassName = _a.activeClassName, inactiveStyle = _a.inactiveStyle, inactiveClassName = _a.inactiveClassName;
            // Custom hook to selectively consume only what this toggle needs
            var useToggleState = function () {
                var _a;
                var _b = useVisibility(), visibilityState = _b.visibilityState, toggleVisibility = _b.toggleVisibility;
                var isVisible = (_a = visibilityState[name]) !== null && _a !== void 0 ? _a : defaultVisible;
                var toggle = useCallback(function () { return toggleVisibility(name); }, [toggleVisibility]);
                return { isVisible: isVisible, toggle: toggle };
            };
            // Use the selective hook
            var _b = useToggleState(), isVisible = _b.isVisible, toggle = _b.toggle;
            // Determine styles based on visibility state
            var computedStyle = __assign(__assign({}, style), (isVisible ? activeStyle : inactiveStyle));
            // Determine class names based on visibility state
            var computedClassName = [
                className,
                isVisible ? activeClassName : inactiveClassName
            ].filter(Boolean).join(' ');
            return (React.createElement("button", { onClick: toggle, style: computedStyle, className: computedClassName || undefined, "data-visibility-toggle": name, "data-state": isVisible ? 'visible' : 'hidden' }, children));
        });
        NamedBlockToggle.displayName = "VisibilityToggle(".concat(name, ")");
        return [NamedBlock, NamedBlockToggle];
    };
    return {
        VisibilityProvider: VisibilityProvider,
        useVisibility: useVisibility,
        createVisibilityBlock: createVisibilityBlock
    };
};
// Create a default instance
var _a = createVisibilitySystem(), VisibilityProvider = _a.VisibilityProvider, useVisibility = _a.useVisibility, createVisibilityBlock = _a.createVisibilityBlock;

export { VisibilityProvider, createVisibilitySystem as createVisibility, createVisibilityBlock, useVisibility };
//# sourceMappingURL=index.esm.js.map
