export default function append(el: any, append: any): any {
  let appendMirror = typeof append === 'object' ? append.outerHTML : append
  el.innerHTML = el.innerHTML + appendMirror
  return el
}
