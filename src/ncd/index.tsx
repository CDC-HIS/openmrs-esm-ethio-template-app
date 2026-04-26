import { TabList } from '@carbon/react';
import { TabPanels } from '@carbon/react';
import { TabPanel } from '@carbon/react';
import { Tab } from '@carbon/react';
import { Tabs } from '@carbon/react';
import React from 'react';
import { usePatient } from '@openmrs/esm-framework';
import styles from './styles.scss';
import { ncdScreeningEncounterType } from '../constants';
import DynamicDataTable from './data-table/data-table';
import { getData } from '../utils/utils';

const Ncd: React.FC = () => {
  const patient = usePatient();

  const handleMutate = async () => {
    //
  };

  const screeningColumns = [
    {
      key: 'encounterdate',
      header: 'Screening Date',
      getValue: (encounter) => {
        return getData(encounter, 'bd09b775-0294-4775-9615-964d98e06a4f', true);
      },
    },
    {
      key: 'riskBehaviorsPresent',
      header: 'Risk Behaviors Present',
      getValue: (encounter) => {
        return getData(encounter, '154fda32-fbc1-4ed3-ab7a-477e2cfe76b1', true, true);
      },
    },
    {
      key: 'BMI',
      header: 'BMI',
      getValue: (encounter) => {
        return getData(encounter, 'e3c2efba-3ec9-4029-9bd9-716948995433');
      },
    },

    {
      key: 'bloodPressureDiastolic_2',
      header: 'Systolic BP 2/Diastolic BP 2',
      getValue: (encounter) => {
        return `${
          getData(encounter, '2252be76-2b9c-4068-9e2b-3dcfcc665359') +
          '/' +
          getData(encounter, '1edd6d26-9af1-4c60-b03a-cc9375e147c7')
        } mmHg`;
      },
    },
    {
      key: 'fbg',
      header: 'FBS',
      getValue: (encounter) => {
        return getData(encounter, '160912AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      },
    },
    {
      key: 'rbg',
      header: 'RBS',
      getValue: (encounter) => {
        return getData(encounter, '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      },
    },
    {
      key: 'cvdRiskCategory',
      header: '10 years CVD risk Category',
      getValue: (encounter) => {
        return getData(encounter, '3ce04752-4dff-4b66-b64c-df3a33bff967');
      },
    },
    {
      key: 'baselineDiagnosis',
      header: 'Baseline Diagnosis',
      getValue: (encounter) => {
        return `${
          getData(encounter, '356108fd-0a3a-4eab-8bd0-7140c2914284') +
          '/' +
          getData(encounter, 'ed5d8abb-475a-4c8b-ab50-0a1cf2dd4122')
        }`;
      },
    },
  ];
  const screeningConfig = {
    patientUuid: patient.patientUuid,
    headerTitle: 'NCD Screening Form',
    encounterTypeUuid: ncdScreeningEncounterType,
    workspaceName: 'training-screening-workspace',
    formOpen: true,
    handleMutate,
  };
  return (
    <div>
      <div className={styles.header}>
        <h4>Non Communicable Diseases</h4>
      </div>

      <Tabs>
        <TabList contained className={styles.tabs}>
          <Tab>Screening</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <DynamicDataTable columns={screeningColumns} config={screeningConfig} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};
export default Ncd;
