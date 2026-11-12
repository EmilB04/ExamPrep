// Apply the saved theme before the app paints. This file is copied into both builds.
;(function () {
  var preference = 'system'
  try {
    var saved = localStorage.getItem('masterprep.theme.v1')
    if (saved === 'light' || saved === 'dark') preference = saved
  } catch (_) {}
  var dark = preference === 'dark' || (preference === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#142225' : '#f4f7f6')
})()
