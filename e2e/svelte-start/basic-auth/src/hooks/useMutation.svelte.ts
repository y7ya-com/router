export function useMutation<TVariables, TData, TError = Error>(opts: {
  fn: (variables: TVariables) => Promise<TData>
  onSuccess?: (ctx: { data: TData }) => void | Promise<void>
}) {
  let submittedAt = $state<number | undefined>(undefined)
  let variables = $state.raw<TVariables | undefined>(undefined)
  let error = $state.raw<TError | undefined>(undefined)
  let data = $state.raw<TData | undefined>(undefined)
  let status = $state<'idle' | 'pending' | 'success' | 'error'>('idle')

  const mutate = async (
    variablesInput: TVariables,
  ): Promise<TData | undefined> => {
    status = 'pending'
    submittedAt = Date.now()
    variables = variablesInput
    try {
      const result = await opts.fn(variablesInput)
      await opts.onSuccess?.({ data: result })
      status = 'success'
      error = undefined
      data = result
      return result
    } catch (err) {
      status = 'error'
      error = err as TError
    }
  }

  return {
    get status() {
      return status
    },
    get variables() {
      return variables
    },
    get submittedAt() {
      return submittedAt
    },
    mutate,
    get error() {
      return error
    },
    get data() {
      return data
    },
  }
}
