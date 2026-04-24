import { type OpenmrsResource } from '@openmrs/esm-framework';

export interface OpenmrsEncounter extends OpenmrsResource {
  encounterDatetime: Date;
  encounterType: string;
  patient: string;
  location: string;
  encounterProviders?: Array<{ encounterRole: string; provider: string }>;
  obs: Array<OpenmrsResource>;
  form?: string;
  visit?: string;
}

// src/types.ts
export interface Patient {
  uuid: string;
  display: string; // e.g., "12345 - John Doe"
}
export interface Facility {
  uuid: string;
  display: string; // e.g., "12345 - John Doe"
}

export interface Observation {
  concept: string; // Concept UUID
  value: string | number; // Value can be numeric or text
}

export interface EncounterPayload {
  patient: string; // Patient UUID
  encounterDatetime: string; // ISO date string
  location: string; // Location UUID
  encounterType: string; // Encounter type UUID
  obs: Observation[];
}

interface TableColumn {
  key: string;
  header: string;
  getValue: any;
}

interface DataTableConfig {
  patientUuid: string;
  headerTitle: string;
  encounterTypeUuid: string;
  workspaceName: string;
  formOpen: boolean;
  handleMutate: () => void;
}

export interface TableProps {
  columns: TableColumn[];
  config: DataTableConfig;
}
interface viewType {
  view?: boolean;
  edit?: boolean;
  add?: boolean;
}
export interface IntakeFormProps {
  encounter?: any;
  type?: viewType;
  mutateEncounters: () => void;
}

interface viewType {
  view?: boolean;
  edit?: boolean;
}

export interface FieldOption {
  name: string;
}
export interface SearchOption {
  address: string;
}
