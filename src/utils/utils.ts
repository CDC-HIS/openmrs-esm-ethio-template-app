import dayjs from 'dayjs';
import { formatDate, parseDate } from '@openmrs/esm-framework';

export function getEncounterValues(encounter, param: string, isDate?: Boolean) {
  if (isDate) return dayjs(encounter[param]).format('DD-MMM-YYYY');
  else return encounter[param] ? encounter[param] : '--';
}

export function formatDateTime(dateString: string): any {
  const format = 'YYYY-MM-DDTHH:mm:ss';
  if (dateString.includes('.')) {
    dateString = dateString.split('.')[0];
  }
  return dayjs(dateString, format, true).toDate();
}

export function obsArrayDateComparator(left, right) {
  return formatDateTime(right.obsDatetime) - formatDateTime(left.obsDatetime);
}

export function findObs(encounter, obsConcept): Record<string, any> {
  const allObs = encounter?.obs?.filter((observation) => observation.concept.uuid === obsConcept) || [];
  return allObs?.length == 1 ? allObs[0] : allObs?.sort(obsArrayDateComparator)[0];
}

export function getObsFromEncounters(encounters, obsConcept) {
  const filteredEnc = encounters?.find((enc) => enc.obs.find((obs) => obs.concept.uuid === obsConcept));
  return getObsFromEncounter(filteredEnc, obsConcept);
}

export function getMultipleObsFromEncounter(encounter, obsConcepts: Array<string>) {
  let observations = [];
  obsConcepts.map((concept) => {
    const obs = getObsFromEncounter(encounter, concept);
    if (obs !== '--') {
      observations.push(obs);
    }
  });

  return observations.length ? observations.join(', ') : '--';
}

export function getObsFromEncounter(encounter, obsConcept, isDate?: Boolean, isTrueFalseConcept?: Boolean) {
  const obs = findObs(encounter, obsConcept);

  if (obsConcept === '03ebe53a-476c-4497-a491-8c83da230a13') {
    const obsList = findAllObs(encounter, obsConcept);

    if (!obsList.length) return '--';
    const mappedValues = obsList.map((obs) => {
      if (obs.value?.uuid === '119481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
        return 'HTA';
      }
      if (obs.value?.uuid === '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
        return 'HTN';
      }
      if (obs.value?.uuid === '1107AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
        return 'None';
      }

      return obs.value;
    });

    return mappedValues.join(', ');
  }
  if (isTrueFalseConcept) {
    if (obs?.value?.uuid == '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
      return 'Yes';
    } else {
      return 'No';
    }
  }
  if (!obs) {
    return '--';
  }
  if (isDate) {
    return formatDate(parseDate(obs.value), { mode: 'wide', noToday: true, time: false });
  }
  if (obs.value.uuid === '119481AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
    return 'HTA';
  } else if (obs.value.uuid === '117399AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') {
    return 'HTN';
  }

  if (typeof obs.value === 'object' && obs.value?.names) {
    return (
      obs.value?.names?.find((conceptName) => conceptName.conceptNameType === 'SHORT')?.name || obs.value.name.name
    );
  }

  return obs.value;
}

export function getData(
  encounter: any,
  conceptId: string,
  isDate: boolean = false,
  isTrueFalseConcept: boolean = false,
) {
  return getObsFromEncounter(encounter, conceptId, isDate, isTrueFalseConcept);
}
export function findAllObs(encounter, obsConcept): any[] {
  return encounter?.obs?.filter((observation) => observation.concept.uuid === obsConcept) || [];
}
export const formatDateVal = (string) => {
  const jsDate = new Date(string);
  return dayjs(jsDate).format('YYYY-MM-DD');
};

export const calculateBmi = (height, weight) => {
  if (!height || !weight) return null;
  const heightInMeters = height / 100;
  const expectedBmi = weight / (heightInMeters * heightInMeters);
  const roundedExpected = parseFloat(expectedBmi.toFixed(1));
  return roundedExpected;
};

export function getDependentFields(rules: any) {
  const parents = new Set<string>();

  Object.values(rules).forEach((fn: any) => {
    const fnStr = fn.toString();
    const matches = fnStr.match(/data\.(\w+)/g);
    matches?.forEach((m) => parents.add(m.replace('data.', '')));
  });

  return Array.from(parents);
}
