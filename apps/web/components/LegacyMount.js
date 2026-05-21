'use client'
import { useEffect, useRef } from 'react'

export default function LegacyMount({ loadBuild }) {
  const ref = useRef(null)
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const build = await loadBuild()
      const host = ref.current
      if (!mounted || !host) return
      host.innerHTML = ''
      host.append(build())
    })()
    return () => { mounted = false }
  }, [loadBuild])
  return <div ref={ref} />
}
