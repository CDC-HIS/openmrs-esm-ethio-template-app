import type { DateInputValue } from '@openmrs/esm-framework';

import * as yup from 'yup';

export const mohScreeningSchema = yup.object({
  screeningDate: yup.mixed<DateInputValue>().required('Screening Date is required'),
  riskBehaviorsPresent: yup.string().required('Risk Behaviors Present is required'),
  riskFactorsPresent: yup
    .object({
      selectedItems: yup.array(
        yup.object({
          concept: yup.string().nullable(),
          label: yup.string().nullable(),
        }),
      ),
    })
    .nullable(),
  riskFactorsPresentOther: yup.string().nullable(),
  pulse: yup.number().nullable(),
  respiratoryRate: yup.number().nullable(),
  temperature: yup.number().nullable(),
  waistCircumference: yup.number().nullable(),
  weight: yup.number().nullable(),
  height: yup.number().nullable(),
});
export type MOHScreening = yup.InferType<typeof mohScreeningSchema>;
