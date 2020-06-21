export interface Caption {
  label: string
  src: string
  isDefault?: boolean
  lang: string
}
export interface Source {
  type: string
  src: string
  size: number
  el?: HTMLSourceElement
}
export interface S2TubePlayerArgs {
  el: HTMLVideoElement
  autoPlay?: boolean
  controls?: boolean
  captions: Caption[]
  download: number | number[]
  sources: Source[]
}
