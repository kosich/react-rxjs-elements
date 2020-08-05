import React from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Subject } from 'rxjs';
import { $div } from '../src/index';
import { map } from 'rxjs/operators';

// TODO: cover memory leaking / unsubsciptions
// TODO: cover errors on Observables

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


    test('static params', () => {
        const App = () => <$div title="Hello">world</$div>;
        act(() => { render(<App />, rootElement); });
        expect(rootElement.innerHTML).toBe('<div title="Hello">world</div>');
    });

    test('dynamic params', () => {
        const content$ = new Subject();
        const App = () => <$div title={content$}>world</$div>;
        act(() => { render(<App />, rootElement); });
        expect(rootElement.innerHTML).toBe('<div>world</div>');
        act(() => { content$.next('Hello'); });
        expect(rootElement.innerHTML).toBe('<div title="Hello">world</div>');
    });

    test('dynamic output', () => {
        const content$ = new Subject();
        const value$ = content$.pipe(
            map(_ => 'hello')
        );

        const App = () => <$div onClick={content$}>{ value$ }</$div>;
        act(() => { render(<App />, rootElement); });
        expect(rootElement.innerHTML).toBe('<div></div>');

        const div = rootElement.querySelector('div');
        act(() => { 
            div.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });

        expect(rootElement.innerHTML).toBe('<div>hello</div>');
    });

    test('dynamic children', () => {
        const content$ = new Subject();
        const App = () => <$div>Hello, { content$ }</$div>;
        act(() => { render(<App />, rootElement); });
        expect(rootElement.innerHTML).toBe('<div>Hello, </div>');
        act(() => { content$.next('world'); });
        expect(rootElement.innerHTML).toBe('<div>Hello, world</div>');
    });
})