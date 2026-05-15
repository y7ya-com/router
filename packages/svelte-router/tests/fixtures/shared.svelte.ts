import { vi } from 'vitest'
import type { Mock } from 'vitest'

export type SelectFn = ((state: any) => any) & Mock<any>

export const _testState: { select: SelectFn } = {
  select: vi.fn() as SelectFn,
}
