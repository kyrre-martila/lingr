export const viewerMeta = (viewer) => ({
  viewer: {
    authState: viewer?.authState || 'anonymous',
    lifecycleState: viewer?.lifecycleState || 'onboarding'
  }
})
