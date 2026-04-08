'use strict';

(function () {
  var KEY = 'cookie_consent';

  function loadAdSense() {
    if (document.querySelector('script[data-adsrc]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5781805243086278';
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-adsrc', '1');
    document.head.appendChild(s);
  }

  function hideBanner() {
    var b = document.getElementById('cookie-banner');
    if (!b) return;
    b.style.transition = 'opacity .3s, transform .3s';
    b.style.opacity = '0';
    b.style.transform = 'translateY(100%)';
    setTimeout(function () { b.style.display = 'none'; }, 320);
  }

  window.acceptCookies = function () {
    localStorage.setItem(KEY, 'all');
    hideBanner();
    loadAdSense();
  };

  window.rejectCookies = function () {
    localStorage.setItem(KEY, 'necessary');
    hideBanner();
  };

  document.addEventListener('DOMContentLoaded', function () {
    var consent = localStorage.getItem(KEY);
    if (!consent) {
      var b = document.getElementById('cookie-banner');
      if (b) {
        b.style.display = 'block';
        /* small delay so the slide-in animation plays */
        setTimeout(function () {
          b.style.opacity = '1';
          b.style.transform = 'translateY(0)';
        }, 80);
      }
    } else if (consent === 'all') {
      loadAdSense();
    }
  });
})();
