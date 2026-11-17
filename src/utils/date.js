import { parseISO, format, formatDistanceToNow, isValid } from 'date-fns';

 





export function formatLocalDate(isoString, formatStr = 'MMM d, yyyy') {
  if (!isoString) return '';
  
  
  const date = parseISO(isoString);
  
  if (!isValid(date)) return 'Invalid Date';
  
  return format(date, formatStr);
}

 


export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  
  const date = parseISO(isoString);
  if (!isValid(date)) return 'Invalid Date';
  
  return formatDistanceToNow(date, { addSuffix: true });
}


export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',               
  LONG: 'MMMM d, yyyy',               
  WITH_TIME: 'MMM d, yyyy h:mm a',    
  TIME_ONLY: 'h:mm a',                
  NUMERIC: 'MM/dd/yyyy',              
};
