/**
 * preset intrinsic elements
 *
 * Q: should we prefab all possible elements?
 * Q: should that be statically generated on build or created on demand?
 */

import { createElement$ } from "./elements";

export const $a = createElement$("a");
export const $img = createElement$("img");

export const $h1 = createElement$("h1");
export const $h2 = createElement$("h2");
export const $h3 = createElement$("h3");
export const $h4 = createElement$("h4");
export const $h5 = createElement$("h5");
export const $h6 = createElement$("h6");

export const $p = createElement$("p");
export const $span = createElement$("span");
export const $div = createElement$("div");

export const $form = createElement$("form");
export const $input = createElement$("input");
export const $textarea = createElement$("textarea");
export const $select = createElement$("select");
export const $button = createElement$("button");
