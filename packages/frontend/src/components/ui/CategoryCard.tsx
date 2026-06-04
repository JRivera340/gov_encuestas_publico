import React, { useState } from 'react';
import type { Category, Subcategory } from '../../types';
import { CATEGORY_COLORS, CATEGORY_DISPLAY_NAMES } from '../../types';
import { ChevronRight, Layers, Plus, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subcategoriesApi } from '../../api/subcategories.api';
import { categoriesApi } from '../../api/categories.api';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import RoleVisibilityMenu from './RoleVisibilityMenu';

interface CategoryCardProps {
  category: Category;
  onUpdate?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Editar categoría (solo nombre visible — el name/contrato no se toca)
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', description: '' });

  // Editar subcategoría
  const [subEdit, setSubEdit] = useState<Subcategory | null>(null);
  const [subForm, setSubForm] = useState({ displayName: '', description: '' });

  const colors = CATEGORY_COLORS[category.name] ?? {
    bg: 'from-gray-500/20 to-gray-600/10',
    accent: 'bg-gray-500',
    text: 'text-gray-400',
  };
  const displayName = category.displayName ?? CATEGORY_DISPLAY_NAMES[category.name] ?? category.name;

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name.trim()) return;

    setSaving(true);
    try {
      await subcategoriesApi.create({
        ...newSub,
        categoryId: category.id,
      });
      toast('Subcategoría añadida', 'success');
      setModalOpen(false);
      setNewSub({ name: '', description: '' });
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast(err.message || 'Error al crear subcategoría', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditCategory = () => {
    setEditForm({ displayName: category.displayName ?? '', description: category.description ?? '' });
    setEditOpen(true);
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.displayName.trim()) return;
    setSaving(true);
    try {
      await categoriesApi.update(category.id, {
        displayName: editForm.displayName.trim(),
        description: editForm.description,
      } as any);
      toast('Categoría actualizada', 'success');
      setEditOpen(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast(err.message || 'Error al actualizar categoría', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditSub = (sub: Subcategory) => {
    setSubEdit(sub);
    setSubForm({ displayName: sub.displayName ?? '', description: sub.description ?? '' });
  };

  const handleEditSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEdit || !subForm.displayName.trim()) return;
    setSaving(true);
    try {
      await subcategoriesApi.update(subEdit.id, {
        displayName: subForm.displayName.trim(),
        description: subForm.description,
      } as any);
      toast('Subcategoría actualizada', 'success');
      setSubEdit(null);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast(err.message || 'Error al actualizar subcategoría', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className={`card card-hover cursor-pointer bg-gradient-to-br ${colors.bg} border-[#30363d] group relative`}
        onClick={() =>
          navigate(`/surveys?categoryId=${category.id}&categoryName=${category.name}`)
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`h-10 w-10 rounded-xl ${colors.accent} flex items-center justify-center shadow-lg`}>
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <RoleVisibilityMenu
              visibleRoles={category.visibleRoles}
              onPersist={async (roles) => {
                await categoriesApi.update(category.id, { visibleRoles: roles } as any);
                if (onUpdate) onUpdate();
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditCategory();
              }}
              className="p-1.5 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors"
              title="Renombrar categoría"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] border border-[#30363d] transition-colors"
              title="Añadir subcategoría"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <ChevronRight
              className={`h-4 w-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1`}
            />
          </div>
        </div>

        {/* Content */}
        <h3 className="font-bold text-[#e6edf3] text-base mb-1">{displayName}</h3>
        <p className="text-xs text-[#8b949e] mb-4 line-clamp-2">{category.description}</p>

        {/* Subcategories */}
        <div className="space-y-1.5">
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
            {category.subcategories?.length ?? 0} subcategorías
          </p>
          <div className="flex flex-wrap gap-1.5">
            {category.subcategories?.length === 0 ? (
              <span className="text-[10px] text-[#484f58] italic">Sin subcategorías</span>
            ) : (
              category.subcategories?.map((sub) => (
                <span
                  key={sub.id}
                  className="group/sub inline-flex items-center gap-1 rounded-md border border-[#30363d] bg-[#0d1117]/40 px-2 py-0.5 text-[11px] text-[#8b949e]"
                >
                  {sub.displayName ?? sub.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditSub(sub);
                    }}
                    className="opacity-0 group-hover/sub:opacity-100 text-[#8b949e] hover:text-[#e6edf3] transition-opacity"
                    title="Renombrar subcategoría"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Nueva Subcategoría */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Nueva subcategoría para ${displayName}`}
      >
        <form onSubmit={handleAddSubcategory} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Nombre
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: Salud Mental, Residuos Hospitalarios..."
              value={newSub.name}
              onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Descripción (Opcional)
            </label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Descripción de la subcategoría"
              value={newSub.description}
              onChange={(e) => setNewSub({ ...newSub, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn-primary px-6" disabled={saving}>
              {saving ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Categoría */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Renombrar categoría">
        <form onSubmit={handleEditCategory} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Nombre visible
            </label>
            <input
              type="text"
              className="input-field"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              required
              autoFocus
            />
            <p className="text-[11px] text-[#8b949e] mt-1">
              Clave interna: <span className="font-mono text-[#c9d1d9]">{category.name}</span> (no cambia)
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Descripción (Opcional)
            </label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditOpen(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn-primary px-6" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Subcategoría */}
      <Modal open={!!subEdit} onClose={() => setSubEdit(null)} title="Renombrar subcategoría">
        <form onSubmit={handleEditSub} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Nombre visible
            </label>
            <input
              type="text"
              className="input-field"
              value={subForm.displayName}
              onChange={(e) => setSubForm({ ...subForm, displayName: e.target.value })}
              required
              autoFocus
            />
            <p className="text-[11px] text-[#8b949e] mt-1">
              Clave interna: <span className="font-mono text-[#c9d1d9]">{subEdit?.name}</span> (no cambia)
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-1.5 block">
              Descripción (Opcional)
            </label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={subForm.description}
              onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setSubEdit(null)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn-primary px-6" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CategoryCard;
