import { createElement, Fragment, useEffect, useState } from "react";
import { isObservable } from "rxjs";

// TODO: use useMemo instead of useEffect
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
  const [cn, setCn] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // multiple children, one of em might be observable
    if (Array.isArray(children)) {
      setCn(children.map(c => createElement($, null, c)));
      return;
    }

    // single observable child
    if (isObservable(children)) {
      const sub = children.subscribe({
        next(cn) {
          // update the view
          setCn(cn);
        },
        error(error) {
          // wrap error in an object to be safe in case the error is nullish
          setError({ error });
        }
      });

      return () => sub.unsubscribe();
    }

    // child is just a child
    setCn(children);
  }, [children]);

  // raise an error if Observable failed
  if (error) {
    throw error.error;
  }

  // render children as array
  return Array.isArray(cn)
    ? createElement(Fragment, null, ...cn)
    : createElement(Fragment, null, cn)     // TODO: investigate if Fragment is needed here
}
