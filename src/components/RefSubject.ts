import { ReplaySubject } from "rxjs";


export class RefSubject<T> extends ReplaySubject<T> {
  private _value: T | undefined = void 0;
  public get value(): T | undefined {
    return this._value;
  };

  constructor() {
    // always 1 last value replay
    super(1);

    // NOTE: compiled library seem to be overriding Subject .next in
    // constructor, which corrupts traditional class method override
    const _next = this.next;
    this.next = function next(value: T) {
      this._value = value;
      _next.call(this, value);
    }
  }

}
