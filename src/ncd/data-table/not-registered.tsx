import React from 'react';
import { Layer, Tile } from '@carbon/react';
import styles from './not-registered.scss';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { SkeletonText } from '@carbon/react';
import { SkeletonPlaceholder } from '@carbon/react';

const NotRegisterd = ({ displayText, loading }) => {
  const { t } = useTranslation('@openmrs/esm-patient-chart-app');

  return (
    <Layer className={styles.layer}>
      <Tile className={styles.tile}>
        <EmptyDataIllustration />
        {loading ? (
          <SkeletonText lineCount={3} width="65%" />
        ) : (
          <p className={styles.content}>{t('notRegistered', displayText)}</p>
        )}
      </Tile>
    </Layer>
  );
};

export default NotRegisterd;
