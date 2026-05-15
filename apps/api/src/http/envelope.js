import { API_RESPONSE_STATUS } from '../../../../packages/shared/src/contracts.js'

export const ok = (data, meta) => ({
  status: API_RESPONSE_STATUS.SUCCESS,
  data,
  ...(meta ? { meta } : {})
})

export const fail = ({ kind, reasonCode, message, retryable, details, requestId }) => ({
  status: API_RESPONSE_STATUS.ERROR,
  error: {
    kind,
    reasonCode,
    message,
    retryable: Boolean(retryable),
    ...(details ? { details } : {}),
    ...(requestId ? { requestId } : {})
  }
})
