import { z } from 'zod';

// Canonical values from docs/specs/decisoes-e-estados.md (§1 identities, §2 per-entity table).
// enums.test.ts fails on any drift. Do not redeclare these lists anywhere else (CA109).

export const JOB_STATES = ['scheduled', 'queued', 'running', 'retry_wait', 'succeeded', 'failed', 'cancelled'] as const;

export const ATTEMPT_STATES = ['leased', 'running', 'reconciling', 'succeeded', 'failed', 'cancelled', 'superseded'] as const;

export const PROCESSING_STATES = [
  'awaiting_category',
  'awaiting_profile_unlock',
  'awaiting_sensitive_consent',
  'awaiting_agent',
  'vision_unavailable',
  'quota_exceeded',
  'needs_review',
  'queued',
  'extracting',
  'describing',
  'narrating',
  'assembling',
  'reconciling',
  'ready',
  'failed',
  'cancelled',
] as const;

export const IMPORT_STATES = [
  'awaiting_category',
  'awaiting_profile_unlock',
  'awaiting_sensitive_consent',
  'waiting_capacity',
  'queued',
  'processing',
  'ready',
  'rejected',
  'failed',
  'cancelled',
] as const;

export const CAPTURED_DOCUMENT_STATES = [
  'awaiting_profile_unlock',
  'awaiting_sensitive_consent',
  'needs_review',
  'accepted',
  'processing',
  'ready',
  'failed',
  'cancelled',
] as const;

export const DELIVERY_STATES = ['pending', 'sending', 'retry_wait', 'delivered', 'failed_terminal', 'cancelled', 'expired'] as const;

export const PAIRING_STATES = ['pending', 'approved', 'delivered', 'denied', 'expired', 'cancelled'] as const;

export const PRINCIPAL_STATUSES = ['active', 'suspended', 'revoked'] as const;

export const PRINCIPAL_KINDS = ['extension', 'api_client', 'telegram_binding', 'web_session', 'mcp', 'source_automation'] as const;

export const INPUT_KINDS = ['url', 'captured_text'] as const;

export const SOURCE_CHANNELS = ['web', 'extension', 'api', 'telegram', 'mcp', 'source'] as const;

export const VISIBILITIES = ['household', 'private_to_profile'] as const;

export const JobState = z.enum(JOB_STATES);
export const AttemptState = z.enum(ATTEMPT_STATES);
export const ProcessingState = z.enum(PROCESSING_STATES);
export const ImportState = z.enum(IMPORT_STATES);
export const CapturedDocumentState = z.enum(CAPTURED_DOCUMENT_STATES);
export const DeliveryState = z.enum(DELIVERY_STATES);
export const PairingState = z.enum(PAIRING_STATES);
export const PrincipalStatus = z.enum(PRINCIPAL_STATUSES);
export const PrincipalKind = z.enum(PRINCIPAL_KINDS);
export const InputKind = z.enum(INPUT_KINDS);
export const SourceChannel = z.enum(SOURCE_CHANNELS);
export const Visibility = z.enum(VISIBILITIES);

export type JobState = z.infer<typeof JobState>;
export type AttemptState = z.infer<typeof AttemptState>;
export type ProcessingState = z.infer<typeof ProcessingState>;
export type ImportState = z.infer<typeof ImportState>;
export type CapturedDocumentState = z.infer<typeof CapturedDocumentState>;
export type DeliveryState = z.infer<typeof DeliveryState>;
export type PairingState = z.infer<typeof PairingState>;
export type PrincipalStatus = z.infer<typeof PrincipalStatus>;
export type PrincipalKind = z.infer<typeof PrincipalKind>;
export type InputKind = z.infer<typeof InputKind>;
export type SourceChannel = z.infer<typeof SourceChannel>;
export type Visibility = z.infer<typeof Visibility>;
