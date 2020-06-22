import S2TubePlayer from './S2TubePlayer'

const player = new S2TubePlayer({
  el: '#player',
  autoPlay: false,
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
  ],
  captions: [
    {
      label: 'English',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.en.vtt',
      isDefault: true,
      lang: 'en'
    },
    {
      label: 'Français',
      src:
        'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.fr.vtt',
      lang: 'fr'
    }
  ],
  commercials: [
    {
      type: 'video/mp4',
      src: '/mov_bbb.mp4',
      showOn: [S2TubePlayer.CommercialsShowTypes.START, 10, 20, 30, 40, 50, 80],
      title: 'Related Commercials'
    }
  ]
})

console.log(player)
