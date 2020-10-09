import { createElement, Fragment, useEffect, useState } from "react";
import { isObservable } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";
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

  // CHORTCUT:
  // if fragment has many children -- we render it with a <> that has
  // <$> children in place of Observables
  if (Array.isArray(children)){
    return createElement(Fragment, null, ...children.map(c => isObservable(c) ? createElement($, null, c) : c));
  }

  // Single child:

  // state for Observable children
  const [streamChild, setStreamChild] = useState(null);

  // store error indicator
  const [error, setError] = useState(null);

  const destroy$ = useDestroyObservable();

  // react to child updates
  useEffect(() => {
    if (!isObservable(children)) {
      return;
    }

    // child is a single observable
    // if the stream emits async - synchronously reset child to null
    // else - use value from the stream to update the child
    let syncChildValue = null;
    let isSync = true;
    const sub = children.pipe(distinctUntilChanged(), takeUntil(destroy$)).subscribe({
      next(value) {
        // synchronous values would be set in one run
        if (isSync) {
          syncChildValue = value;
        } else {
          setStreamChild(value);
        }
      }, // update the view
      error(error) {
        // wrap error in an object to be safe in case the error is nullish
        setError({ error });
      },
      // on complete we just keep displaying accumulated value
    });
    isSync = false;

    // make the sync update
    setStreamChild(syncChildValue);

    // clear subscription if Observable child changes
    return () => sub.unsubscribe();
  }, [children]);

  // raise an error if Observable failed
  if (error) {
    throw error.error;
  }

  return isObservable(children)
    ? streamChild // read child updates from state
    : children; // child is a regular child, like you and me
}
