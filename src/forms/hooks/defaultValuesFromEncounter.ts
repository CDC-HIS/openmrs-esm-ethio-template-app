import dayjs from 'dayjs';

export const defaultValuesFromEncounter = <T>(
  encounter: any,
  defaultValues: T,
  conceptsUuid: Record<string, string>,
  filterItems: string[] = [],
): T => {
  if (!encounter || !encounter.obs) return defaultValues;

  const encounterValues: Partial<T> = { ...defaultValues };

  encounter.obs.forEach((obs: any) => {
    const conceptUuid = obs.concept.uuid || obs.concept;
    const fieldName = Object.keys(conceptsUuid).find((key) => conceptsUuid[key] === conceptUuid);

    if (fieldName) {
      const value = obs?.value?.uuid ? obs?.value?.uuid : obs?.value;

      if (filterItems.includes(conceptUuid)) {
        if (!encounterValues[fieldName as keyof T]) {
          encounterValues[fieldName as keyof T] = { selectedItems: [] } as any;
        }
        (encounterValues[fieldName as keyof T] as any).selectedItems.push({
          label: obs.value.name.name,
          concept: obs.value.uuid,
        });
      } else if (fieldName.toLowerCase().includes('date') && value) {
        encounterValues[fieldName as keyof T] = dayjs(value).toDate() as any;
      } else if (Array.isArray(encounterValues[fieldName as keyof T]) && value) {
        encounterValues[fieldName as keyof T] = Array.isArray(value) ? value : ([value].filter(Boolean) as any);
      } else {
        encounterValues[fieldName as keyof T] = value as any;
      }
    }
  });

  return encounterValues as T;
};
