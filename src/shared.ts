import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';


/**
 * reusable empty dependencies array for hooks
 */
export const EMPTY_DEPENDENCIES = [];

/**
 * empty Object wiht no dependencies
 */
export function useEmptyObject() {
  const ref = useRef(Object.create(null));
  return ref.current;
}

/**
 * destroy$ stream helper
 * it will emit an empty value on unmount
 */
export function useDestroyObservable() {
  const [destroy$] = useState(() => new Subject<void>());

  useEffect(() => () => {
    destroy$.next(void 0);
    destroy$.complete();
  }, EMPTY_DEPENDENCIES);

  return destroy$.asObservable();
}
