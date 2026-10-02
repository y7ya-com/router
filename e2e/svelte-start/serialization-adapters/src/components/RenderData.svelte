<script lang="ts">
  import { makeData } from '~/data'

  let { id, data }: { id: string; data: ReturnType<typeof makeData> } = $props()

  const localData = makeData()
</script>

<div data-testid={`${id}-container`}>
  <h3>Car</h3>
  <h4>expected</h4>
  <div data-testid={`${id}-car-expected`}>
    {JSON.stringify({
      make: localData.car.singleInstance.make,
      model: localData.car.singleInstance.model,
      year: localData.car.singleInstance.year,
    })}
  </div>
  <h4>actual</h4>
  <div data-testid={`${id}-car-actual`}>
    {JSON.stringify({
      make: data.car.singleInstance.make,
      model: data.car.singleInstance.model,
      year: data.car.singleInstance.year,
    })}
  </div>
  <b>Foo</b>
  <div data-testid={`${id}-foo`}>
    {JSON.stringify({
      value: data.foo.singleInstance.value,
    })}
  </div>
</div>
