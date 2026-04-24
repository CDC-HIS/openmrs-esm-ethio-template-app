import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { ncdDashboardMeta } from './dashboard.meta';

export const moduleName = '@icap-ethiopia/esm-ncd-app';

const options = {
  featureName: 'ncd',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const ncd = getAsyncLifecycle(() => import('./ncd/index'), options);
export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const ncdDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...ncdDashboardMeta,
    moduleName,
  }),
  options,
);
export const ncdScreeningFrom = getAsyncLifecycle(() => import('./forms/screening'), options);

export const encounterDeleteConfirmation = getAsyncLifecycle(
  () => import('./ncd/data-table/delete-encounter.modal'),
  options,
);
