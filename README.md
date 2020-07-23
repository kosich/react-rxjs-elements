<div align="center">
  <h1>
    <br/>
    &lt;$&gt;
    <br/>
    <sub><sub>react fragment for RxJS content</sub></sub>
    <br/>
    <br/>
    <a href="https://www.npmjs.com/package/react-rxjs-elements"><img src="https://img.shields.io/npm/v/react-rxjs-elements" alt="NPM"></a>
    <a href="https://bundlephobia.com/result?p=react-rxjs-elements@0.0.1"><img src="https://img.shields.io/bundlephobia/minzip/react-rxjs-elements?label=gzipped" alt="Bundlephobia"></a>
    <a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/npm/l/react-rxjs-elements" alt="MIT license"></a>
    <br/>
    <br/>
    <br/>
  </h1>
</div>

<!--
[![NPM](https://img.shields.io/npm/v/react-rxjs-elements)](https://www.npmjs.com/package/react-rxjs-elements) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/react-rxjs-elements?label=gzipped)](https://bundlephobia.com/result?p=react-rxjs-elements@0.0.1) [![MIT license](https://img.shields.io/npm/l/react-rxjs-elements)](https://opensource.org/licenses/MIT)
-->

Simply add an Observable as one of `<$>`'s children:

```tsx
<$>{ stream$ }</$>
```

And `react-rxjs-elements` will subscribe to it and will display it's updates in place.    
It will also clean up all subscriptions for you on component unmount.

Try it [**online**](https://stackblitz.com/edit/react-rxjs-elements?file=index.tsx)

## Install

```
npm i react-rxjs-elements
```

## Examples

A simple timer

```tsx
import React from 'react';
import { timer } from 'rxjs';
import { $ } from 'react-rxjs-elements';

function App(){
  return <div>
    <$>{ timer(0, 1000) } sec</$>
  </div>
}
```

A counter

```tsx
import React from 'react';
import { $ } from 'react-rxjs-elements';
import { Subject } from 'rxjs';
import { startWith, scan } from 'rxjs/operators';

function App (){
  const subject$ = new Subject();

  const output$ = subject$.pipe(
    startWith(0),                   // start with a 0
    scan((acc, curr) => acc + curr) // then add +1 or -1
  );

  return <div>
    <button onClick={()=>subject$.next(-1)}>
      -
    </button>
    
    <$>{ output$ }</$>
  
    <button onClick={()=>subject$.next(+1)}>
      +
    </button>
  </div>
}
```

## Enjoy 🙂 
