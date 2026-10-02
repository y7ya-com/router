import { createServerFn } from '@tanstack/svelte-start'

export const testValues = {
  name: 'Sean',
  age: 25,
  pet1: 'dog',
  pet2: 'cat',
  __adder: 1,
}

export const greetUser = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid! FormData is required')
    }
    const name = data.get('name')
    const age = data.get('age')
    const pets = data.getAll('pet')

    if (!name || !age || pets.length === 0) {
      throw new Error('Name, age and pets are required')
    }

    return {
      name: name.toString(),
      age: parseInt(age.toString(), 10),
      pets: pets.map((pet) => pet.toString()),
    }
  })
  .handler(({ data: { name, age, pets } }) => {
    return `Hello, ${name}! You are ${age + testValues.__adder} years old, and your favorite pets are ${pets.join(',')}.`
  })
