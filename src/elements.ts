import { createElement, useEffect, useMemo, useState } from 'react';
import { isObservable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { $ } from './fragment';

// preset elements {{{
// Q: should we prefab all possible elements?
// Q: should that be statically generated on build or created on demand?
export const $a = createElement$('a');
export const $img = createElement$('img');
export const $p = createElement$('p');
export const $span = createElement$('span');
export const $div = createElement$('div');
export const $textarea = createElement$('textarea');
export const $input = createElement$('input');
export const $form = createElement$('form');
export const $button = createElement$('button');
// }}}


const EMPTY_DEPENDENCIES = [];
const useEmptyObject = () => useMemo(() => Object.create(null), EMPTY_DEPENDENCIES);

export function createElement$(elName) {
  const el$ = (_props) => {
    // TODO: consider extracting static props and immediately using them
    const [props, setProps] = useState(Object.create(null));

    // placeholder for Observable.error case -- will use it to rethrow error
    const [error, setError] = useState<{ error: any }>(null);

    // destroy$ stream helper {{{
    // it will emit an empty value on unmount
    const destroy$ = useMemo(() => new Subject<void>(), EMPTY_DEPENDENCIES);
    useEffect(() => () => {
      destroy$.next(void 0);
      destroy$.complete();
    }, EMPTY_DEPENDENCIES);
    // }}}

    // store prev props to compare
    const _prevProps = useEmptyObject();

    // keep subscriptions to unsubscribe on dynamic prop update
    const _subs = useEmptyObject();

    // use effect for props
    useEffect(() => {
      // check for obsolete props
      const delProps = Object.create(null);
      Object.keys(_prevProps).forEach(key => {
        if (
             !(key in _props)
          || !Object.is(_props[key], _prevProps[key])
        ) {
          delete _prevProps[key];

          if (_subs[key]) {
            _subs[key].unsubscribe();
            delete _subs[key];
          }

          // remove from static props
          delProps[key] = void 0;
        }
      });

      // immediately remove obsolete props
      setProps(p => Object.assign({}, p, delProps));

      // update/track new props
      const nextProps = Object.create(null);
      Object.keys(_props).forEach(key => {
        // TODO: add Observable ref
        if (key == 'children' || key == 'ref') {
          return;
        }

        const value = _props[key];
        _prevProps[key] = value;

        // all onSomething -- are considered to be output props
        if (/^on[A-Z]/.test(key) && typeof value.next == 'function') {
          setProps(p => {
            return Object.assign({}, p, {
              [key]: e => value.next(e)
            });
          });
        }

        // observable input params are auto observed
        else if (isObservable(value)) {
          _subs[key] = value.pipe(
            takeUntil(destroy$)
          ).subscribe({
            // on value updates -- update props
            next(data) {
              setProps(p => Object.assign({}, p, { [key]: data }));
            },
            // on error -- rethrow error
            error (error) {
              setError({ error });
            }
          });
        }

        // all static props are directly updated
        else {
          nextProps[key] = value;
        }
      });

      // update static props
      setProps(p => Object.assign({}, p, nextProps));
    }, [_props]);

    // if error -- throw
    if (error) {
      throw error.error;
    }

    return createElement(
      elName,
      props,
      // if children exist
      // they might be observable
      // so we pass em to <$> fragment
      _props.children
      ? createElement($, null, _props.children)
      : null
    );
  }

  return el$;
}