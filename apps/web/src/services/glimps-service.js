import { apiClient } from '../api/client.js'
import { toAsyncLoading } from '../api/envelope.js'

const toUiGlimps = (dto = {}) => ({
  glimpsId: dto.glimpsId || '',
  userId: dto.userId || '',
  reflection: dto.reflection || '',
  mood: dto.mood || '',
  prompt: dto.prompt || '',
  imageNote: dto.imageNote || '',
  privacy: dto.privacy || 'private',
  emotionalTone: dto.emotionalTone || 'soft',
  state: dto.state || 'draft',
  createdAt: dto.createdAt || new Date().toISOString(),
  updatedAt: dto.updatedAt || dto.createdAt || new Date().toISOString(),
  archivedAt: dto.archivedAt || null
})

export const createGlimps = async (draft) => {
  const result = await apiClient.call('glimps.create', draft)
  if (result.status !== 'success') return result

  return {
    ...result,
    data: toUiGlimps(result.data)
  }
}

export const listViewerGlimps = async () => {
  const result = await apiClient.call('glimps.viewer.list')
  if (result.status !== 'success') return result

  return {
    ...result,
    data: Array.isArray(result.data) ? result.data.map(toUiGlimps) : []
  }
}

export const getGlimpsLoadingState = (previousData) => toAsyncLoading(previousData)
