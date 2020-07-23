# React RxJS fragment that Observes it's content

```
npm i react-rxjs-elements
```

Try it [online](https://stackblitz.com/edit/react-rxjs-elements?file=index.tsx)!

## Usage

```js
import React from 'react';
import { $ } from 'react-rxjs-elements';

function App(){
  return <div>
    <$>{ timer(0, 1000) } sec</$>
  </div>
}
```