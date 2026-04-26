import { showSnackbar, closeWorkspace } from '@openmrs/esm-framework';
import { saveEncounter } from '../../api/api';
import dayjs from 'dayjs';

interface VisibilityRules<T> {
  [key: string]: (data: T, context?: any) => boolean;
}

const formatValue = (value: any, key: string): any => {
  if (key.toLowerCase().includes('date') && value) {
    const jsDate = new Date(value);
    if (isNaN(jsDate.getTime())) return null;
    return dayjs(jsDate).format('YYYY-MM-DD');
  }
  if (Array.isArray(value)) {
    return value.filter((v) => v !== '' && v !== undefined && v !== null);
  }
  return value === '' || value === undefined || value === null || value === 0 ? null : value;
};

const getTouchedFieldsObs = (encounter, touchedFields, conceptsUuid, formValues) => {
  // Guard clauses for invalid inputs
  if (!encounter?.obs || !touchedFields || !conceptsUuid || !formValues) {
    return [];
  }

  // Get touched concept UUIDs
  const touchedConceptUuids = Object.keys(touchedFields)
    .filter((field) => touchedFields[field] && conceptsUuid[field])
    .map((field) => conceptsUuid[field]);

  // Process observations
  const touchedObs = encounter.obs
    .filter((obs) => touchedConceptUuids.includes(obs?.concept?.uuid))
    .filter((obs) => {
      // Find the corresponding field for this observation
      const fieldKey = Object.keys(conceptsUuid).find((field) => conceptsUuid[field] === obs.concept.uuid);
      if (!fieldKey) return false;

      // Get observation value (handle both object with uuid and direct value)
      const obsValue = obs?.value?.uuid ?? obs?.value;

      // Get form value for comparison
      let formValue;
      const formField = formValues[fieldKey];

      if (formField?.selectedItems) {
        // Handle multi-select or array-based inputs
        formValue = Array.isArray(formField.selectedItems)
          ? formField.selectedItems.map((item) => item?.uuid ?? item)
          : [];
      } else {
        // Handle single value inputs
        formValue = formField?.value?.uuid ?? formField?.value;
      }

      // Compare observation and form values
      if (Array.isArray(formValue)) {
        return formValue.includes(obsValue) ? false : true;
      }
      return obsValue === formValue ? false : true;
    })
    .map((obs) => ({ uuid: obs.uuid, voided: true }));

  return touchedObs;
};

export async function createEncounter<T>(
  data: T,
  config: {
    namespace: string;
    touchedFields: any;
    encounter: any;
    conceptsUuid: Record<string, string>;
    encounterType: string;
    formUuid: string;
    encounterDate: string;
    patientUuid: string;
    providerUuid: string;
    locationUuid: string;
    visibilityRules?: VisibilityRules<T>;
    context?: any;
    encounterUuid?: string;
    mutateEncounters: () => void;
    workspaceName: string;
    editMode?: boolean;
  },
): Promise<any> {
  const {
    namespace,
    touchedFields,
    encounter,
    conceptsUuid,
    encounterType,
    formUuid,
    encounterDate,
    patientUuid,
    providerUuid,
    locationUuid,
    visibilityRules = {},
    context = {},
    encounterUuid,
    mutateEncounters,
    workspaceName,
    editMode = false,
  } = config;
  const observations: any[] = [];
  const touchedObs = await getTouchedFieldsObs(encounter, touchedFields, conceptsUuid, data);

  // Add touched observations that need to be voided
  touchedObs.forEach((edited) => observations.push(edited));

  // Handle existing observations for fields that fail visibility rules
  if (encounter?.obs && Object.keys(visibilityRules).length > 0) {
    Object.keys(visibilityRules).forEach((field) => {
      const conceptUuid = conceptsUuid[field];
      if (!conceptUuid) return;

      // Check if the field fails visibility rules
      const isVisible = visibilityRules[field](data, context);
      const isTouched = touchedFields[field];

      if (!isVisible) {
        // Void existing observations for invisible fields (touched or untouched)
        const relatedObs = encounter.obs.filter((obs) => obs.concept?.uuid === conceptUuid);
        relatedObs.forEach((obs) => {
          observations.push({ uuid: obs.uuid, voided: true });
        });
      }
    });
  }

  // Build new observations only for touched and visible fields
  Object.entries(data)
    .filter(([key, value]) => {
      // Exclude invalid values
      if (value === '' || value === undefined || value === null || value === 0) {
        return false;
      }
      // Only include touched and visible fields
      const isTouched = touchedFields[key];
      const isVisible = !visibilityRules[key] || visibilityRules[key](data, context);
      return isTouched && isVisible;
    })
    .forEach(([key, value]) => {
      const formFieldPath = `${namespace}-${key}`;

      if (Array.isArray(value?.selectedItems)) {
        value.selectedItems.forEach((item: any) => {
          observations.push({
            concept: conceptsUuid[key],
            formFieldNamespace: namespace,
            formFieldPath,
            value: item.concept,
          });
        });
      } else {
        const formattedValue = formatValue(value, key);
        if (formattedValue !== null) {
          observations.push({
            concept: conceptsUuid[key],
            formFieldNamespace: namespace,
            formFieldPath,
            value: formattedValue.toString(),
          });
        }
      }
    });

  const payload = {
    encounterDatetime: encounterDate,
    encounterProviders: [{ provider: providerUuid, encounterRole: 'a0b03050-c99b-11e0-9572-0800200c9a66' }],
    encounterType,
    // form: { uuid: formUuid },
    location: locationUuid,
    patient: patientUuid,
    // orders: [],
    obs: observations,
  };

  try {
    const response = await saveEncounter(new AbortController(), payload, encounterUuid);
    showSnackbar({
      isLowContrast: true,
      title: editMode ? 'Record Updated' : 'Record Saved',
      kind: 'success',
      subtitle: editMode ? 'Encounter Updated' : 'A new encounter was created',
    });
    mutateEncounters();
    closeWorkspace(workspaceName);
    return response.data;
  } catch (error) {
    showSnackbar({
      isLowContrast: true,
      title: editMode ? 'Error Updating encounter' : 'Error creating encounter',
      kind: 'error',
      subtitle: error.response?.data?.error?.message || error.message,
    });
    throw error;
  }
}
