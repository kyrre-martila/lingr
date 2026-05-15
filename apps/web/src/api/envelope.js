import { API_RESPONSE_STATUS, DOMAIN_ERROR_KIND, ERROR_RETRYABILITY } from '../domain/contracts.js'

export const createSuccess = (data, meta = {}) => ({
  ok: true,
  status: API_RESPONSE_STATUS.SUCCESS,
  data,
  meta
})

export const createFailure = ({
  code,
  message,
  kind = DOMAIN_ERROR_KIND.DOMAIN,
  retryable,
  fieldErrors,
  details,
  requestId
}) => ({
  ok: false,
  status: API_RESPONSE_STATUS.ERROR,
  error: { reasonCode: code, message, kind, retryable: retryable ?? ERROR_RETRYABILITY[kind] ?? false, fieldErrors, details, requestId }
})

export const toAsyncSuccess = (envelope) => ({ status: 'success', data: envelope.data })
export const toAsyncError = (envelope) => ({ status: 'error', error: envelope.error })
export const toAsyncLoading = (previousData) => previousData ? { status: 'loading', previousData } : { status: 'loading' }
