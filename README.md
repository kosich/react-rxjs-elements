<div align="center">
  <h1>
    <br/>
    &lt;$&gt;
    <br/>
    <sub><sub>react elements for RxJS content</sub></sub>
    <br/>
    <br/>
    <a href="https://www.npmjs.com/package/react-rxjs-elements"><img src="https://img.shields.io/npm/v/react-rxjs-elements" alt="NPM"></a>
    <a href="https://bundlephobia.com/result?p=react-rxjs-elements@latest"><img src="https://img.shields.io/bundlephobia/minzip/react-rxjs-elements?label=gzipped" alt="Bundlephobia"></a>
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

or use a dynamic element, like $img

```tsx
<$img src={ stream$ } />
```

`react-rxjs-elements` will subscribe to the `stream$` and will display it's updates in place.    
And it will clean up all subscriptions for you on component unmount.

Try it [**online**](https://stackblitz.com/edit/react-rxjs-elements?file=index.tsx)

## 📦 Install

```
npm i react-rxjs-elements
```

## 📖 Examples

A simple timer — [online sandbox](https://stackblitz.com/edit/react-rxjs-elements-timer?file=index.tsx)

```tsx
import React from 'react';
import { timer } from 'rxjs';
import { $ } from 'react-rxjs-elements';

function App() {
  return <$>{ timer(0, 1000) } sec</$>
}
```

---

Dynamic image sources — [online sandbox](https://stackblitz.com/edit/react-rxjs-elements-img?file=index.tsx)

```tsx
import React from 'react';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { $img } from 'react-rxjs-elements';

function App() {
  const src$ = timer(0, 3000).pipe(
    map(x => (x % 2) ? 'a.jpg' : 'b.jpg')
  );

  return <$img src={ src$ } />
}
```

---

A data fetch (with RxJS [ajax](https://rxjs.dev/api/ajax/ajax)) — [online sandbox](https://stackblitz.com/edit/react-rxjs-elements-fetch?file=index.tsx)

```tsx
import React, { useMemo } from "react";
import { map, switchMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { $ } from "react-rxjs-elements";


function App() {
  const data$ = useMemo(() =>
    ajax.getJSON(URL)
  , []);

  return <$>{data$}</$>;
}
```

---

A counter — [online sandbox](https://stackblitz.com/edit/react-rxjs-elements-counter?file=index.tsx)

```tsx
import React from 'react';
import { $div } from 'react-rxjs-elements';
import { Subject } from 'rxjs';
import { startWith, scan } from 'rxjs/operators';

function App() {
  const subject$ = useMemo(() => new Subject(), []);

  const output$ = useMemo(() =>
    subject$.pipe(
      startWith(0),                   // start with a 0
      scan((acc, curr) => acc + curr) // then add +1 or -1
    )
  , []);

  return <$div>
    <button onClick={()=>subject$.next(-1)}>
      -
    </button>
    
    { output$  /* results would be displayed in place */ }
  
    <button onClick={()=>subject$.next(+1)}>
      +
    </button>
  </$div>
}
```


## 🙂 Enjoy
