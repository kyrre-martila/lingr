import Link from 'next/link'
import PageIntro from '../../components/ui/PageIntro'
export default function LoginPage(){return <PageIntro eyebrow='Welcome back' title='Login' description='Use your Lingr account to continue at your own pace.'><form className='onboarding-card flow'><input className='onboarding-input' placeholder='Email' /><input className='onboarding-input' placeholder='Password' type='password' /><button className='button' type='button'>Sign in</button></form><p><Link href='/onboarding'>Need an account? Start onboarding.</Link></p></PageIntro>}
