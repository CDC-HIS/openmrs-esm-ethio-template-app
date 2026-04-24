import dayjs from 'dayjs';

export const formatValue = (value: any, key: string): any => {
  const isDateField = key.toLowerCase().includes('date');
  if (isDateField && value) {
    const jsDate = new Date(value);
    if (isNaN(jsDate.getTime())) return null;
    return dayjs(jsDate).format('YYYY-MM-DD');
  }
  return Array.isArray(value) ? value.join(',') : value;
};

export const formatValuePost = (value: any, key: string): any => {
  if (key.toLowerCase().includes('date') && value) {
    const jsDate = new Date(value);
    return isNaN(jsDate.getTime()) ? null : dayjs(jsDate).format('YYYY-MM-DD');
  }
  if (Array.isArray(value)) {
    return value.filter((v) => v != null);
  }
  return value == null ? null : value;
};
