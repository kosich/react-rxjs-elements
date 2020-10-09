import React, { useState } from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Observable, Subject } from 'rxjs';
import { $ } from '../src/index';
import { ErrorBoundary } from './ErrorBoundary';


describe('Fragment', () => {
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

  describe('Static', () => {
    it('should render static child instantly', () =>{
      const App = () => <$>Hello world</$>;
      render(<App />, rootElement);
      expect(rootElement.innerHTML).toBe('Hello world');
    });
  })

  describe('Single root', () => {
    let content$: Subject<any>;

    beforeEach(() => {
      content$ = new Subject();
      const App = () => <$>{content$}</$>;

      act(() => { render(<App />, rootElement); });
    });

    afterEach(() => {
      content$.complete();
      content$ = null;
    });


    test('empty', () => {
      expect(rootElement.innerHTML).toBe('');
    });

    test('consequent renders', () => {
      act(() => { content$.next('ONE'); });

      expect(rootElement.innerHTML).toBe('ONE');

      act(() => { content$.next('TWO'); });

      expect(rootElement.innerHTML).toBe('TWO');

      act(() => { content$.complete(); });

      expect(rootElement.innerHTML).toBe('TWO');
    });
  });

  describe('Multiple roots', () => {
    it('should render two streams', () =>{
      const a$ = new Subject();
      const b$ = new Subject();
      const App = () => <$>{a$} and {b$}</$>;
      act(() => { render(<App />, rootElement); })
      act(() => { a$.next('a'); })
      expect(rootElement.innerHTML).toBe('a and ');
      act(() => { b$.next('b'); });
      expect(rootElement.innerHTML).toBe('a and b');
    });
  });

  describe('Error', () => {
    let content$: Subject<any>;

    beforeEach(() => {
      content$ = new Subject();
      const App = () => <ErrorBoundary><$>{content$}</$></ErrorBoundary>;
      act(() => { render(<App />, rootElement); });
    });

    afterEach(() => {
      content$.complete();
      content$ = null;
    });

    test('errors', () => {
      // NOTE: this error propagates to the console
      //       it doesn't affect passing test, but creates visual mess
      // TODO: suppress the error
      act(() => { content$.error('ONE'); });
      expect(rootElement.innerHTML).toBe('ERROR:ONE');
    });
  });

  describe('Updates', () => {
    it('should unsubscribe from previous observable', () => {
      let setState;
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
        const [source$, _setState] = useState(null);
        setState = _setState;
        return <$>{source$}</$>;
      };

      act(() => { render(<App />, rootElement); });

      expect(rootElement.innerHTML).toBe('');
      act(updateSource);
      expect(rootElement.innerHTML).toBe('0');
      expect(unsub.mock.calls.length).toBe(0);
      act(updateSource);
      expect(rootElement.innerHTML).toBe('1');
      expect(unsub.mock.calls.length).toBe(1);
    })
  })
})
