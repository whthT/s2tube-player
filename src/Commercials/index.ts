import S2TubePlayer from '../S2TubePlayer/index'
import styles from '../styles/main.scss'
import strToDom from '../lib/strToDom'
import CommercialsPlayer from '../parts/CommercialsPlayer/index.pug'
export enum CommercialsShowTypes {
  START = 0,
  END = 100,
  HALF_OF_VIDEO = 50
}

export interface ICommercials {
  type: string
  src: string
  showOn: CommercialsShowTypes | CommercialsShowTypes[] | number
  applySkipIn?: number
  title?: string
  description?: string
  autoSkip?: Boolean
  hideSkipButton?: Boolean
}
interface IImplements extends ICommercials {
  _commercials: ICommercials
  isShowing: Boolean
  isEnded: Boolean

  show: () => void
}
export default class Commercials implements IImplements {
  public _commercials: ICommercials
  public isShowing: Boolean = false
  public isEnded: Boolean = false

  public type: string
  public src: string
  public showOn: CommercialsShowTypes | CommercialsShowTypes[] | number
  public applySkipIn: number
  public title: string
  public description: string
  public parent: S2TubePlayer
  public autoSkip: Boolean
  public hideSkipButton: Boolean

  public commercialsVideoUniqueID: string
  private videoEl: any = null
  private skipButtonEl: HTMLButtonElement

  protected skipInTime: number
  public player: S2TubePlayer
  constructor(commercials: ICommercials, parent: S2TubePlayer) {
    this._commercials = commercials

    this.type = commercials.type
    this.src = commercials.src
    this.showOn = commercials.showOn
    this.applySkipIn = commercials.applySkipIn
    this.skipInTime = commercials.applySkipIn
    this.title = commercials.title
    this.description = commercials.description
    this.autoSkip = commercials.autoSkip
    this.hideSkipButton = commercials.hideSkipButton

    this.parent = parent

    this.commercialsVideoUniqueID = `s2tp_comms_${Math.ceil(
      Math.random() * 1000
    )}`

    const commercialsPlayerDOM = strToDom(
      CommercialsPlayer({
        id: this.commercialsVideoUniqueID,
        styles,
        sources: [
          {
            type: this.type,
            src: this.src,
            size: 720
          }
        ],
        skipInTime: this.skipInTime,
        skipButtonTitle: `Skip In ${this.skipInTime}`,
        hideSkipButton: this.hideSkipButton
      })
    )

    this.videoEl = commercialsPlayerDOM.querySelector('video')
    this.skipButtonEl = commercialsPlayerDOM.querySelector('button')
  }

  show() {
    this.parent.container.parentNode.insertBefore(
      this.videoEl,
      this.parent.container
    )
    this.parent.pause()
    this.player = new S2TubePlayer({
      el: `#${this.commercialsVideoUniqueID}`,
      autoPlay: false,
      sources: [
        {
          src: this.src,
          type: this.type
        }
      ],
      isCommercialsPlayer: true
    })
    this.parent.container.classList.add(styles.showingCommercials)
    this.player.el.classList.remove(styles.hidden)
    this.player.controlsElement.appendChild(this.skipButtonEl)

    this.player.on('tick', this.tick.bind(this))
    this.player.on('ended', this.skipCommercials.bind(this))

    this.player.el.play()
    this.isShowing = true
  }

  tick() {
    if (this.skipInTime > 0) {
      this.skipButtonEl.innerText = `Skip In ${this.skipInTime--}`
      this.isShowing = true
    } else {
      if (this.autoSkip) {
        this.skipCommercials()
      } else {
        this.skipButtonEl.onclick = this.skipCommercials.bind(this)
        this.skipButtonEl.innerText = 'Skip Adv'
      }
    }
  }

  skipCommercials() {
    this.isEnded = true
    this.player.pause()
    this.player.destruction()
    this.parent.container.classList.remove(styles.showingCommercials)
    this.parent.play()
    this.player.fireEvent('commercials:skipped')
  }
}
