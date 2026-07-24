import { useState } from 'react'
import type { UserProfile } from '../types'
import { updateProfileFields } from '../lib/auth'
import { Toggle } from './Toggle'

interface Props {
  profile: UserProfile
  onSaved: () => Promise<void>
  onClose: () => void
}

export function EditProfileModal({ profile, onSaved, onClose }: Props) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [isPrivate, setIsPrivate] = useState(profile.isPrivate)
  const [allowInteractions, setAllowInteractions] = useState(profile.allowInteractions ?? true)
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    setBusy(true)
    try {
      await updateProfileFields(profile.uid, {
        displayName: displayName.trim() || profile.username,
        isPrivate,
        allowInteractions,
      })
      await onSaved()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="font-semibold">Editar perfil</h2>
        <button onClick={onClose} className="text-slate-400 text-sm">
          Fechar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <label className="block">
          <span className="text-xs text-slate-500">Nome de exibição</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full bg-slate-900 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 ring-cyan-500"
          />
        </label>

        <Toggle
          checked={isPrivate}
          onChange={setIsPrivate}
          label="Conta privada"
          description="Só quem você aceitar vê seus posts e sequência de treino"
        />

        <Toggle
          checked={allowInteractions}
          onChange={setAllowInteractions}
          label="Permitir reações e comentários"
          description="Deixa quem vê seus posts curtir e comentar"
        />
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleSave}
          disabled={busy}
          className="w-full bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold rounded-xl py-3"
        >
          Salvar
        </button>
      </div>
    </div>
  )
}
