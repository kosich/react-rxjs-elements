import React from 'react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { createElement$ } from '../src/index';

// TODO: cover memory leaking / unsubsciptions
// TODO: cover errors on Observables

const $div = createElement$('div');
const $input = createElement$('input');

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
            const content$ = new Subject();
            const App = () => <$div title={content$}>world</$div>;
            act(() => { render(<App />, rootElement); });
            expect(rootElement.innerHTML).toBe('<div>world</div>');
            act(() => { content$.next('Hello'); });
            expect(rootElement.innerHTML).toBe('<div title="Hello">world</div>');
        });

        test('dynamic value', () => {
            // TODO: test if the input doesn't change controlled/uncontrolled mode
            //       when we use Observables as value
            //       https://reactjs.org/docs/forms.html#controlled-components
            const value$ = new Subject();
            const App = () => <$input readOnly value={ value$.pipe(startWith('')) } />;
            act(() => { render(<App />, rootElement); });
            expect(rootElement.innerHTML).toBe('<input readonly=\"\" value="">');
        });

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