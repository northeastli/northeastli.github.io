fetch('data/playlist.json')
  .then(res => res.json())
  .then(list => {
    const ap = new APlayer({
      container: document.getElementById('aplayer-container'),
      fixed: true,
      autoplay: true,
      theme: '#FADFA3',
      loop: 'all',
      audio: list
    });
  });
