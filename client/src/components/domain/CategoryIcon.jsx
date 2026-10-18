import {
  Briefcase,
  GraduationCap,
  Home,
  Plane,
  RefreshCw,
  Route,
  ShieldCheck,
} from 'lucide-react'

/**
 * Category icon map. `visaCategories[].icon` stores the name as data (the CMS
 * and admin reference it), so this is the single lookup from data to component.
 */
const ICONS = {
  Plane,
  Route,
  Briefcase,
  Home,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
}

export function CategoryIcon({ name, ...props }) {
  const Icon = ICONS[name] ?? Plane
  return <Icon {...props} />
}

export { ICONS as CATEGORY_ICONS }