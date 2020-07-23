import * as React from "react";
import { isObservable } from "rxjs";

export function $(props) {
  const children = props?.children;

  // store children
  const [cn, setCn] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // multiple children, one of em might be observable
    if (Array.isArray(children)) {
      setCn(children.map(c => React.createElement($, null, c)));
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
    ? React.createElement(React.Fragment, null, ...cn)
    : React.createElement(React.Fragment, null, cn)
}
