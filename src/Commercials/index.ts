import S2TubePlayer from '../S2TubePlayer/index'
import styles from '../styles/main.scss'
import strToDom from '../lib/strToDom'
import CommercialsPlayer from '../parts/CommercialsPlayer/index.pug'
import secondFormat from '../lib/SecondFormat'
export enum CommercialsShowTypes {
  START = 0,
  END = 100,
  HALF_OF_VIDEO = 50
}

export interface ICommercials {
  type: string
  src: string
  showOn: CommercialsShowTypes | CommercialsShowTypes[] | number | string
  applySkipIn?: number
  title?: string
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
  public showOn: CommercialsShowTypes | CommercialsShowTypes[] | number | string
  public applySkipIn: number
  public title: string
  public parent: S2TubePlayer
  public autoSkip: Boolean
  public hideSkipButton: Boolean

  public commercialsVideoUniqueID: string
  private videoEl: any = null
  private skipButtonEl: HTMLButtonElement
  public progressbarPositionPercentage: number

  protected skipInTime: number
  public player: S2TubePlayer
  constructor(commercials: ICommercials, parent: S2TubePlayer) {
    this._commercials = commercials
    this.parent = parent

    this.type = commercials.type
    this.src = commercials.src
    this.showOn = commercials.showOn
    this.applySkipIn = commercials.applySkipIn
    this.skipInTime = commercials.applySkipIn
    this.title = commercials.title
    this.autoSkip = commercials.autoSkip || false
    this.hideSkipButton = commercials.hideSkipButton || false

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

    if (!this.hideSkipButton) {
      this.skipButtonEl = commercialsPlayerDOM.querySelector('button')
    }
  }

  getProgressbarPositionPercentage() {
    if (typeof this.showOn === 'string') {
      const totalVideoDuration = new Date(
        `01-01-2000 ${secondFormat(this.parent.el.duration, true)}`
      )
      const commercialsShowOnDuration = new Date(
        `01-01-2000 ${this.showOn.split(':').length <= 2 ? '00:' : ''}${
          this.showOn
        }`
      )

      const leftingDuration =
        // @ts-ignore
        (totalVideoDuration - commercialsShowOnDuration) / 1000

      return (
        ((this.parent.el.duration - leftingDuration) * 100) /
        this.parent.el.duration
      )
    } else {
      return Number(this.showOn)
    }
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
    if (!this.hideSkipButton) {
      this.player.controlsElement.appendChild(this.skipButtonEl)
    }

    this.player.on('tick', this.tick.bind(this))
    this.player.on('ended', this.skipCommercials.bind(this))

    this.player.el.play()
    this.isShowing = true
  }

  tick() {
    if (this.skipInTime > 0) {
      if (!this.hideSkipButton) {
        this.skipButtonEl.innerText = `Skip In ${this.skipInTime--}`
      }
      this.isShowing = true
    } else {
      if (this.autoSkip) {
        this.skipCommercials()
      } else if (!this.hideSkipButton) {
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
