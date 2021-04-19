import React, { useState } from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Observable, of, Subject } from 'rxjs';
import { $input, createElement$ } from '../src/elements/index';

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
    const App = () => <$div>Hello, {content$}</$div>;
    act(() => { render(<App />, rootElement); });
    expect(rootElement.innerHTML).toBe('<div>Hello, </div>');
    act(() => { content$.next('world'); });
    expect(rootElement.innerHTML).toBe('<div>Hello, world</div>');
  });

  describe('Params', () => {

    test('static input', () => {
      const App = () => <$div title="Hello">world</$div>;
      render(<App />, rootElement);
      expect(rootElement.innerHTML).toBe('<div title="Hello">world</div>');
    });

    test('static output', () => {
      const content$ = new Subject();

      const App = () => <$div onClick={() => content$.next('hello')}>{content$}</$div>;
      act(() => { render(<App />, rootElement); });
      expect(rootElement.innerHTML).toBe('<div></div>');

      const div = rootElement.querySelector('div');
      act(() => {
        div.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(rootElement.innerHTML).toBe('<div>hello</div>');
    });

    // Currently we subscribe in useEffect phase
    // therefore attribute wont be immediately available
    // this is a subject for further improvements
    test('immediate stream attr', () => {
      const App = () => <$div title={of('Hello')}>world</$div>;
      render(<App />, rootElement);
      expect(rootElement.innerHTML).toBe('<div>world</div>');
    });

    test('delayed stream attr', () => {
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
        [, setState] = s1;
        [, setState2] = s2;
        const [source$] = s1;
        return <$div title={source$}></$div>;
      };

      act(() => { render(<App />, rootElement); });
      expect(rootElement.innerHTML).toBe('<div></div>');
      // change static null to stream
      act(updateSource);
      expect(rootElement.innerHTML).toBe('<div title="0"></div>');
      expect(unsub.mock.calls.length).toBe(0);
      // update unrelated state
      act(() => setState2((x) => x + 1));
      expect(rootElement.innerHTML).toBe('<div title="0"></div>');
      expect(unsub.mock.calls.length).toBe(0);
      // change stream to static
      act(() => setState('Hello'));
      expect(rootElement.innerHTML).toBe('<div title="Hello"></div>');
      expect(unsub.mock.calls.length).toBe(1);
      // change static to stream
      act(updateSource);
      expect(rootElement.innerHTML).toBe('<div title="1"></div>');
      expect(unsub.mock.calls.length).toBe(1);
      // change stream to stream
      act(updateSource);
      expect(rootElement.innerHTML).toBe('<div title="2"></div>');
      expect(unsub.mock.calls.length).toBe(2);
      // change stream to static
      act(() => setState('World'));
      expect(rootElement.innerHTML).toBe('<div title="World"></div>');
      expect(unsub.mock.calls.length).toBe(3);
    })

    it('should not make useless updates if props are equal', () => {
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
      act(() => {
        subject$ = new Subject();
        setState(subject$);
      });
      expect(rootElement.innerHTML).toBe('<div></div>');
      act(() => { subject$.next(1); });
      expect(rootElement.innerHTML).toBe('<div title="1"></div>');
    })
  })

  describe('Input value', () => {
    it('should not set input value if absent', () => {
      const App = () => <$input />;
      act(() => { render(<App />, rootElement); });
      expect(rootElement.innerHTML).toBe('<input>');
    })

    // NOTE: this doesn't test controlled -> uncontrolled switch
    it('should set input value immediately', () => {
      const content$ = new Subject<string>();
      const App = () => <$input readOnly value={content$} />;
      act(() => {
        render(<App />, rootElement);
        // NOTE: checking presense of value synchronously, inside act
        expect(rootElement.innerHTML).toBe('<input readonly="" value="">');
      });
      act(() => { content$.next('world'); });
      expect(rootElement.innerHTML).toBe('<input readonly="" value="world">');
      expect(rootElement.children[0].value).toBe('world');
    })
  })
})
