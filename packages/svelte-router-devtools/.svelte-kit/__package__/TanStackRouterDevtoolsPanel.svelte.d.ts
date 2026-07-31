import type { AnyRouter } from '@tanstack/svelte-router';
type Props = {
    /** Inline styles for the panel */
    style?: any;
    /** Class for the panel */
    className?: string;
    /** Whether the panel is open */
    isOpen?: boolean;
    /** Toggles the open/close state of the panel */
    setIsOpen?: (isOpen: boolean) => void;
    /** Handles dragging the devtools panel */
    handleDragStart?: (e: any) => void;
    /** The router instance to use. Falls back to the router in context. */
    router?: AnyRouter;
    /** Attach the devtools styles to a specific ShadowRoot. */
    shadowDOMTarget?: ShadowRoot;
};
declare const TanStackRouterDevtoolsPanel: import("svelte").Component<Props, {}, "">;
type TanStackRouterDevtoolsPanel = ReturnType<typeof TanStackRouterDevtoolsPanel>;
export default TanStackRouterDevtoolsPanel;
