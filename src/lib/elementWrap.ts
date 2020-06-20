export default function wrap(
  el: HTMLElement,
  wrapper: HTMLElement
): HTMLElement {
  el.parentNode.insertBefore(wrapper, el)
  wrapper.appendChild(el)

  return wrapper
}
