import styles, { wrapper } from '../styles/main.scss'
import { S2TubePlayerArgs, Caption, Source } from './Arguments'
import wrap from '../lib/elementWrap'
import mainControls from '../parts/controls/main.pug'
import append from '../lib/elementAppend'
import strToDom from '../lib/strToDom'
import secondFormat from '../lib/SecondFormat'
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
  private progressBar: HTMLDivElement
  private generalProgressBar: HTMLDivElement
  private clickableBar: HTMLDivElement
  private currentTimeEl = HTMLSpanElement
  private totalTimeEl = HTMLSpanElement
  private bufferedProgressBar: HTMLDivElement
  private tooltipEl: HTMLSpanElement
  private durationInterval: any = null
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
    this.el.onplaying = this.onPlaying.bind(this)
    this.el.onended = this.onEnded.bind(this)

    this.clickableBar.onmousemove = this.clickableBarMouseMove.bind(this)

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

    this.clickableBar.addEventListener(
      'click',
      this.changeTimeToSelected.bind(this)
    )

    this.el.onloadeddata = () => {
      this.finishLoad()
      this.onLoad()
    }

    this.el.onwaiting = this.onWaiting.bind(this)

    this.el.onprogress = () => {
      if (this.el.buffered.length) {
        this.showBufferedLength(
          this.el.buffered.start(0),
          this.el.buffered.end(0),
          this.el.duration
        )
      }
    }
  }

  onPlaying() {}

  onPlay() {
    this.container.classList.add(styles.playing)
    this.container.classList.remove(styles.paused)
    this.container.classList.remove(styles.waiting)

    this.updateProgressBar()
    this.durationInterval = setInterval(this.updateProgressBar.bind(this), 1000)
  }
  onPause() {
    this.container.classList.add(styles.paused)
    this.container.classList.remove(styles.playing)
    this.container.classList.remove(styles.waiting)
    if (this.durationInterval !== null) {
      clearInterval(this.durationInterval)
    }
  }
  onWaiting() {
    this.container.classList.add(styles.playing)
    this.container.classList.add(styles.waiting)
  }
  onLoad() {
    this.container.classList.remove(styles.waiting)
    this.container.classList.add(
      this.el.paused ? styles.paused : styles.playing
    )
  }

  onEnded() {
    this.progressBar.style.width = '100%'
    // @ts-ignore
    this.currentTimeEl.innerText = this.totalTimeEl.innerText
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
    this.progressBar = wrapperEl.querySelector(`.${styles.progressBar__inner}`)
    this.generalProgressBar = wrapperEl.querySelector(`.${styles.progressBar}`)
    this.clickableBar = wrapperEl.querySelector(`.${styles.clickableBar}`)
    this.bufferedProgressBar = wrapperEl.querySelector(
      `.${styles.bufferedProgressBar}`
    )
    this.totalTimeEl = wrapperEl.querySelector(`.${styles.totalTime}`)
    this.currentTimeEl = wrapperEl.querySelector(`.${styles.currentTime}`)
    this.tooltipEl = wrapperEl.querySelector(`.${styles.tooltip}`)

    this.el =
      typeof this._rawArgs.el === 'object'
        ? this._rawArgs.el
        : document.querySelector(this._rawArgs.el)
  }

  finishLoad() {
    if (this.autoPlay) {
      this.el.play()
    }
    // @ts-ignore
    this.totalTimeEl.innerText = secondFormat(this.el.duration)
  }
  showBufferedLength(_start: number, end: number, duration: number) {
    const endPercentage = (end * 100) / duration
    this.bufferedProgressBar.style.width = `${endPercentage}%`
  }

  updateProgressBar() {
    const currentTime = secondFormat(this.el.currentTime)
    // @ts-ignore
    this.currentTimeEl.innerText = currentTime
    const percentage = (this.el.currentTime * 100) / this.el.duration
    this.progressBar.style.width = `${percentage}%`
  }

  changeTimeToSelected(e: any) {
    const percentage = this.calculateMouseEventPercentage(e)
    const time = this.getTimeByPercentage(percentage)
    this.el.currentTime = time
    this.el.play()
    this.updateProgressBar()
  }

  calculateMouseEventPercentage(event: any) {
    return (event.offsetX / event.target.offsetWidth) * 100
  }

  getTimeByPercentage(percentage: number) {
    return (percentage * this.el.duration) / 100
  }

  clickableBarMouseMove(e: any) {
    const percentage = this.calculateMouseEventPercentage(e)
    const time = secondFormat(this.getTimeByPercentage(percentage))
    this.tooltipEl.style.left = `${percentage - 3}%`
    this.tooltipEl.innerText = time
  }
}
