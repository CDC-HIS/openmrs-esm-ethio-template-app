import { fhirBaseUrl, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { OpenmrsEncounter } from '../types';
import useSWR from 'swr';
import { encounterRepresentation } from '../constants';
import useSWRImmutable from 'swr';
import { useEffect, useState } from 'react';
type UseEncounters = {
  encounters: Array<OpenmrsEncounter>;
  isError: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => void;
};

// export function useEncounterRows(patientUuid: string, encounterType: string, pageSize?: number, pageNumber?: number) {
//   const [encounters, setEncounters] = useState([]);
//   const startIndex = (pageNumber - 1) * pageSize;

//   const url = `/ws/rest/v1/encounter?encounterType=${encounterType}&patient=${patientUuid}&v=${encounterRepresentation}&totalCount=true&limit=${pageSize}&startIndex=${startIndex}`;

//   const { data: response, error, isLoading, mutate } = useSWR<{ data: any }, Error>(url, openmrsFetch);

//   useEffect(() => {
//     if (response) {
//       response.data.results.sort(
//         (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
//       );

//       setEncounters([...response.data.results]);
//     }
//   }, [response]);

//   return {
//     encounters,
//     total: response?.data?.totalCount,
//     isLoading,
//     isError: error,
//     mutate,
//   };
// }

export function useEncounterRows(patientUuid: string, encounterType: string, pageSize?: number, pageNumber?: number) {
  const [encounters, setEncounters] = useState([]);
  const startIndex = (pageNumber - 1) * pageSize;
  const url = `/ws/rest/v1/encounter?encounterType=${encounterType}&patient=${patientUuid}&v=${encounterRepresentation}&totalCount=true&limit=${pageSize}&startIndex=${startIndex}`;

  const { data: response, error, isLoading, mutate } = useSWR<{ data: any }, Error>(url, openmrsFetch);

  useEffect(() => {
    if (response?.data?.results) {
      const sortedEncounters = [...response.data.results].sort((a, b) => {
        // Find observations for first concept UUID '4285d9e8-3ab4-4a94-bd4e-4dd92855795c'
        const aObs1 = a.obs?.find((obs) => obs.concept.uuid === '4285d9e8-3ab4-4a94-bd4e-4dd92855795c');
        const bObs1 = b.obs?.find((obs) => obs.concept.uuid === '4285d9e8-3ab4-4a94-bd4e-4dd92855795c');
        // Extract date values (handle numeric, text, or null cases)
        const aDate1 = aObs1 ? aObs1.valueNumeric ?? aObs1.value : null;
        const bDate1 = bObs1 ? bObs1.valueNumeric ?? bObs1.value : null;
        // Convert to timestamps for comparison (handle null/invalid dates)
        const aTime1 = aDate1 ? new Date(aDate1).getTime() : 0;
        const bTime1 = bDate1 ? new Date(bDate1).getTime() : 0;

        // If dates for first concept differ, sort by it (descending)
        if (aTime1 !== bTime1) {
          return bTime1 - aTime1; // Most recent first
        }

        // If tied, use second concept UUID '163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as tiebreaker
        const aObs2 = a.obs?.find((obs) => obs.concept.uuid === '163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        const bObs2 = b.obs?.find((obs) => obs.concept.uuid === '163260AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
        // Extract date values for tiebreaker
        const aDate2 = aObs2 ? aObs2.valueNumeric ?? aObs2.value : null;
        const bDate2 = bObs2 ? bObs2.valueNumeric ?? bObs2.value : null;
        // Convert to timestamps for comparison
        const aTime2 = aDate2 ? new Date(aDate2).getTime() : 0;
        const bTime2 = bDate2 ? new Date(bDate2).getTime() : 0;

        // Sort by second concept date in descending order
        return bTime2 - aTime2; // Most recent first
      });

      setEncounters(sortedEncounters);
    }
  }, [response]);

  return {
    encounters,
    total: response?.data?.totalCount,
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePatientDeathStatus(patientUuid: string) {
  const {
    data: response,
    isLoading,
    error,
  } = useSWRImmutable<any, Error>(`/ws/rest/v1/person/${patientUuid}?v=custom:(dead)`, openmrsFetch);

  return {
    isDead: !isLoading && !error && response ? response?.data?.dead : false,
  };
}
export function getLatestObsKey(patientUuid: string, conceptUuid: string, encounterType?: string) {
  const searchParams = new URLSearchParams({
    patient: patientUuid,
    code: conceptUuid,
    _sort: '-_lastUpdated',
    _count: '1',
  });
  if (encounterType) {
    searchParams.append('encounter.type', encounterType);
  }
  return `${fhirBaseUrl}/Observation?${searchParams.toString()}`;
}
export function useLatestObs(patientUuid: string, conceptUuid: string, encounterType?: string) {
  const searchParams = new URLSearchParams({
    patient: patientUuid,
    code: conceptUuid,
    _sort: '-_lastUpdated',
    _count: '1',
  });
  if (encounterType) {
    searchParams.append('encounter.type', encounterType);
  }

  const url = `${fhirBaseUrl}/Observation?${searchParams.toString()}`;

  const { data: response, error, isLoading } = useSWR<{ data: any }, Error>(url, openmrsFetch);

  return {
    latestMatched: response?.data?.entry?.length ? response?.data?.entry[0]?.resource : null,
    latestLoading: isLoading,
    latestError: error,
    cacheKey: url,
  };
}

export function useFetchLocation() {
  const [encounters, setEncounters] = useState([]);
  const url = `${restBaseUrl}/location?v=default`;
  const { data: response, error, isLoading, mutate } = useSWR<{ data: any }, Error>(url, openmrsFetch);

  useEffect(() => {
    if (response) {
      response.data.results.sort(
        (a, b) => new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime(),
      );

      setEncounters([...response.data.results]);
    }
  }, [response]);

  return {
    encounters,
    isLoading,
    isError: error,
  };
}

export function useValidateObs(
  patientUuid: string | null | undefined,
  encounterTypeUuid: string | null | undefined,
  concept: string | null | undefined,
  encounterDate: string | null | undefined,
) {
  const isValid = !!patientUuid && !!encounterTypeUuid && !!concept && !!encounterDate;

  const url = isValid
    ? `/ws/rest/v1/encounterwrapper/${patientUuid}?encounterTypeUuid=${encounterTypeUuid}&conceptQuestionUuid=${concept}&value=${encounterDate}`
    : null;

  const { data: response, error, isLoading } = useSWR<{ data: any }, Error>(url, openmrsFetch);

  return {
    obsData: response?.data,
    obsLoading: isLoading,
    obsError: error,
    cacheKey: url,
  };
}
