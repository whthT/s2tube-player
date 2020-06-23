# S2TubePlayer

HTML5 Video player.

### Preview

![General Preview](https://github.com/whthT/s2tube-player/raw/master/_files/screen-001.png 'General Preview')

### Use

HTML

```html
<video id="player"></video>
```

JAVASCRIPT

```js
const player = new S2TubePlayer({
  el: '#player',
  sources: [
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
      size: 576
    },
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
      size: 720
    },
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
      size: 1080
    }
  ]
})
```

### Installation

S2TubePlayer requires [Node.js](https://nodejs.org/) v4+ to run.

Install the dependencies and devDependencies and start the server.

##### Use

```sh
$ npm install s2tube-player
```

```js
// ES6
import S2TubePlayer from 's2tube-player'
import 's2tube-player/dist/S2TubePlayer.css'
const player = new S2TubePlayer({
  /*...*/
})
```

CDN

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link
      rel="stylesheet"
      href="https://raw.githubusercontent.com/whthT/s2tube-player/master/dist/S2TubePlayer.css"
    />
    <script src="https://raw.githubusercontent.com/whthT/s2tube-player/master/dist/S2TubePlayer.js"></script>
  </head>
  <body>
    <video id="player"></video>

    <script>
      const player = new S2TubePlayer({
        /*...*/
      })
    </script>
  </body>
</html>
```

##### Development

```sh
$ cd s2tube-player
$ npm install -d
$ npm run dev
```

For production environments...

```sh
$ npm install --production
$ npm run build
```

### PROPS

| Name     | Type                     | Default | Required | Example                                                         | Description                                                         |
| -------- | ------------------------ | ------- | -------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| el       | HTMLVideoElement\|string | null    | true     | #player or document.getElementById('player')                    | You can pass a CSS selector or direct HTMLVideoElement              |
| autoPlay | boolean                  | false   | false    | true                                                            | Auto play video after load ends.                                    |
| sources  | Array<Source>            | []      | true     | {type: "video/mp4", src: "https://eq.com/video.mp4", size: 720} | You must pass type and src props as required but size not required. |

#### Source Props

| Name | Type   | Default | Required | Example                  | Description         |
| ---- | ------ | ------- | -------- | ------------------------ | ------------------- |
| type | string | null    | true     | video/mp4                | Mime type of video. |
| src  | string | null    | true     | https://ex.com/video.mp4 | Soure of video.     |
| size | number | null    | false    | 480, 720, 1080           | Quality of video.   |

# Commercials

```js
const player = new S2TubePlayer({
  el: '#player',
  sources: [
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
      size: 576
    }
  ],
  commercials: [
    {
      type: 'video/mp4',
      src: '/mov_bbb.mp4',
      showOn: 20,
      title: 'Commercials Title'
    }
  ]
})
```

The `showOn` prop will receive percentage of commercials show on video.
Also its support to second based type like this;

```js
{
  commercials: [
    {
      type: 'video/mp4',
      src: '/mov_bbb.mp4',
      showOn: '00:20'
    }
  ]
}
```

##### Commercials Previews

![Commercials Previews Progressbar](https://github.com/whthT/s2tube-player/raw/master/_files/screen-002.png 'Commercials Previews Progressbar')

##### In Adv

![Commercials Previews In Adv](https://github.com/whthT/s2tube-player/raw/master/_files/screen-003.png 'Commercials Previews In Adv')

##### Skip Button Active

![Skip Button Active](https://github.com/whthT/s2tube-player/raw/master/_files/screen-004.png 'Skip Button Active')

#### Duplicated Commercials

You can duplicate easily your commercials like this.

```js
{
  commercials: [
    {
      type: 'video/mp4',
      src: '/mov_bbb.mp4',
      showOn: [
        S2TubePlayer.CommercialsShowTypes.START,
        S2TubePlayer.CommercialsShowTypes.HALF_OF_VIDEO,
        S2TubePlayer.CommercialsShowTypes.END
      ]
    }
  ]
}
```

Becomes to;  
![Duplicated Commercials](https://github.com/whthT/s2tube-player/raw/master/_files/screen-005.png 'Duplicated Commercials')

## Events

```js
const player = new S2TubePlayer({
  el: '#player',
  sources: [
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
      size: 576
    }
  ]
})

player.on('play', () => {
  // add listener to play event
})

player.off('play', () => {
  // remove listener from play event
})
```

##### Supported Events

    - play
    - pause
    - waiting
    - load
    - ended
    - tick
    - commercials:skipped

#### Commercials Props

| Name           | Type           | Default | Required | Example                       | Description                                            |
| -------------- | -------------- | ------- | -------- | ----------------------------- | ------------------------------------------------------ |
| type           | string         | null    | true     | video/mp4                     | Mime type of video                                     |
| src            | string         | null    | true     | https://example.com/video.mp4 | Source of commercials video                            |
| showOn         | number\|string | null    | true     | 0, [0, 5], ['00:10', 50]      | Percentage of commercials show or duration to show     |
| applySkipIn    | number         | 5       | false    | 15                            | Allow clickable skip commercials button in seconds.    |
| title          | string         | null    | false    | Free Premium Today            | Commercials title on progressbar. Only shows on hover. |
| autoSkip       | boolean        | false   | false    | true                          | Skip commercials video after applySkipIn seconds up.   |
| hideSkipButton | boolean        | false   | false    | true                          | Hide skip commercials button.                          |

#### Source

You can manage sources easily.

```js
const player = new S2TubePlayer({
  el: '#player',
  sources: [
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
      size: 576
    },
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
      size: 720
    },
    {
      type: 'video/mp4',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
      size: 1080
    }
  ]
})
```

Becomes to  
![Source Management](https://github.com/whthT/s2tube-player/raw/master/_files/screen-006.png 'Source Management')

### Todos

- Write Tests
- Add Keyboard Shortcuts

## License

MIT

**Free Software, Hell Yeah!**
