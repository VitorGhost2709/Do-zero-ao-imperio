import { PARTNER_NAMES } from '../data/partnerNames';
import type { RelationshipStatus, TimeState } from '../types/game';

export function pickRandomPartnerName(exclude?: string): string {
  const pool = exclude
    ? PARTNER_NAMES.filter((n) => n !== exclude)
    : [...PARTNER_NAMES];
  return pool[Math.floor(Math.random() * pool.length)] ?? 'Clara';
}

export function getRelationshipDisplayLabel(
  status: RelationshipStatus,
  partnerName?: string,
): string {
  switch (status) {
    case 'single':
      return 'Solteiro';
    case 'dating':
      return partnerName ? `Namorando com ${partnerName}` : 'Namorando';
    case 'married':
      return partnerName ? `Casado com ${partnerName}` : 'Casado';
    case 'separated':
      return partnerName
        ? `Separado de ${partnerName}`
        : 'Separado';
    default:
      return 'Solteiro';
  }
}

export function personalizeText(text: string, partnerName?: string): string {
  const label = partnerName?.trim() || 'seu parceiro';
  return text
    .replace(/\{partner\}/gi, label)
    .replace(/Seu parceiro/gi, label)
    .replace(/seu parceiro/gi, label);
}

export function monthsInRelationship(
  startedAt: TimeState | undefined,
  current: TimeState,
): number {
  if (!startedAt) return 0;
  return (
    (current.age - startedAt.age) * 12 + (current.month - startedAt.month)
  );
}

export interface PartnerTransitionResult {
  partnerName?: string;
  exPartnerName?: string;
  relationshipStartedAt?: TimeState;
}

export function applyPartnerStatusChange(
  prevStatus: RelationshipStatus,
  newStatus: RelationshipStatus,
  partnerName: string | undefined,
  exPartnerName: string | undefined,
  time: TimeState,
  relationshipStartedAt?: TimeState,
): PartnerTransitionResult {
  let nextPartner = partnerName;
  let nextEx = exPartnerName;
  let started = relationshipStartedAt;

  if (newStatus === 'dating' && prevStatus === 'single') {
    nextPartner = nextPartner ?? pickRandomPartnerName(nextEx);
    started = time;
    nextEx = undefined;
  }

  if (newStatus === 'married' && (prevStatus === 'dating' || prevStatus === 'single')) {
    if (!nextPartner) nextPartner = pickRandomPartnerName(nextEx);
    if (!started) started = time;
  }

  if (newStatus === 'separated' || newStatus === 'single') {
    if (
      (prevStatus === 'dating' || prevStatus === 'married') &&
      nextPartner
    ) {
      nextEx = nextPartner;
    }
    if (newStatus === 'single') {
      nextPartner = undefined;
      started = undefined;
    }
  }

  if (newStatus === 'dating' && prevStatus === 'separated' && nextEx && !nextPartner) {
    nextPartner = nextEx;
    nextEx = undefined;
    started = time;
  }

  return {
    partnerName: nextPartner,
    exPartnerName: nextEx,
    relationshipStartedAt: started,
  };
}
