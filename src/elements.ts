import { ComponentClass, createElement, FunctionComponent, useEffect, useState } from 'react';
import { isObservable, Observable } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { $ } from './fragment';
import { useDestroyObservable, useEmptyObject } from './shared';

// TODO: handle ref

/**
 * creates a dynamic component that will subscribe to passed Observable props
 *
 * Example:
 *
 * ```jsx
 * import React from 'react';
 * import { createElement$ } from 'react-rxjs-elements';
 * import { timer } from 'rxjs';
 *
 * function App(){
 *   const $div = createElement$('div');
 *   const timer$ = timer(0, 1000);
 *
 *   return <$div title={ timer$ } >Hello world</div>
 * }
 * ```
 *
 * @param element element tag ('div', 'input', '...') or component function/class
 * @returns FunctionComponent that observes it's Observable params and children
 */
export function createElement$<T extends keyof JSX.IntrinsicElements>(element: T): FunctionComponent<{ [k in keyof JSX.IntrinsicElements[T]]: JSX.IntrinsicElements[T][k] | Observable<JSX.IntrinsicElements[T][k]> }>
export function createElement$<P, S = any>(element: FunctionComponent<P> | ComponentClass<P, S>): FunctionComponent<{ [k in keyof P]: P[k] | Observable<P[k]> }>
export function createElement$(element) {
  return function element$(props) {
    // state for renderable props
    const [stateProps, setStateProps] = useState(Object.create(null));

    // placeholder for Observable.error case -- will use it to rethrow error
    const [error, setError] = useState<{ error: any }>(null);

    const destroy$ = useDestroyObservable();

    // store prev props to compare
    const _prevProps = useEmptyObject();

    // keep subscriptions to unsubscribe on dynamic prop update
    const _subs = useEmptyObject();

    useEffect(() => {
      let isDirty = false;

      // check for obsolete props
      const delProps = Object.create(null);
      Object.keys(_prevProps).forEach(key => {
        if (key in props) {
          return;
        }

        isDirty = true;
        delete _prevProps[key];
        // if previous property was Observable
        // kill subscription
        cleanSubscription(_subs, key);
        // remove from static props
        delProps[key] = void 0;
      });

      // update/track new props
      const nextProps = Object.create(null);
      const streamKeys = [];
      Object.keys(props).forEach(key => {
        // children are covered via <$>
        if (key == 'children') {
          return;
        }

        const value = props[key];
        const prevValue = _prevProps[key];
        const equal = Object.is(value, prevValue);

        if (equal) {
          return;
        }

        isDirty = true;
        _prevProps[key] = value;

        // if property changes and previous was Observable
        // we need to kill subscription
        cleanSubscription(_subs, key);

        // observable input params are auto observed
        if (isObservable(value)) {
          nextProps[key] = void 0;
          streamKeys.push(key);
        }

        // all static props are directly updated
        else {
          nextProps[key] = value;
        }
      });

      // remove obsolete props
      // & update static props
      if (isDirty) {
        setStateProps(p => Object.assign({}, p, delProps, nextProps));
      }

      // subscribe to new streams
      streamKeys.forEach(key => {
        _subs[key] = props[key]
          .pipe(
            distinctUntilChanged(),
            takeUntil(destroy$)
          )
          .subscribe({
            // on value updates -- update props
            next(data) {
              setStateProps(p => Object.assign({}, p, { [key]: data }));
            },
            // on error -- rethrow error
            error (error) {
              setError({ error });
            }
            // on complete we just keep using accumulated value
          })
        });

    }, [props]);

    // if error -- throw
    if (error) {
      throw error.error;
    }

    // ensure controlled elements stay controlled
    // if value is present and is not nullish
    // we make the input controlled
    if (
      'value' in props
      && props.value != null
      && (
        element == 'input' && props.type != 'file' && stateProps.type != 'file'
        || element == 'select'
        || element == 'textarea'
      )
    ) {
      stateProps.value = stateProps.value ?? '';
    }

    // TODO: use statically available props in render phase
    // so that `<$a alt="hello" href={ stream$ } >…</a>`
    // renders `<a alt="hello">…</a>` immediately

    return createElement(
      element,
      stateProps,
      // if children exist
      // they might be observable
      // so we pass em to <$> fragment
      // NOTE: children might not exist for elements like <input />
      props.children
      ? createElement($, null, props.children)
      : null
    );
  };
}

// helpers
function cleanSubscription(store, key) {
  if (store[key]) {
    store[key].unsubscribe();
    delete store[key];
  }
}

