import type { AnyRouter } from '@tanstack/router-core';
declare function $$render<TRouter extends AnyRouter>(): {
    props: {
        router: TRouter;
    };
    exports: {};
    bindings: "";
    slots: {};
    events: {};
};
declare class __sveltets_Render<TRouter extends AnyRouter> {
    props(): ReturnType<typeof $$render<TRouter>>['props'];
    events(): ReturnType<typeof $$render<TRouter>>['events'];
    slots(): ReturnType<typeof $$render<TRouter>>['slots'];
    bindings(): "";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <TRouter extends AnyRouter>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<TRouter>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<TRouter>['props']>, ReturnType<__sveltets_Render<TRouter>['events']>, ReturnType<__sveltets_Render<TRouter>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<TRouter>['bindings']>;
    } & ReturnType<__sveltets_Render<TRouter>['exports']>;
    <TRouter extends AnyRouter>(internal: unknown, props: ReturnType<__sveltets_Render<TRouter>['props']> & {}): ReturnType<__sveltets_Render<TRouter>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const StartServer: $$IsomorphicComponent;
type StartServer<TRouter extends AnyRouter> = InstanceType<typeof StartServer<TRouter>>;
export default StartServer;
