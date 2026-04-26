import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { encounterRepresentation } from '../constants';

export function saveEncounter(abortController: AbortController, payload, encounterUuid?: string) {
  const url = encounterUuid
    ? `${restBaseUrl}/encounter/${encounterUuid}?v=${encounterRepresentation}`
    : `${restBaseUrl}/encounter?v=${encounterRepresentation}`;

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(payload),
    signal: abortController.signal,
  }).catch((err) => {
    console.error('Error saving encounter:', err);
    throw err;
  });
}

export function deleteEncounter(patientUuid: string, encounterUuid: string, abortController: AbortController) {
  return openmrsFetch(`${restBaseUrl}/encounter/${encounterUuid}`, {
    method: 'DELETE',
    signal: abortController.signal,
  });
}
export const validatencounter = async (
  patientUuid,
  encounterTypeUuid,
  concept,
  encounterDate,
  abortController: AbortController,
) => {
  const response = await openmrsFetch(
    `/ws/rest/v1/ethiohri/validatencounter?patientUuid=${patientUuid}&encounterTypeUuid=${encounterTypeUuid}&conceptUuid=${concept}&obsDate=${encounterDate}`,
    {
      method: 'GET',
      signal: abortController.signal,
      headers: {
        Accept: 'application/json',
      },
    },
  );
  return response.data;
};

export function identifierGeneration(abortController: AbortController, payload, patientUuid: string, uuid?: string) {
  const url = uuid
    ? `${restBaseUrl}/patient/${patientUuid}/identifier/${uuid}`
    : `${restBaseUrl}/patient/${patientUuid}/identifier`;

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(payload),
    signal: abortController.signal,
  }).catch((err) => {
    console.error('Error saving identifier:', err);
    throw err;
  });
}
