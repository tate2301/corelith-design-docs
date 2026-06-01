/* Huchu DS — device-frame zoom-out on mobile
 * Scans the page for `.device-desktop` and `.device-tablet` frames inside
 * `.kit-stage`. On phone-width viewports (<=720px), scales each frame so the
 * full layout fits inside the viewport (zoom-out preview), and sizes the
 * surrounding `.kit-stage` to match the scaled visual height.
 *
 * Reads each frame's intrinsic width (set by its CSS), so it works whether
 * a screen author chose 820, 1024, 1280, etc.
 */
(function () {
  const PAD = 16;     // horizontal padding around device

  // Use a fixed sensor element to measure the actual viewport width,
  // independent of any content overflow from un-scaled device frames.
  function getViewportWidth() {
    let sensor = document.getElementById('__vw_sensor__');
    if (!sensor) {
      sensor = document.createElement('div');
      sensor.id = '__vw_sensor__';
      sensor.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:0;pointer-events:none;visibility:hidden;';
      document.body.appendChild(sensor);
    }
    return sensor.getBoundingClientRect().width;
  }

  function applyScale() {
    const vpW = getViewportWidth();
    let didScale = false;
    document.querySelectorAll('.kit-stage').forEach(stage => {
      const dev = stage.querySelector('.device-desktop, .device-tablet');
      if (!dev) return;

      // Reset first
      dev.style.transform = '';
      dev.style.transformOrigin = '';
      stage.style.height = '';
      stage.style.minHeight = '';
      stage.style.overflow = '';
      stage.style.padding = '';
      stage.style.display = '';

      // Read intrinsic size after reset
      const w = dev.offsetWidth || (dev.classList.contains('device-desktop') ? 1280 : 820);
      const h = dev.offsetHeight || (dev.classList.contains('device-desktop') ? 760 : 620);

      const avail = Math.max(280, vpW - PAD);
      // Device already fits — no scaling needed
      if (w + PAD <= vpW) return;

      const scale = avail / w;
      // Position the device absolutely so it sits at the top-left of the
      // stage's content box regardless of the stage's pre-existing layout.
      dev.style.transform = `scale(${scale})`;
      dev.style.transformOrigin = 'top left';
      dev.style.position = 'absolute';
      dev.style.left = '8px';
      dev.style.top = '8px';
      dev.style.margin = '0';
      stage.style.position = 'relative';
      stage.style.padding = '0';
      stage.style.display = 'block';
      stage.style.overflow = 'hidden';
      stage.style.height = (h * scale + 16) + 'px';
      stage.style.minHeight = '0';
      stage.style.width = '100%';
      stage.style.maxWidth = '100vw';
      stage.style.boxSizing = 'border-box';
      stage.style.placeItems = '';
      didScale = true;
    });
    // When we've scaled, override body styles that some pages set (display:grid,
    // place-items:center, padding:24px) which would otherwise lay the body out
    // around the un-scaled 1280px device frame.
    if (didScale) {
      document.body.style.padding = '0';
      document.body.style.minHeight = '';
      document.body.style.display = 'block';
      document.body.style.placeItems = '';
    } else {
      document.body.style.padding = '';
      document.body.style.display = '';
      document.body.style.placeItems = '';
    }
  }

  // Run after layout so offsetWidth/sensor are real. Re-run on the next
  // animation frame too — once we've scaled and overridden body styles, the
  // viewport width may have changed (page no longer needs horizontal scroll).
  function init() {
    applyScale();
    requestAnimationFrame(() => {
      requestAnimationFrame(applyScale);
    });
    let raf;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyScale);
    });
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
