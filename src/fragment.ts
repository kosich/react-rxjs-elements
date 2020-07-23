import React, { useEffect, useState } from "react";
import { isObservable } from "rxjs";

export function $({ children }) {
  // store children
  const [cn, setCn] = useState(null);

  useEffect(() => {
    // multiple children, one of em might be observable
    if (Array.isArray(children)) {
      setCn(children.map(c => React.createElement($, null, c)));
      return;
    }

    // single observable child
    if (isObservable(children)) {
      const sub = children.subscribe(cn => {
        setCn(cn);
      });

      return () => sub.unsubscribe();
    }

    // child is just a child
    setCn(children);
  }, [children]);

  // render children as array
  return Array.isArray(cn)
         ? React.createElement(React.Fragment, null, ...cn)
         : React.createElement(React.Fragment, null, cn)
}
