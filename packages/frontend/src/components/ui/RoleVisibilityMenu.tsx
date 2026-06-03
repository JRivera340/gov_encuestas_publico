import React, { useEffect, useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { surveysApi } from '../../api/surveys.api';
import type { Survey } from '../../types';
import { SURVEY_ROLES } from '../../types';
import { useToast } from './Toast';

interface RoleVisibilityMenuProps {
  survey: Survey;
  onUpdated: (survey: Survey) => void;
}

/**
 * Control de visibilidad por rol de una encuesta. Sustituye al antiguo
 * engranaje de activar/desactivar. Permite decidir qué roles de
 * gov-espacio-publico pueden ver/llenar el formulario.
 *
 * Semántica de `visibleRoles`:
 *  - null  => visible para todos los roles (retrocompatibilidad).
 *  - []    => oculto para todos.
 *  - [..]  => allowlist explícita.
 */
const RoleVisibilityMenu: React.FC<RoleVisibilityMenuProps> = ({ survey, onUpdated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const allRoleValues = SURVEY_ROLES.map((r) => r.value);
  const activeRoles: string[] = survey.visibleRoles == null ? allRoleValues : survey.visibleRoles;
  const isActive = (role: string) => activeRoles.includes(role);

  const persist = async (roles: string[]) => {
    setSaving(true);
    try {
      const updated = await surveysApi.update(survey.id, { visibleRoles: roles });
      onUpdated(updated);
      toast('Visibilidad actualizada', 'success');
    } catch {
      toast('Error actualizando la visibilidad', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    const next = new Set(activeRoles);
    if (next.has(role)) next.delete(role);
    else next.add(role);
    persist(Array.from(next));
  };

  const activateSelected = () => {
    const next = new Set(activeRoles);
    selected.forEach((r) => next.add(r));
    setSelected(new Set());
    persist(Array.from(next));
  };

  const deactivateSelected = () => {
    const next = new Set(activeRoles);
    selected.forEach((r) => next.delete(r));
    setSelected(new Set());
    persist(Array.from(next));
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === allRoleValues.length ? new Set() : new Set(allRoleValues)));
  };

  const toggleChecked = (role: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(role)) s.delete(role);
      else s.add(role);
      return s;
    });
  };

  const hiddenForAll = survey.visibleRoles != null && survey.visibleRoles.length === 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost p-1.5 rounded-lg text-[#8b949e] hover:text-[#e6edf3]"
        title="Ajustar vista (visibilidad por rol)"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-64 rounded-lg border border-[#30363d] bg-[#161b22] shadow-xl p-3 text-left">
          <p className="text-xs font-semibold text-[#e6edf3] mb-2">¿Quién puede ver este formulario?</p>

          <button
            onClick={toggleSelectAll}
            className="text-[11px] text-blue-400 hover:underline mb-2"
          >
            {selected.size === allRoleValues.length ? 'Quitar selección' : 'Seleccionar todos'}
          </button>

          <div className="space-y-1.5">
            {SURVEY_ROLES.map((r) => (
              <div key={r.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.has(r.value)}
                  onChange={() => toggleChecked(r.value)}
                  className="accent-blue-500 cursor-pointer"
                />
                <span className="flex-1 text-xs text-[#c9d1d9]">{r.label}</span>
                <button
                  onClick={() => toggleRole(r.value)}
                  disabled={saving}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                    isActive(r.value)
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'bg-[#30363d] text-[#8b949e] hover:bg-[#3a4350]'
                  }`}
                  title={isActive(r.value) ? 'Clic para desactivar' : 'Clic para activar'}
                >
                  {isActive(r.value) ? 'Visible' : 'Oculto'}
                </button>
              </div>
            ))}
          </div>

          {survey.visibleRoles == null && (
            <p className="text-[10px] text-[#484f58] mt-2">Actualmente visible para todos los roles.</p>
          )}
          {hiddenForAll && (
            <p className="text-[10px] text-amber-400 mt-2">Oculto para todos los gestores.</p>
          )}

          {selected.size > 0 && (
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-[#30363d]">
              <button
                onClick={deactivateSelected}
                disabled={saving}
                className="text-[11px] px-2 py-1 rounded bg-[#30363d] text-[#c9d1d9] hover:bg-[#3a4350]"
              >
                Desactivar sel.
              </button>
              <button
                onClick={activateSelected}
                disabled={saving}
                className="text-[11px] px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
              >
                Activar sel.
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleVisibilityMenu;
