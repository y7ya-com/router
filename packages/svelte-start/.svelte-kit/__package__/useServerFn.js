import { isRedirect, useRouter } from '@tanstack/svelte-router';
export function useServerFn(serverFn) {
    const router = useRouter();
    return (async (...args) => {
        try {
            const res = await serverFn(...args);
            if (isRedirect(res)) {
                throw res;
            }
            return res;
        }
        catch (err) {
            if (isRedirect(err)) {
                err.options._fromLocation = router.stores.location.get();
                return router.navigate(router.resolveRedirect(err).options);
            }
            throw err;
        }
    });
}
