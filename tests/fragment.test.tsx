import React from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { of, Subject } from 'rxjs';
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

  describe('Immediate rendering', () => {
    it('should render of stream immediately', () =>{
      const App = () => <$>{of('value')}</$>;
      render(<App />, rootElement);
      expect(rootElement.innerHTML).toBe('value');
    })
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

})
