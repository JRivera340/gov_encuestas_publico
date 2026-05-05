import React from 'react';
import type { Category } from '../../types';
import { CATEGORY_COLORS, CATEGORY_DISPLAY_NAMES } from '../../types';
import { ChevronRight, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();
  const colors = CATEGORY_COLORS[category.name] ?? {
    bg: 'from-gray-500/20 to-gray-600/10',
    accent: 'bg-gray-500',
    text: 'text-gray-400',
  };
  const displayName = CATEGORY_DISPLAY_NAMES[category.name] ?? category.name;

  return (
    <div
      className={`card card-hover cursor-pointer bg-gradient-to-br ${colors.bg} border-[#30363d] group`}
      onClick={() =>
        navigate(`/surveys?categoryId=${category.id}&categoryName=${category.name}`)
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl ${colors.accent} flex items-center justify-center shadow-lg`}>
          <Layers className="h-5 w-5 text-white" />
        </div>
        <ChevronRight
          className={`h-4 w-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1`}
        />
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
          {category.subcategories?.map((sub) => (
            <span
              key={sub.id}
              className="rounded-md border border-[#30363d] bg-[#0d1117]/40 px-2 py-0.5 text-[11px] text-[#8b949e]"
            >
              {sub.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
