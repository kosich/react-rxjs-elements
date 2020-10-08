import React, { useState } from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { createElement$ } from '../src/index';

// TODO: cover errors on Observables

const $div = createElement$('div');

describe('Elements', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement("div");
        document.body.appendChild(rootElement);
    });

    afterEach(() => {
        unmountComponentAtNode(rootElement);
        rootElement.remove();
        rootElement = null;
    });

    test('dynamic children', () => {
        const content$ = new Subject();
        const App = () => <$div>Hello, { content$ }</$div>;
        act(() => { render(<App />, rootElement); });
        expect(rootElement.innerHTML).toBe('<div>Hello, </div>');
        act(() => { content$.next('world'); });
        expect(rootElement.innerHTML).toBe('<div>Hello, world</div>');
    });

    describe('Params', () => {

        test('static input', () => {
            const App = () => <$div title="Hello">world</$div>;
            act(() => { render(<App />, rootElement); });
            expect(rootElement.innerHTML).toBe('<div title="Hello">world</div>');
        });

        test('static output', () => {
            const content$ = new Subject();
            const value$ = content$.pipe(
                map(_ => 'hello')
            );

            const App = () => <$div onClick={ () => content$.next(void 0) }>{ value$ }</$div>;
            act(() => { render(<App />, rootElement); });
            expect(rootElement.innerHTML).toBe('<div></div>');

            const div = rootElement.querySelector('div');
            act(() => {
                div.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            });

            expect(rootElement.innerHTML).toBe('<div>hello</div>');
        });

        test('dynamic input', () => {
            const content$ = new Subject<string>();
            const App = () => <$div title={content$}>world</$div>;
            act(() => { render(<App />, rootElement); });
            expect(rootElement.innerHTML).toBe('<div>world</div>');
            act(() => { content$.next('Hello'); });
            expect(rootElement.innerHTML).toBe('<div title="Hello">world</div>');
        });

    });

    describe('Updates', () => {
      it('should unsubscribe from previous observable', () => {
        let setState, setState2;
        let i = 0;
        const unsub = jest.fn();
        const createSource = () =>
          new Observable((observer) => {
            observer.next(i);
            i++;
            return () => unsub();
          });

        const updateSource = () => {
          setState(createSource())
        }

        const App = () => {
          const s1 = useState(null);
          const s2 = useState(0);
          [,setState] = s1;
          [,setState2] = s2;
          const [source$] = s1;
          return <$div title={source$}></$div>;
        };

        act(() => { render(<App />, rootElement); });

        expect(rootElement.innerHTML).toBe('<div></div>');
        act(updateSource);
        expect(rootElement.innerHTML).toBe('<div title="0"></div>');
        expect(unsub.mock.calls.length).toBe(0);
        act(() => setState2((x) => x + 1));
        expect(rootElement.innerHTML).toBe('<div title="0"></div>');
        expect(unsub.mock.calls.length).toBe(0);
        act(updateSource);
        expect(rootElement.innerHTML).toBe('<div title="1"></div>');
        expect(unsub.mock.calls.length).toBe(1);
      })

      it('should make useless updates if props are equal', () => {
        let setState;
        const updateState = () => setState(x => x + 1);
        const spy = jest.fn(() => null);
        const Child = createElement$(spy);
        const App = () => {
          [, setState] = useState(null);
          return <Child />;
        };

        act(() => { render(<App />, rootElement); });
        expect(spy.mock.calls.length).toBe(1);
        act(updateState);
        expect(spy.mock.calls.length).toBe(2);
        act(updateState);
        expect(spy.mock.calls.length).toBe(3);
      })

      it('should remove value from obsolete stream', () => {
        let setState;
        let subject$ = new Subject();
        const App = () => {
          const [state$, _setState] = useState(null);
          setState = _setState;
          return <$div title={state$}></$div>;
        };

        act(() => { render(<App />, rootElement); });
        expect(rootElement.innerHTML).toBe('<div></div>');
        act(() => setState(subject$));
        expect(rootElement.innerHTML).toBe('<div></div>');
        act(() => { subject$.next(0); });
        expect(rootElement.innerHTML).toBe('<div title="0"></div>');
        act(() =>{
          subject$ = new Subject();
          setState(subject$);
        });
        expect(rootElement.innerHTML).toBe('<div></div>');
        act(() => { subject$.next(1); });
        expect(rootElement.innerHTML).toBe('<div title="1"></div>');
      })
    })
})
