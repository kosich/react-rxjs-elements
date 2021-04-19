import { memo, useEffect, useRef, useState } from "react";
import { BehaviorSubject, isObservable, Observable, of } from "rxjs";
import { createElement$ } from "../elements";
import { EMPTY_DEPENDENCIES } from '../shared';
import { RefSubject } from "./RefSubject";

export type BasicNodeType = JSX.Element | string | number;

// Main hook getter
export interface TUseHook$ {
  <F>(fn: (p) => F): RefSubject<F>
}

let _globalUseHook: TUseHook$ | undefined = undefined;
export const useHook$: TUseHook$ = (fn) => {
  if (_globalUseHook == undefined) {
    throw new Error('Using hooks outside component constructor');
  };

  return _globalUseHook(fn);
}


// NOTE: it's memo-ised and createElement$-ed, and we might need to optimise that
export function createComponent$<P>(fn: (props: Observable<P>) => BasicNodeType | Observable<BasicNodeType>) {
  return memo(createElement$((props: P) => {
    const props$ = useRef<BehaviorSubject<P>>();
    const output$ = useRef<Observable<BasicNodeType>>();
    const [output, setOutput] = useState<any>(null);

    // Saving hooks and their streams for future calls
    const hookFns = useRef<any[]>([]);
    const hookStreams = useRef<RefSubject<any>[]>([]);

    // Unconditional props$ stream update

    // TODO: React.memo doesn't exactly guarantee that the component won't be
    // called twice with the same props, it's rather a performance optimisation.
    // So we should add a guard for that or a simple distinctUntilChanged if it
    // works
    if (!props$.current) {
      props$.current = new BehaviorSubject<P>(props);
    } else {
      props$.current.next(props);
    }

    // Call the component fn once
    if (!output$.current) {
      // Record all hooks used: they will be called in each render phase and
      // their values pushed to respective Subjects
      const useHook = fn => {
        const hook$ = new RefSubject<any>();
        hookFns.current.push(fn);
        hookStreams.current.push(hook$);

        // TODO: this exposes Subject API to the user, which should be avoided
        //       in the future and an Observable interface with current value
        //       field exposed
        return hook$;
      }

      // Calling component fn, preserving prev and next useHook instance
      const prevUseHook = _globalUseHook;
      _globalUseHook = useHook;
      const result = fn(props$.current);
      _globalUseHook = prevUseHook;

      // Observable-ing the output
      output$.current = isObservable(result)
        ? result
        : of(result);
    }

    // If any hooks were used -- call all of them & push their results
    // (we need to call all hooks on each render, in the same order)
    if (hookFns.current.length != 0) {
      const hookValues = hookFns.current.map(hook => hook());

      useEffect(() => {
        // NOTE: Deferring hook effects, so that .next don't initiate a chain of
        //       updates in current component's render phase

        // TODO: this might emit same hook results multiple times, might need some
        //       change distinction

        hookValues.forEach((v, i) => {
          hookStreams.current[i].next(v);
        });
      }, hookValues);
    }

    // Binding output with 
    useEffect(() => {
      const subscription = output$.current!.subscribe(setOutput);

      return () => {
        props$.current!.complete(); // complete current stream
        subscription.unsubscribe(); // unsubscribe from results
      }
    }, EMPTY_DEPENDENCIES);

    return output;
  }));
}