import S2TubePlayer from './S2TubePlayer'

new S2TubePlayer({
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
  download: [576]
})
