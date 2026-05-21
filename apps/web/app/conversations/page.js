import Link from 'next/link'
import PageIntro from '../../components/ui/PageIntro'
export default function Page(){return <PageIntro eyebrow='Conversations' title='Speak with presence' description='Normal-first chat with optional apps and emotional safety.'><div className='conversation-empty'><h3>No active conversations yet</h3><p>When a Spark is accepted, conversations will appear here.</p><ul><li>Optional chat apps stay secondary.</li><li>No urgency mechanics.</li></ul></div><p><Link href='/conversations/demo'>Open conversation shell preview</Link></p></PageIntro>}
