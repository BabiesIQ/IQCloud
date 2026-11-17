import { useCallback, useRef } from 'react';
import { sdk } from '@/services/sdk';
import { toast } from 'sonner';
import { useFetch } from './useFetch';

 






function unwrapFunctionResult(result) {
  if (!result?.ok) {
    const error = result?.error;
    throw Object.assign(new Error(error?.message || 'Function call failed'), {
      kind: error?.kind || 'unknown',
      cause: error,
    });
  }

  const value = result.value;

  
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (value.success === false) {
      throw Object.assign(new Error(value.message || value.error || 'Function call failed'), { kind: 'provider', cause: value });
    }
    if (value.error) {
      const message = typeof value.error === 'string' ? value.error : value.error.message;
      throw Object.assign(new Error(message || 'Function call failed'), { kind: 'provider', cause: value });
    }
  }

  
  if (typeof value === 'string' && /^\s*</.test(value)) {
    throw Object.assign(new Error('Function call failed'), { kind: 'provider', cause: value });
  }

  return value;
}

export function useFunction(functionName, options = {}) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetcher = useCallback(async (body) => {
    const { successMessage, showError, ...sdkOptions } = optionsRef.current;
    
    
    
    const result = await sdk.functions.invoke(functionName, body, sdkOptions);
    return unwrapFunctionResult(result);
  }, [functionName]);

  
  
  
  const failedRef = useRef(null);
  const guardedFetcher = useCallback(async (...args) => {
    failedRef.current = null;
    try {
      return await fetcher(...args);
    } catch (err) {
      failedRef.current = err;
      throw err; 
    }
  }, [fetcher]);

  const { data, loading, error, run, setData } = useFetch(guardedFetcher, { initialLoading: false });

  const invoke = useCallback(async (...args) => {
    const result = await run(...args);
    const { successMessage, showError } = optionsRef.current;
    const err = failedRef.current;
    if (err) {
      if (showError !== false) toast.error(err.message || 'Function call failed');
      return undefined;
    }
    if (successMessage) toast.success(successMessage);
    return result;
  }, [run]);

  const reset = useCallback(() => setData(null), [setData]);

  return { invoke, loading, data, error, reset };
}
