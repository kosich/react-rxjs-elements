import React from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Subject } from 'rxjs';
import { $ } from '../src/index';
import { ErrorBoundary } from './ErrorBoundary';


describe('Basic', () => {
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

    describe('Single root', ()=> {
        let content$: Subject<any>;

        beforeEach(() => {
            content$ = new Subject();
            const App = () => <$>{ content$ }</$>;

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


    describe('Error', ()=> {
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
            act(() => { content$.error('ONE'); });
            expect(rootElement.innerHTML).toBe('ERROR:ONE');
        });
    });

})