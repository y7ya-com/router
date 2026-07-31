import type { AnyRouter } from '@tanstack/svelte-router';
type Props = {
    /** Set this true if you want the dev tools to default to being open */
    initialIsOpen?: boolean;
    /** Props for the panel (className, style, …) */
    panelProps?: Record<string, any>;
    /** Props for the close button */
    closeButtonProps?: Record<string, any>;
    /** Props for the toggle button */
    toggleButtonProps?: Record<string, any>;
    /** Position of the TanStack Router logo. Defaults to 'bottom-left'. */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    /** Container element type for a11y purposes. Defaults to 'footer'. */
    containerElement?: string | any;
    /** The router instance to use. Falls back to the router in context. */
    router?: AnyRouter;
    /** Attach the devtools styles to a specific ShadowRoot. */
    shadowDOMTarget?: ShadowRoot;
};
declare const TanStackRouterDevtools: import("svelte").Component<Props, {}, "">;
type TanStackRouterDevtools = ReturnType<typeof TanStackRouterDevtools>;
export default TanStackRouterDevtools;
