import { useEffect, useRef } from "react";
import { ReplaySubject } from "rxjs";
import { switchMap } from "rxjs/operators";
import { EMPTY_DEPENDENCIES } from '../shared';
import { useHook$ } from "./components";


export function useMount$() {
  return useHook$(() => {
    const mount = useRef<ReplaySubject<void>>();

    if (!mount.current) {
      mount.current = new ReplaySubject(1);
    }

    useEffect(() => {
      mount.current!.next(void 0);
      return () => {
        mount.current!.complete();
      };
    }, EMPTY_DEPENDENCIES);

    return mount.current;
  })
    .pipe(switchMap(x => x));
}
