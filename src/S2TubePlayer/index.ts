import styles from '../styles/main.scss'
import { S2TubePlayerArgs, Caption, Source } from './Arguments'
import wrap from '../lib/elementWrap'
import mainControls from '../parts/controls/main.pug'
import append from '../lib/elementAppend'
import strToDom from '../lib/strToDom'
import secondFormat from '../lib/SecondFormat'
// @ts-ignore
import Cookies from 'js-cookie'
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
  private clickableBar: HTMLDivElement
  private currentTimeEl = HTMLSpanElement
  private totalTimeEl = HTMLSpanElement
  private bufferedProgressBar: HTMLDivElement
  private tooltipEl: HTMLSpanElement
  private durationInterval: any = null
  private previouslyVolume: number = 0.6
  private isFullscreen: Boolean = false
  private activeSourceSize: number = null
  private isConfigsMenuOpened: Boolean = false
  constructor(args: S2TubePlayerArgs) {
    this._rawArgs = args

    this.sources = args.sources
      ? args.sources.sort((source) => source.size).reverse()
      : []
    this.captions = args.captions || []
    this.download = args.download || null
    this.onInit()
    this.el = this.getVideoElement(args.el)
    this.container = this.createElement('div', null, {
      class: `${styles.wrapper} ${styles.paused}`
    })

    this.initializeStructure()
    this.registerVideoEvents()
  }

  createElement(tag: string, text: string | any = null, props: any = {}): any {
    const element = document.createElement(tag)
    if (text) {
      element.innerText = text
    }
    return this.elementPropModifier(element, props)
  }

  elementPropModifier(
    el: any | HTMLElement,
    props: { [key: string]: string }
  ): any {
    for (const propName in props) {
      if (props[propName]) {
        el.setAttribute(propName, props[propName])
      }
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

    this.sources = this.sources.map((source) => ({
      ...source,
      el: this.createElement('source', null, source)
    }))
    const cookiedSourceSize = Cookies.get('s2tube_player_active_source')

    const activeSource = this.sources.find(
      (source) => source.size == cookiedSourceSize
    )

    el.appendChild(activeSource ? activeSource.el : this.sources[0].el)
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
    this.el.onvolumechange = this.onVolumeChange.bind(this)

    this.clickableBar.onmousemove = this.clickableBarMouseMove.bind(this)

    this.controlsElement
      .querySelector(`.${styles.bigPlayPauseButton}`)
      .addEventListener('click', this.togglePlayPause.bind(this))
    this.controlsElement
      .querySelector(`.${styles.playPauseButton}`)
      .addEventListener('click', this.togglePlayPause.bind(this))
    this.controlsElement
      .querySelector(`.${styles.volume}`)
      .addEventListener('click', this.toggleMute.bind(this))

    this.controlsElement
      .querySelector(`.${styles.volumeRangeClickableBar}`)
      .addEventListener('click', this.handleVolumeRangeClickOrDrag.bind(this))

    this.clickableBar.addEventListener(
      'click',
      this.changeTimeToSelected.bind(this)
    )

    this.controlsElement
      .querySelector(`.${styles.fullscreenToggle}`)
      .addEventListener('click', this.toggleFullscreen.bind(this))

    this.controlsElement
      .querySelector(`.${styles.configsMenuTrigger}`)
      .addEventListener('click', this.toggleConfigsMenu.bind(this))

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

  onPlaying() {
    this.container.classList.remove(styles.waiting)
  }

  onInit() {
    const cookieActiveSource = Cookies.get('s2tube_player_active_source')
    let source = this.sources[0].size
    if (cookieActiveSource) {
      const _source = this.sources.find(
        (source) => source.size == cookieActiveSource
      )
      if (_source) {
        source = _source.size
      }
    }

    Cookies.set('s2tube_player_active_source', source)
    this.activeSourceSize = source
  }

  onPlay() {
    this.container.classList.add(styles.playing)
    this.container.classList.remove(styles.paused)

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

  onVolumeChange() {
    const percentage = (this.el.volume * 100) / 1
    this.container.querySelector(
      `.${styles.volumeRangeActiveBar}`
    ).style.width = `${percentage}%`
    if (this.el.volume === 0) {
      this.container.classList.add(styles.muted)
      this.container.classList.remove(styles.volumeLow)
      this.container.classList.remove(styles.volumeHigh)
    } else {
      this.container.classList.remove(styles.muted)
      if (percentage >= 40) {
        this.container.classList.remove(styles.volumeLow)
        this.container.classList.add(styles.volumeHigh)
      } else {
        this.container.classList.remove(styles.volumeHigh)
        this.container.classList.add(styles.volumeLow)
      }
    }

    Cookies.set('s2tube_player_volume', this.el.volume.toFixed(3))
  }

  initializeStructure() {
    const videoWrapper = wrap(
      this.el,
      this.createElement('div', null, { class: styles.video })
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

    this.placeSourcesToConfigMenu()
  }

  placeSourcesToConfigMenu() {
    const configMenuSourcesListEl = this.container.querySelector(
      `.${styles.configMenuSourceList}`
    )
    for (const source of this.sources) {
      const sourceElement = this.createElement('a', `${source.size}P`, {
        href: '#',
        'data-size': source.size,
        class: this.activeSourceSize === source.size ? styles.active : null
      })
      sourceElement.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault()
        this.setActiveSourceSize(source)
      })
      configMenuSourcesListEl.appendChild(sourceElement)
    }
  }

  finishLoad() {
    if (this.autoPlay) {
      setTimeout(() => {
        this.el.play()
      }, 2000)
    }
    // @ts-ignore
    this.totalTimeEl.innerText = secondFormat(this.el.duration)

    const cookieVolume = Cookies.get('s2tube_player_volume')
    const isMuted = Cookies.get('s2tube_player_muted') === 'true'
    if (!isMuted) {
      if (cookieVolume && parseFloat(cookieVolume)) {
        this.el.volume = parseFloat(cookieVolume)
      } else {
        this.el.volume = 0.6
      }
    } else {
      this.el.volume = 0
    }
    // Trigger one time for volume ranges
    this.onVolumeChange()
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

  toggleMute() {
    const isMuted = !(this.el.volume > 0)
    if (!isMuted) {
      this.previouslyVolume = this.el.volume
      this.el.volume = 0
    } else {
      this.el.volume = this.previouslyVolume
    }
    Cookies.set('s2tube_player_muted', !isMuted)
  }

  togglePlayPause() {
    if (this.el.paused) {
      this.el.play()
    } else {
      this.el.pause()
    }
  }
  handleVolumeRangeClickOrDrag(event: any) {
    const percentage = this.calculateMouseEventPercentage(event)
    const volume = (percentage * 1) / 100
    this.el.volume = volume
    Cookies.remove('s2tube_player_muted')
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen
    var elem: any = document.documentElement
    if (this.isFullscreen) {
      this.container.classList.add(styles.fullscreen)
      if (elem.requestFullscreen) {
        elem.requestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen()
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen()
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen()
      }
    } else {
      this.container.classList.remove(styles.fullscreen)
      if (document.exitFullscreen) {
        document.exitFullscreen()
        // @ts-ignore
      } else if (document.mozCancelFullScreen) {
        // @ts-ignore
        document.mozCancelFullScreen()
        // @ts-ignore
      } else if (document.webkitExitFullscreen) {
        // @ts-ignore
        document.webkitExitFullscreen()
        // @ts-ignore
      } else if (document.msExitFullscreen) {
        // @ts-ignore
        document.msExitFullscreen()
      }
    }
  }

  setActiveSourceSize(source: Source) {
    this.activeSourceSize = source.size
    Cookies.set('s2tube_player_active_source', this.activeSourceSize)
    const currentTime = this.el.currentTime
    this.el.querySelector('source').remove()
    this.el.appendChild(source.el)
    this.el.load()
    this.el.currentTime = currentTime
    this.el.play()

    this.controlsElement
      .querySelector(`.${styles.configMenuSourceList} a.${styles.active}`)
      .classList.remove(styles.active)

    this.controlsElement
      .querySelector(
        `.${styles.configMenuSourceList} a[data-size='${source.size}']`
      )
      .classList.add(styles.active)

    this.toggleConfigsMenu()
  }

  toggleConfigsMenu() {
    this.isConfigsMenuOpened = !this.isConfigsMenuOpened
    this.controlsElement
      .querySelector(`.${styles.configsMenuTrigger}`)
      .classList[this.isConfigsMenuOpened ? 'add' : 'remove'](
        styles.configsMenuOpened
      )
  }
}
