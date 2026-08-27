/**
 * Resolve a lucide-react icon by name, safely.
 *
 * lucide-react also exports non-renderable helpers/base components (notably the
 * base `Icon`, which does `iconNode.map(...)` and crashes without an `iconNode`
 * prop). Treating those as "no icon" keeps a bad iconName from taking down a page.
 */

import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const NON_ICON_EXPORTS = new Set(['Icon', 'LucideIcon', 'createLucideIcon', 'icons', 'default']);

export function getIconFromName(iconName?: string): LucideIcon {
  if (!iconName || NON_ICON_EXPORTS.has(iconName)) return lucideIcons.FileText;
  const IconComponent = (lucideIcons as unknown as Record<string, LucideIcon>)[iconName];
  return IconComponent || lucideIcons.FileText;
}
