/* MeasuringLens marketing site — two small effects, no dependencies. */
(function () {
  'use strict';

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. Hero icon: shrink + fade as the hero scrolls away.

     Scroll position is read in a rAF-throttled listener and mapped to a
     0-1 progress value over the first FADE_DISTANCE pixels. Only opacity
     and transform are touched, so this stays on the compositor and never
     triggers layout — no reflow, no scroll jank.
  ------------------------------------------------------------------ */
  var icon = document.querySelector('[data-hero-icon]');
  var FADE_DISTANCE = 360; // px of scroll over which the icon disappears
  var MIN_SCALE = 0.6;

  if (icon && !reduceMotion) {
    var ticking = false;
    var lastProgress = -1;

    var apply = function () {
      ticking = false;

      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var p = y / FADE_DISTANCE;
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      // Skip redundant style writes (e.g. rubber-banding past the top).
      if (p === lastProgress) return;
      lastProgress = p;

      icon.style.opacity = String(1 - p);
      icon.style.transform = 'scale(' + (1 - (1 - MIN_SCALE) * p) + ')';
    };

    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    apply(); // honour a restored scroll position on load
  }

  /* ------------------------------------------------------------------
     2. Feature blocks: fade + rise in, fade back to 0.2 on the way out.

     The faded state is the CSS default, so anything below the fold starts
     dimmed even before the observer fires.
  ------------------------------------------------------------------ */
  var blocks = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].classList.add('seen', 'is-visible');
    }
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('seen', 'is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    },
    {
      // Shrink the trigger area slightly so blocks settle in before they
      // reach full opacity, and dim once they near the edge again.
      rootMargin: '-8% 0px -8% 0px',
      threshold: 0
    }
  );

  for (var j = 0; j < blocks.length; j++) {
    observer.observe(blocks[j]);
  }
})();
