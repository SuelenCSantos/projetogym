import { useState } from 'react'
import { signInWithEmail, signInWithGoogle, signUpWithEmail, firebaseConfigured } from '../lib/auth'

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'E-mail ou senha incorretos.'
  if (code.includes('email-already-in-use')) return 'Esse e-mail já tem uma conta. Tente entrar.'
  if (code.includes('weak-password')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (code.includes('invalid-email')) return 'E-mail inválido.'
  if (code.includes('popup-closed-by-user')) return ''
  return 'Não foi possível continuar. Tente novamente.'
}

export function AuthGate() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!firebaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-slate-400 text-sm">
          Login ainda não configurado neste app. Fale com quem mantém o projeto.
        </p>
      </div>
    )
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signup') await signUpWithEmail(email, password)
      else await signInWithEmail(email, password)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col justify-center h-full p-6">
      <h1 className="text-2xl font-bold text-center mb-1">ProjetoGym</h1>
      <p className="text-slate-500 text-sm text-center mb-6">
        {mode === 'signin' ? 'Entre para ver perfis, seguir amigos e o feed' : 'Crie sua conta'}
      </p>

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full bg-slate-900 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 outline-none focus:ring-2 ring-cyan-500"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="w-full bg-slate-900 rounded-lg px-3 py-2.5 text-sm placeholder-slate-500 outline-none focus:ring-2 ring-cyan-500"
        />
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-2.5"
        >
          {mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-600">ou</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={busy}
        className="w-full bg-slate-900 disabled:opacity-50 text-slate-100 font-medium rounded-xl py-2.5"
      >
        Continuar com Google
      </button>

      <button
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin')
          setError(null)
        }}
        className="mt-6 text-sm text-slate-400 text-center"
      >
        {mode === 'signin' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
      </button>
    </div>
  )
}
