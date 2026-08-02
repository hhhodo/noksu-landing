(() => {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  navToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-scrolled');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach((el) => io.observe(el));

  // ---------- flavor track: mouse/pen drag-to-scroll (touch already swipes natively) ----------
  const track = document.getElementById('flavorTrack');
  if (track) {
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    const endDrag = () => { isDown = false; };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);
    track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // ---------- center-focus: the card nearest the track's center "escapes" the row ----------
    const cards = [...track.querySelectorAll('.flavor-card')];
    let ticking = false;
    const updateActive = () => {
      ticking = false;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closest = null;
      let closestDist = Infinity;
      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - trackCenter);
        if (dist < closestDist) { closestDist = dist; closest = card; }
      });
      cards.forEach((card) => card.classList.toggle('is-active', card === closest));
    };
    track.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
    }, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
  }
})();
