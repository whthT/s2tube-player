export default function strToDom(str: string) {
  return new DOMParser().parseFromString(str, 'text/html')
}
