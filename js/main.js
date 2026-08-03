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

  // ---------- flavor track: infinite loop (clone set before/after) + drag + arrows ----------
  const track = document.getElementById('flavorTrack');
  if (track) {
    // Triplicate the card set (clone-before + originals + clone-after) so scrolling in
    // either direction always has real content to land on. A scroll listener silently
    // (behavior:'auto', no animation) snaps back into the middle "real" set whenever the
    // user drifts into a clone zone — since the clone is pixel-identical to the original
    // at that position, the jump is invisible, giving a seamless infinite loop both ways.
    const originals = [...track.querySelectorAll('.flavor-card')];
    const cloneSet = () => originals.map((card) => {
      const clone = card.cloneNode(true);
      clone.classList.add('is-visible'); // clones skip the scroll-reveal entrance
      return clone;
    });
    const before = cloneSet();
    const after = cloneSet();
    before.forEach((el) => track.insertBefore(el, track.firstChild));
    after.forEach((el) => track.appendChild(el));

    const cards = [...track.querySelectorAll('.flavor-card')];
    const setWidth = () => track.scrollWidth / 3;

    // Jump (no animation) to the start of the middle/original set.
    track.scrollLeft = setWidth();

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

    // ---------- infinite wrap: silently re-center once scrolled a full set away ----------
    const wrapIfNeeded = () => {
      const w = setWidth();
      if (track.scrollLeft < w * 0.5) {
        track.scrollLeft += w;
      } else if (track.scrollLeft > w * 1.5) {
        track.scrollLeft -= w;
      }
    };

    track.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => { updateActive(); wrapIfNeeded(); });
      }
    }, { passive: true });
    window.addEventListener('resize', () => { track.scrollLeft = setWidth(); updateActive(); });
    updateActive();

    // ---------- prev/next arrows: step by one card width, always enabled (infinite) ----------
    const prevBtn = document.getElementById('flavorPrev');
    const nextBtn = document.getElementById('flavorNext');
    const step = (dir) => {
      const gap = parseFloat(getComputedStyle(track).columnGap || 0);
      track.scrollBy({ left: dir * (originals[0].offsetWidth + gap), behavior: 'smooth' });
    };
    prevBtn?.addEventListener('click', () => step(-1));
    nextBtn?.addEventListener('click', () => step(1));
  }

  // ---------- hero pagination: clicking a small circle swaps the hero copy + tint ----------
  const heroInfo = document.getElementById('heroInfo');
  const heroAlc = document.getElementById('heroAlc');
  const heroName = document.getElementById('heroName');
  const heroDesc = document.getElementById('heroDesc');
  const heroTint = document.getElementById('heroTint');
  const heroBubbles = document.querySelectorAll('.hero__bubble');

  heroBubbles.forEach((bubble) => {
    bubble.addEventListener('click', () => {
      if (bubble.classList.contains('is-active')) return;
      heroBubbles.forEach((b) => b.classList.remove('is-active'));
      bubble.classList.add('is-active');

      heroInfo.classList.add('is-swapping');
      window.setTimeout(() => {
        heroAlc.textContent = bubble.dataset.alc;
        heroName.textContent = bubble.dataset.name;
        heroDesc.textContent = bubble.dataset.desc;
        heroTint.style.backgroundColor = bubble.dataset.tint;
        heroInfo.classList.remove('is-swapping');
      }, 200);
    });
  });
})();
