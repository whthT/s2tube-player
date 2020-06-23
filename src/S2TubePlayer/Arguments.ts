import { ICommercials } from '../Commercials/index'

export interface Caption {
  label: string
  src: string
  isDefault?: boolean
  lang: string
}
export interface Source {
  type: string
  src: string
  size?: number
  el?: HTMLSourceElement
}

export interface S2TubePlayerArgs {
  el: HTMLVideoElement | any
  autoPlay?: boolean
  controls?: boolean
  captions?: Caption[]
  download?: number | number[]
  sources: Source[]
  commercials?: ICommercials[]
  isCommercialsPlayer?: Boolean
}
