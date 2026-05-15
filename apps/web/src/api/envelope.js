import { API_STATUS, DOMAIN_ERROR_KIND } from '../domain/contracts.js'

export const createSuccess = (data, meta = {}) => ({
  ok: true,
  status: API_STATUS.SUCCESS,
  data,
  meta
})

export const createFailure = ({
  code,
  message,
  category = DOMAIN_ERROR_KIND.UNKNOWN,
  retryable = false,
  fieldErrors,
  details,
  requestId
}) => ({
  ok: false,
  status: API_STATUS.ERROR,
  error: { code, message, category, retryable, fieldErrors, details, requestId }
})

export const toAsyncSuccess = (envelope) => ({ status: 'success', data: envelope.data })
export const toAsyncError = (envelope) => ({ status: 'error', error: envelope.error })
export const toAsyncLoading = (previousData) => previousData ? { status: 'loading', previousData } : { status: 'loading' }
