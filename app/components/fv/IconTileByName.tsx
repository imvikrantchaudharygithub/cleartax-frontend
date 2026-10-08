import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import IconTile, { type IconTileFrameProps } from './IconTile';

interface IconTileByNameProps extends IconTileFrameProps {
  /** DB-driven lucide name; resolved through the blocklist-guarded resolver (FileText fallback). */
  name?: string | null;
}

/**
 * IconTile for DB/admin icon names. Importing this pulls the whole lucide namespace into the
 * bundle, so never import it from Navigation, RequestCallbackModal or anything the site layout
 * renders on every page.
 */
export default function IconTileByName({ name, ...rest }: IconTileByNameProps) {
  return <IconTile icon={getIconFromName(name)} {...rest} />;
}
