import { useState } from 'react'
import type { User } from 'firebase/auth'
import { claimUsername, validateUsername } from '../lib/auth'

interface Props {
  user: User
  onDone: () => Promise<void>
}

export function OnboardingUsername({ user, onDone }: Props) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const invalid = validateUsername(username.toLowerCase())
    if (invalid) {
      setError(invalid)
      return
    }
    setError(null)
    setBusy(true)
    try {
      await claimUsername(user.uid, username, user.displayName || username)
      await onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o perfil.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col justify-center h-full p-6">
      <h1 className="text-xl font-bold text-center mb-1">Escolha seu nome de usuário</h1>
      <p className="text-slate-500 text-sm text-center mb-6">
        É como seus amigos vão te encontrar. Não dá pra mudar depois de escolher.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center bg-slate-900 rounded-lg px-3 focus-within:ring-2 ring-cyan-500">
          <span className="text-slate-500">@</span>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="seu_usuario"
            className="w-full bg-transparent px-1.5 py-2.5 text-sm outline-none"
          />
        </div>
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy || username.length < 3}
          className="w-full bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-2.5"
        >
          Continuar
        </button>
      </form>
    </div>
  )
}
