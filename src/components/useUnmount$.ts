import { useEffect, useRef } from "react";
import { ReplaySubject } from "rxjs";
import { switchMap } from "rxjs/operators";
import { EMPTY_DEPENDENCIES } from '../shared';
import { useHook$ } from "./components";


export function useUnmount$() {
  return useHook$(() => {
    const unmount = useRef<ReplaySubject<void>>();

    if (!unmount.current) {
      unmount.current = new ReplaySubject(1);
    }

    useEffect(() => {
      return () => {
        unmount.current!.next(void 0);
        unmount.current!.complete();
      };
    }, EMPTY_DEPENDENCIES);

    return unmount.current;
  })
    .pipe(switchMap(x => x));
}
