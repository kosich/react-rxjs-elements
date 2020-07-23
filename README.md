# React fragment for RxJS content

[![NPM](https://img.shields.io/npm/v/react-rxjs-elements)](https://www.npmjs.com/package/react-rxjs-elements) [![Bundlephobia](https://img.shields.io/bundlephobia/minzip/react-rxjs-elements?label=gzipped)](https://bundlephobia.com/result?p=react-rxjs-elements@0.0.1) [![MIT license](https://img.shields.io/npm/l/react-rxjs-elements)](https://opensource.org/licenses/MIT)


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

## Enjoy 🙂 