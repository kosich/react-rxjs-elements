import { ComponentClass, createElement, FunctionComponent, useEffect, useState } from 'react';
import { isObservable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { $ } from './fragment';
import { useDestroyObservable, useEmptyObject } from './shared';

// TODO: handle ref
// TODO: add better TS support

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
export function createElement$<T>(element: string | FunctionComponent<T> | ComponentClass<T, any>): FunctionComponent<any> {

  return (props: any) => {

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
      // check for obsolete props
      const delProps = Object.create(null);
      Object.keys(_prevProps).forEach(key => {
        if (key in props) {
          return;
        }

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

        // if property changes and previous was Observable
        // we need to kill subscription
        if (!Object.is(props[key], _prevProps[key])) {
          cleanSubscription(_subs, key);
        }

        const value = props[key];
        _prevProps[key] = value;

        // observable input params are auto observed
        if (isObservable(value)) {
          streamKeys.push(key);
        }

        // all static props are directly updated
        else {
          nextProps[key] = value;
        }
      });

      // remove obsolete props
      // & update static props
      setStateProps(p => Object.assign({}, p, delProps, nextProps));

      streamKeys.forEach(key => {
        _subs[key] = props[key]
          .pipe(
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
          })
        });
    }, [props]);

    // if error -- throw
    if (error) {
      throw error.error;
    }

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


// preset elements {{{
// Q: should we prefab all possible elements?
// Q: should that be statically generated on build or created on demand?
export const $a = createElement$('a');
export const $img = createElement$('img');

export const $p = createElement$('p');
export const $span = createElement$('span');
export const $div = createElement$('div');

export const $form = createElement$('form');
export const $input = createElement$('input');
export const $textarea = createElement$('textarea');
export const $select = createElement$('select');
export const $button = createElement$('button');
// }}}

