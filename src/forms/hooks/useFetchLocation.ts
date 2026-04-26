import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import type { Facility } from '../../types';

export function useFetchLocation() {
  const [facilityInfo, setFacilityInfo] = useState<Facility>(null);
  const url = `${restBaseUrl}/location?v=default`;
  const { data: response, error, isLoading } = useSWR<{ data: any }, Error>(url, openmrsFetch);

  useEffect(() => {
    if (response) {
      const facility = response.data.results.find((element: any) =>
        element.tags?.some((x: any) => x.display === 'Facility Location'),
      );
      if (facility) {
        setFacilityInfo({ uuid: facility.uuid, display: facility.display });
      }
    }
  }, [response]);

  return {
    facilityInfo,
    isLoading,
    isError: !!error,
  };
}
