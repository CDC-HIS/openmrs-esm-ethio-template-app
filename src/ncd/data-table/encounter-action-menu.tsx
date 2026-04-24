import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import styles from './encounter-action-menu.scss';
import { type OpenmrsEncounter } from '../../types';

interface EncounterActionMenuProps {
  encounter: OpenmrsEncounter;
  workspaceName: string;
  headerTitle: string;
  patientUuid?: string;
  mutateEncounters: () => void;
}

export const EncounterActionMenu = ({
  encounter,
  workspaceName,
  headerTitle,
  patientUuid,
  mutateEncounters,
}: EncounterActionMenuProps) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const launchEditEncounterForm = useCallback(() => {
    launchPatientWorkspace(workspaceName, {
      workspaceTitle: t('editEncounter', 'Edit ' + headerTitle),
      encounter,
      type: { edit: true },
      mutateEncounters,
      formContext: 'editing',
    });
  }, [encounter, t, headerTitle, workspaceName, mutateEncounters]);

  const launchViewEncounterForm = useCallback(() => {
    launchPatientWorkspace(workspaceName, {
      workspaceTitle: t('viewEncounter', 'View ' + headerTitle),
      encounter,
      type: { view: true },

      formContext: 'viewing',
    });
  }, [encounter, t, headerTitle, workspaceName]);

  const launchDeleteEncounterDialog = () => {
    const dispose = showModal('encounter-delete-confirmation', {
      closeDeleteModal: () => dispose(),
      encounterUuid: encounter.uuid,
      patientUuid,
      onConfirmDelete: () => {
        mutateEncounters();
        dispose();
      },
    });
  };

  return (
    <Layer className={styles.layer}>
      <OverflowMenu
        aria-label={t('editOrDeleteEncounter', 'Edit or delete Encounter')}
        size={isTablet ? 'lg' : 'sm'}
        flipped
        align="left"
      >
        <OverflowMenuItem
          className={styles.menuItem}
          id="viewEncounter"
          onClick={launchViewEncounterForm}
          itemText={t('view', 'View')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="editEncounter"
          onClick={launchEditEncounterForm}
          itemText={t('edit', 'Edit')}
        />
        <OverflowMenuItem
          className={styles.menuItem}
          id="deleteEncounter"
          itemText={t('delete', 'Delete')}
          onClick={launchDeleteEncounterDialog}
          isDelete
          hasDivider
          aria-label={t('deleteEncounter', 'Delete Encounter')} // Added aria-label for accessibility
        />
      </OverflowMenu>
    </Layer>
  );
};
