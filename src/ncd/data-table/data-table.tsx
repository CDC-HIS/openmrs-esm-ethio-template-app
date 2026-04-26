import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  Pagination,
} from '@carbon/react';
import { DataTableSkeleton, InlineLoading } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import styles from './data-table.scss';
import { EncounterActionMenu } from './encounter-action-menu';
import type { TableProps } from '../../types';
import { useEncounterRows } from '../../utils/hooks';

const DynamicDataTable: React.FC<TableProps> = ({ columns, config }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const [paginatedRows, setPaginatedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { encounters, total, isLoading, isError, mutate } = useEncounterRows(
    config.patientUuid,
    config.encounterTypeUuid,
    pageSize,
    currentPage,
  );

  const constructTableRows = useCallback(
    (encounters: any) => {
      const rows = encounters.map((encounter) => {
        const tableRow: { id: string; actions: any } = { id: encounter.uuid, actions: null };
        columns.forEach((column) => {
          let val = column?.getValue(encounter);
          tableRow[column.key] = val;
        });
        return tableRow;
      });
      setPaginatedRows(rows);
    },
    [columns],
  );

  useEffect(() => {
    if (encounters?.length) {
      constructTableRows(encounters);
    } else {
      setPaginatedRows([]);
    }
  }, [encounters, constructTableRows, pageSize, currentPage, mutate]);
  const handleMutate = config.handleMutate;
  const handleMutateFunc = useCallback(() => {
    handleMutate();
    mutate();
  }, [handleMutate, mutate]);

  const launchForm = useCallback(() => {
    launchPatientWorkspace(config.workspaceName, {
      encounter: null,
      type: { add: true },
      mutateEncounters: handleMutateFunc,
    });
  }, [config.workspaceName, handleMutateFunc]);

  if (isLoading) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (isError) return <ErrorState error={isError} headerTitle={config.headerTitle} />;

  return (
    <div>
      <DataTable
        rows={paginatedRows}
        headers={columns}
        useZebraStyles
        size={isTablet ? 'lg' : 'sm'}
        render={({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer
            title={config.headerTitle}
            description={isLoading && <InlineLoading />}
            {...getTableContainerProps()}
          >
            <TableToolbar>
              {!config.formOpen && (
                <TableToolbarContent>
                  <Button kind="ghost" renderIcon={Add} iconDescription={t('add', 'Add')} onClick={launchForm}>
                    {t('add', 'Add')}
                  </Button>
                </TableToolbarContent>
              )}
            </TableToolbar>

            {paginatedRows.length > 0 ? (
              <Table {...getTableProps()} aria-label={config.headerTitle}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header, isSortable: true })}>
                        {header.header}
                      </TableHeader>
                    ))}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    const encounterItem = encounters.find((enc) => enc.uuid === row.id);
                    return (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                        <TableCell>
                          {encounterItem && (
                            <EncounterActionMenu
                              patientUuid={config.patientUuid}
                              workspaceName={config.workspaceName}
                              headerTitle={config.headerTitle}
                              encounter={encounterItem}
                              mutateEncounters={() => handleMutateFunc()}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                displayText={t('noData', 'No Data')}
                headerTitle={''}
                launchForm={!config.formOpen && launchForm}
              />
            )}
          </TableContainer>
        )}
      />
      {paginatedRows.length > 0 && (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          pageSizes={[10, 20, 30, 40, 50]}
          totalItems={total}
          onChange={({ page, pageSize }) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }}
        />
      )}
    </div>
  );
};

export default DynamicDataTable;
