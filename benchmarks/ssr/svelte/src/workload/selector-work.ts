export const probes = Array.from({ length: 10 }, (_, index) => index)

export function runSelectorWork(input: string, salt: number) {
  let value = salt

  for (let index = 0; index < input.length; index++) {
    value = (value * 33 + input.charCodeAt(index) + index) >>> 0
  }

  for (let index = 0; index < 16; index++) {
    value = (value ^ (value << 13)) >>> 0
    value = (value ^ (value >> 17)) >>> 0
    value = (value ^ (value << 5)) >>> 0
  }

  return value
}
