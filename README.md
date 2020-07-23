# React RxJS fragment that Observes it's content

```
npm i react-rxjs-elements
```

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