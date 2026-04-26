import React, { useState } from 'react';
import {
  Stack,
  Form,
  TextInput,
  Button,
  Accordion,
  AccordionItem,
  InlineLoading,
  MultiSelect,
  Tag,
  NumberInput,
  SelectItem,
  Select,
} from '@carbon/react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { OpenmrsDatePicker, usePatient, useSession, closeWorkspace } from '@openmrs/esm-framework';
import styles from './form-styles.scss';
import type { IntakeFormProps } from '../types';
import { ncdScreeningEncounterType, ncdScreeningFormUuid } from '../constants';
import { useFetchLocation } from './hooks/useFetchLocation';
import { defaultValuesFromEncounter } from './hooks/defaultValuesFromEncounter';
import { createEncounter } from './hooks/createEncounter';
import { riskBehaviorsPresentOpt, riskFactorsPresentOpt } from './utils/form-constant';
import type { MOHScreening } from './utils/screening-schema';
import { mohScreeningSchema } from './utils/screening-schema';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import { mohScreeningConcepts, mohScreeningDefault } from './utils/screening-data';

const MOHScreeningForm: React.FC<IntakeFormProps> = ({ encounter, type, mutateEncounters }) => {
  const encounterDate = new Date().toISOString();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const patient = usePatient();
  const session = useSession();
  const { facilityInfo } = useFetchLocation();

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<MOHScreening>({
    resolver: yupResolver(mohScreeningSchema),
    defaultValues: encounter
      ? defaultValuesFromEncounter<MOHScreening>(encounter, mohScreeningDefault, mohScreeningConcepts, [
          mohScreeningConcepts.riskFactorsPresent,
        ])
      : mohScreeningDefault,
    mode: 'all',
  });
  const formData = useWatch({ control });

  const onSubmit = async (data: MOHScreening) => {
    setIsSubmitting(true);
    try {
      await createEncounter<MOHScreening>(data, {
        namespace: 'rfe-forms',
        touchedFields,
        encounter,
        conceptsUuid: mohScreeningConcepts,
        encounterType: ncdScreeningEncounterType,
        formUuid: ncdScreeningFormUuid,
        encounterDate: type?.edit ? encounter?.encounterDatetime : encounterDate,
        patientUuid: patient.patientUuid,
        providerUuid: session.currentProvider.uuid,
        locationUuid: facilityInfo.uuid,
        encounterUuid: encounter?.uuid,
        mutateEncounters,
        workspaceName: 'training-screening-workspace',
        editMode: type?.edit,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.formNew}>
      <div className={styles.scrollableContent}>
        <Stack gap={1} className={styles.container}>
          <Accordion>
            <AccordionItem title="Screening Date and Risk Factor Assessment" open className={styles.formContainer}>
              <div className={styles.fieldWrapper}>
                <Controller
                  name="screeningDate"
                  control={control}
                  render={({ field }) => (
                    <OpenmrsDatePicker
                      id="screeningDate"
                      labelText={
                        <span className={styles.label}>
                          Screening Date <span className={styles.required}>*</span>
                        </span>
                      }
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                        field.onBlur();
                      }}
                      maxDate={encounterDate}
                      onBlur={() => field.onBlur()}
                      invalid={!!errors.screeningDate}
                      invalidText={errors?.screeningDate?.message}
                      isReadOnly={type?.view}
                    />
                  )}
                />
              </div>
              <div className={styles.formContainer}>
                <Controller
                  name="riskBehaviorsPresent"
                  control={control}
                  render={({ field }) => (
                    <Select
                      readOnly={type?.view}
                      id="riskBehaviorsPresent"
                      labelText={
                        <span>
                          Risk Factor Assessment ? <span className={styles.required}>*</span>
                        </span>
                      }
                      {...field}
                      invalid={!!errors.riskBehaviorsPresent}
                      invalidText={errors.riskBehaviorsPresent?.message}
                    >
                      <SelectItem value="" text="Select" />
                      {riskBehaviorsPresentOpt.map((item) => (
                        <SelectItem key={item.concept} value={item.concept} text={item.label} />
                      ))}
                    </Select>
                  )}
                />
              </div>

              {formData.riskBehaviorsPresent === '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' && (
                <>
                  <div className={styles.fieldWrapper}>
                    <Controller
                      name="riskFactorsPresent"
                      control={control}
                      render={({ field }) => {
                        const initialSelectedItems = riskFactorsPresentOpt.filter((item) =>
                          field?.value?.selectedItems?.some((selected) => selected.concept === item.concept),
                        );

                        return (
                          <MultiSelect
                            useTitleInItem
                            readOnly={type?.view}
                            id="riskFactorsPresent"
                            titleText={<span className={styles.label}>{t('riskFactorsPresent', 'Risk Factors')}</span>}
                            initialSelectedItems={initialSelectedItems}
                            items={riskFactorsPresentOpt}
                            itemToString={(item) => (item ? item.label : '')}
                            sortItems={(items) => items}
                            invalid={!!errors.riskFactorsPresent}
                            invalidText={errors.riskFactorsPresent?.message}
                            onChange={({ selectedItems }) => {
                              field.onChange({ selectedItems });
                              field.onBlur();
                            }}
                            onBlur={() => field.onBlur()}
                            value={field.value?.selectedItems || []}
                          />
                        );
                      }}
                    />
                  </div>
                  {formData?.riskFactorsPresent?.selectedItems?.map((data) => (
                    <Tag key={data.concept} type="gray">
                      {data.label}
                    </Tag>
                  ))}

                  {formData.riskFactorsPresent?.selectedItems?.some(
                    (opt) => opt.concept === '5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                  ) && (
                    <div className={styles.formContainer}>
                      <Controller
                        name="riskFactorsPresentOther"
                        control={control}
                        render={({ field }) => (
                          <TextInput
                            {...field}
                            readOnly={type?.view}
                            onChange={(e) => field.onChange(e.target.value)}
                            id="riskFactorsPresentOther"
                            labelText={t('riskFactorsPresentOther', 'Specify Other')}
                          />
                        )}
                      />
                    </div>
                  )}
                </>
              )}
            </AccordionItem>

            <AccordionItem title="Anthropometry & Vital signs" open className={styles.formContainer}>
              <div className={styles.fieldWrapper}>
                <Controller
                  name="pulse"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={0}
                      disableWheel
                      id="pulse"
                      allowEmpty
                      label={<span className={styles.label}>Pulse (bpm)</span>}
                      value={field.value}
                      onChange={(_, { value }) => {
                        field.onChange(value !== '' ? Number(value) : null);

                        field.onBlur();
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      invalid={!!errors.pulse}
                      invalidText={errors.pulse?.message}
                      readOnly={type?.view}
                    />
                  )}
                />
              </div>
              <div className={styles.fieldWrapper}>
                <Controller
                  name="respiratoryRate"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={0}
                      disableWheel
                      id="respiratoryRate"
                      allowEmpty
                      label={<span className={styles.label}>Respiratory Rate (bpm)</span>}
                      value={field.value}
                      onChange={(_, { value }) => {
                        field.onChange(value !== '' ? Number(value) : null);

                        field.onBlur();
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      invalid={!!errors.respiratoryRate}
                      invalidText={errors.respiratoryRate?.message}
                      readOnly={type?.view}
                    />
                  )}
                />
              </div>
              <div className={styles.fieldWrapper}>
                <Controller
                  name="temperature"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={0}
                      step={0.01}
                      disableWheel
                      id="temperature"
                      allowEmpty
                      label={<span className={styles.label}>Temperature (Degree Celsius)</span>}
                      value={field.value}
                      onChange={(_, { value }) => {
                        field.onChange(value !== '' ? Number(value) : null);

                        field.onBlur();
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      invalid={!!errors.temperature}
                      invalidText={errors.temperature?.message}
                      readOnly={type?.view}
                    />
                  )}
                />
              </div>
              <div className={styles.fieldWrapper}>
                <Controller
                  name="waistCircumference"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={0}
                      disableWheel
                      id="waistCircumference"
                      allowEmpty
                      label={<span className={styles.label}>Waist Circumference (cm)</span>}
                      value={field.value}
                      onChange={(_, { value }) => {
                        field.onChange(value !== '' ? Number(value) : null);

                        field.onBlur();
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      invalid={!!errors.waistCircumference}
                      invalidText={errors.waistCircumference?.message}
                      readOnly={type?.view}
                    />
                  )}
                />
              </div>
              <div className={styles.fieldWrapper}>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={0}
                      disableWheel
                      id="weight"
                      allowEmpty
                      label={<span className={styles.label}>Weight (Kg)</span>}
                      value={field.value}
                      onChange={(_, { value }) => {
                        field.onChange(value !== '' ? Number(value) : null);

                        field.onBlur();
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      invalid={!!errors.weight}
                      invalidText={errors.weight?.message}
                      readOnly={type?.view}
                    />
                  )}
                />
              </div>
              <div className={styles.fieldWrapper}>
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      min={0}
                      disableWheel
                      id="height"
                      allowEmpty
                      label={<span className={styles.label}>Height (cm)</span>}
                      value={field.value}
                      onChange={(_, { value }) => {
                        field.onChange(value !== '' ? Number(value) : null);

                        field.onBlur();
                      }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      invalid={!!errors.height}
                      invalidText={errors.height?.message}
                      readOnly={type?.view}
                    />
                  )}
                />
              </div>
            </AccordionItem>
          </Accordion>
        </Stack>
      </div>
      <div className={styles.stickyButtonSet}>
        <Button
          kind="secondary"
          onClick={() => closeWorkspace('training-screening-workspace')}
          className={styles.button}
        >
          Discard
        </Button>
        {!type?.view && (
          <Button className={styles.button} kind="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span>
                <InlineLoading />
                Submitting ...
              </span>
            ) : type?.edit ? (
              'Update'
            ) : (
              'Save'
            )}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default MOHScreeningForm;
