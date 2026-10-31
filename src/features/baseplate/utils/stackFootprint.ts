import type { ResolvedBaseplateParams } from '@/shared/types/bin';
import { TONGUE_PROTRUSION } from '@/shared/constants/connectors';
import type { PlateFlipAxis } from './stackPrint';

export interface Footprint {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/** Shaped outlines and fractional cells need a separate geometric support check. */
export function canMixPiece(params: ResolvedBaseplateParams): boolean {
  return (
    Number.isInteger(params.width) &&
    Number.isInteger(params.depth) &&
    params.width > 0 &&
    params.depth > 0 &&
    !params.outline &&
    !params.outlineOverhang &&
    Number.isFinite(params.paddingLeft) &&
    Number.isFinite(params.paddingRight) &&
    Number.isFinite(params.paddingFront) &&
    Number.isFinite(params.paddingBack)
  );
}

/** Conservative outer bounds around the grid, margins and any seam tongue. */
export function pieceFootprint(params: ResolvedBaseplateParams): Footprint {
  const x = (params.width * params.gridUnitMm) / 2;
  const y = (params.depth * (params.gridUnitMmY ?? params.gridUnitMm)) / 2;
  const integralTongue =
    params.connectorNubs &&
    (params.connectorStyle === undefined ||
      params.connectorStyle === 'dovetail' ||
      params.connectorStyle === 'puzzle');
  const seam = (edge: keyof NonNullable<ResolvedBaseplateParams['edges']>): number => {
    if (!integralTongue || params.edges?.[edge] !== 'join') return 0;
    const startSide = edge === 'left' || edge === 'front';
    return params.preferIdenticalPieces || startSide !== !!params.invertDovetails
      ? TONGUE_PROTRUSION
      : 0;
  };
  return {
    minX: -x - params.paddingLeft - seam('left'),
    maxX: x + params.paddingRight + seam('right'),
    minY: -y - params.paddingFront - seam('front'),
    maxY: y + params.paddingBack + seam('back'),
  };
}

export function printedFootprint(
  footprint: Footprint,
  rotationDeg: 0 | 90 | 180 | 270,
  flipAxis?: PlateFlipAxis
): Footprint {
  let b = footprint;
  for (let angle = 0; angle < rotationDeg; angle += 90) {
    b = { minX: -b.maxY, maxX: -b.minY, minY: b.minX, maxY: b.maxX };
  }
  if (flipAxis === 'x') b = { ...b, minY: -b.maxY, maxY: -b.minY };
  if (flipAxis === 'y') b = { ...b, minX: -b.maxX, maxX: -b.minX };
  return b;
}

export function footprintFits(upper: Footprint, lower: Footprint, dx: number, dy: number): boolean {
  // A 1.5mm integral tongue may extend past a female seam beneath it. This
  // short overhang is printable; larger padding or slab overhangs still split.
  const tolerance = TONGUE_PROTRUSION + 1e-6;
  return (
    upper.minX + dx >= lower.minX - tolerance &&
    upper.maxX + dx <= lower.maxX + tolerance &&
    upper.minY + dy >= lower.minY - tolerance &&
    upper.maxY + dy <= lower.maxY + tolerance
  );
}
