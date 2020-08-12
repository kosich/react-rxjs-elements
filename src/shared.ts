import { useEffect, useMemo } from 'react';
import { Subject } from 'rxjs';


/**
 * reusable empty dependencies array for hooks
 */
export const EMPTY_DEPENDENCIES = [];

/**
 * empty Object wiht no dependencies
 */
export function useEmptyObject() {
  return useMemo(() => Object.create(null), EMPTY_DEPENDENCIES);
}

/**
 * destroy$ stream helper
 * it will emit an empty value on unmount
 */
export function useDestroyObservable() {
  const destroy$ = useMemo(() => new Subject<void>(), EMPTY_DEPENDENCIES);

  useEffect(() => () => {
    destroy$.next(void 0);
    destroy$.complete();
  }, EMPTY_DEPENDENCIES);

  return destroy$.asObservable();
}
