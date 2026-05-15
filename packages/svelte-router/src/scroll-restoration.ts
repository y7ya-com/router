/**
 * v1 stub for useElementScrollRestoration. Returns undefined and a no-op setter.
 * TODO(svelte-port): full implementation pairing with router-core's setupScrollRestoration.
 */
export function useElementScrollRestoration(
  _opts: { id: string; getKey?: (location: any) => string },
): { current: number | undefined } {
  return { current: undefined }
}
