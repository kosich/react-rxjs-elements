# React fragment for RxJS content

[![NPM](https://img.shields.io/npm/v/react-rxjs-elements)](https://www.npmjs.com/package/react-rxjs-elements) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/react-rxjs-elements?label=gzipped)](https://bundlephobia.com/result?p=react-rxjs-elements@0.0.1) [![MIT license](https://img.shields.io/npm/l/react-rxjs-elements)](https://opensource.org/licenses/MIT)

`react-rxjs-elements` will subscribe to it's Observable children and will display their updates in place.    
It will also clean up all subscriptions for you on component unmount.


## Install

```
npm i react-rxjs-elements
```

Or try it [**online**](https://stackblitz.com/edit/react-rxjs-elements?file=index.tsx)!

## Use

A simple timer

```tsx
import React from 'react';
import { $ } from 'react-rxjs-elements';

function App(){
  return <div>
    <$>{ timer(0, 1000) } sec</$>
  </div>
}
```

A button that counts and displays it's clicks

```tsx
function App (){
  const subject$ = new Subject();
  const output$ = subject$.pipe(
    startWith(0),
    scan(acc => acc + 1),
  );

  return <button onClick={()=>subject$.next()}>
    <$>{ output$ }</$>
  </button>
}
```

## Enjoy 🙂 
