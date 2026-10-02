<script lang="ts">
  import { makeNested } from '~/data'
  import type { NestedOuter } from '~/data'

  let { nested }: { nested: NestedOuter } = $props()

  const localData = makeNested()
  const expectedShoutState = localData.inner.shout()
  const expectedWhisperState = localData.whisper()
  const shoutState = $derived(nested.inner.shout())
  const whisperState = $derived(nested.whisper())
</script>

<div data-testid="data-only-container">
  <h2 data-testid="data-only-heading">data-only</h2>
  <div data-testid="shout-container">
    <h3>shout</h3>
    <div>
      expected:
      <div data-testid="shout-expected-state">
        {JSON.stringify(expectedShoutState)}
      </div>
    </div>
    <div>
      actual:
      <div data-testid="shout-actual-state">
        {JSON.stringify(shoutState)}
      </div>
    </div>
  </div>
  <div data-testid="whisper-container">
    <h3>whisper</h3>
    <div>
      expected:
      <div data-testid="whisper-expected-state">
        {JSON.stringify(expectedWhisperState)}
      </div>
    </div>
    <div>
      actual:
      <div data-testid="whisper-actual-state">
        {JSON.stringify(whisperState)}
      </div>
    </div>
  </div>
</div>
