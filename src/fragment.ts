import { createElement, Fragment, useEffect, useState } from "react";
import { isObservable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { useDestroyObservable } from "./shared";

// TODO: add better TS support

/**
 * <$> fragment will subscribe to it's Observable children and display
 * it's emissions along with regular children
 *
 * e.g.
 *
 * ```jsx
 * function App(){
 *   return <$>{ timer(0, 1000) }</$>    // 0, 1, 2, 3, ...
 * }
 * ```
 */
export function $(props) {
  const children = props?.children;

  // store children
  // null placeholder for Observables & Arrays
  // and children for static children
  const [cn, setCn] = useState(Array.isArray(children) || isObservable(children) ? null : children);
  const [error, setError] = useState(null);

  const destroy$ = useDestroyObservable();

  useEffect(() => {
    // array of children, one of em might be observable
    if (Array.isArray(children)) {
      setCn(
        // recursively create another $ for Observables
        children.map((c) => (isObservable(c) ? createElement($, null, c) : c))
      );
      return;
    }

    // child is a single observable
    if (isObservable(children)) {
      const sub = children.pipe(takeUntil(destroy$)).subscribe({
        next: setCn, // update the view
        error(error) {
          // wrap error in an object to be safe in case the error is nullish
          setError({ error });
        },
        // on complete we just keep displaying accumulated value
      });

      return () => sub.unsubscribe();
    }

    // child is a regular child, like you and me
    setCn(children);
  }, [children]);

  // raise an error if Observable failed
  if (error) {
    throw error.error;
  }

  // NOTE: array children are rendered inside <></> fragment
  //       while regular children are rendered directly as children of <$>,
  //       without additional <>
  //       this might be an unwanted behavior difference
  // TODO: research for real-life effects of this difference
  return Array.isArray(cn) ? createElement(Fragment, null, ...cn) : cn;
}
