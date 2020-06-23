export default function removeElement(el: any) {
  // @ts-ignore
  const isIE11 = !!window.MSInputMethodContext && !!document.documentMode
  if (isIE11) {
    el.parentNode.removeChild(el)
  } else {
    el.remove()
  }
}
