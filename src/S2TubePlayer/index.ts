import styles from '../styles/main.scss'
import { S2TubePlayerArgs, Caption, Source } from './Arguments'
import wrap from '../lib/elementWrap'
import mainControls from '../parts/controls/main.pug'
import append from '../lib/elementAppend'
import strToDom from '../lib/strToDom'
// @ts-ignore
import only from 'only'
export default class S2TubePlayer implements S2TubePlayerArgs {
  public el: HTMLVideoElement = null
  public autoPlay: boolean = false
  public controls: boolean = false
  public captions: Caption[] = []
  public download: number | number[] = null
  public sources: Source[] = []

  public container: any
  private _rawArgs: S2TubePlayerArgs
  private controlsElement: HTMLDivElement
  constructor(args: S2TubePlayerArgs) {
    this._rawArgs = args

    this.sources = args.sources || []
    this.captions = args.captions || []
    this.download = args.download || null

    this.el = this.getVideoElement(args.el)
    this.container = this.createElement('div', {
      class: `${styles.wrapper} ${styles.paused}`
    })

    this.initializeStructure()
    this.registerVideoEvents()
  }

  createElement(tag: string, props: any = {}): any {
    return this.elementPropModifier(document.createElement(tag), props)
  }

  elementPropModifier(
    el: any | HTMLElement,
    props: { [key: string]: string }
  ): any {
    for (const propName in props) {
      el.setAttribute(propName, props[propName])
    }
    return el
  }

  getVideoElement(selector: string | HTMLVideoElement): any {
    let el =
      typeof selector === 'object' ? selector : document.querySelector(selector)
    this.autoPlay =
      this._rawArgs.autoPlay || el.getAttribute('autoplay') === 'true'
    this.controls =
      this._rawArgs.controls || el.getAttribute('controls') === 'true'

    el = this.elementPropModifier(el, {
      class: styles.video__inner
    })

    const sources = this.sources.map((source) =>
      this.createElement('source', source)
    )

    for (const source of sources) {
      el.appendChild(source)
    }
    // @ts-ignore
    el.load()

    el.removeAttribute('controls')
    el.removeAttribute('autoplay')
    return el
  }

  registerVideoEvents() {
    this.el.onplay = this.onPlay.bind(this)
    this.el.onpause = this.onPause.bind(this)

    const playPauseFnc = () => {
      if (this.el.paused) {
        this.el.play()
      } else {
        this.el.pause()
      }
    }

    this.controlsElement
      .querySelector(`.${styles.bigPlayPauseButton}`)
      .addEventListener('click', playPauseFnc)
    this.controlsElement
      .querySelector(`.${styles.playPauseButton}`)
      .addEventListener('click', playPauseFnc)

    this.el.onloadeddata = () => {
      this.finishLoad()
      this.onLoad()
    }

    this.el.onwaiting = this.onWaiting.bind(this)

    this.el.onprogress = () => {
      if (this.el.buffered.length) {
        console.log('BUFFERED', this.el.buffered.end(0))
      }
    }
  }

  onPlay() {
    this.container.classList.add(styles.playing)
    this.container.classList.remove(styles.paused)
    this.container.classList.remove(styles.waiting)
  }
  onPause() {
    this.container.classList.add(styles.paused)
    this.container.classList.remove(styles.playing)
    this.container.classList.remove(styles.waiting)
  }
  onWaiting() {
    this.container.classList.remove(styles.playing)
    this.container.classList.remove(styles.paused)
    this.container.classList.add(styles.waiting)
  }
  onLoad() {
    this.container.classList.remove(styles.waiting)
    this.container.classList.add(
      this.el.paused ? styles.paused : styles.playing
    )
  }

  initializeStructure() {
    const videoWrapper = wrap(
      this.el,
      this.createElement('div', { class: styles.video })
    )
    this.container = wrap(videoWrapper, this.container)
    const controlsDOM = strToDom(
      mainControls({
        styles
      })
    )

    const wrapperEl = append(this.container, controlsDOM.querySelector('div'))
    this.controlsElement = wrapperEl.querySelector(`.${styles.controls}`)

    this.el =
      typeof this._rawArgs.el === 'object'
        ? this._rawArgs.el
        : document.querySelector(this._rawArgs.el)
  }

  finishLoad() {
    if (this.autoPlay) {
      this.el.play()
    }
  }
}
