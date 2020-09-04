import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';


/**
 * reusable empty dependencies array for hooks
 */
export const EMPTY_DEPENDENCIES = [];

/**
 * empty Object wiht no dependencies
 */
export function useEmptyObject() {
  const [object] = useState(Object.create(null));

  return object;
}

/**
 * destroy$ stream helper
 * it will emit an empty value on unmount
 */
export function useDestroyObservable() {
  const [destroy$] = useState(new Subject<void>());

  useEffect(() => () => {
    destroy$.next(void 0);
    destroy$.complete();
  }, EMPTY_DEPENDENCIES);

  return destroy$.asObservable();
}
