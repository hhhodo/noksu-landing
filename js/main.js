(() => {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const navDrawer = document.getElementById('navDrawer');
  navToggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.textContent = isOpen ? '✕' : '≡';
  });
  navDrawer?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '≡';
    });
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
    // insertBefore(el, track.firstChild) would silently reverse the "before" set, since
    // firstChild changes to the just-inserted node on every iteration. Anchor to the
    // original first card instead — a fixed reference — so order is preserved.
    const firstOriginal = track.firstChild;
    before.forEach((el) => track.insertBefore(el, firstOriginal));
    after.forEach((el) => track.appendChild(el));

    const cards = [...track.querySelectorAll('.flavor-card')];
    // scrollWidth/3 is NOT exactly one set's width: gap is applied uniformly across all
    // 18 cloned cards (17 gaps total, not a clean 3x6), so dividing by 3 drifts by a
    // fraction of a gap. That drift meant each wrap-correction jump landed slightly off
    // the identical layout position, causing a visible flicker/double-render right at
    // the moment of correction. Measure the true distance directly instead: the pixel
    // offset between the first card of the "before" clone set and the first card of the
    // "original" set IS exactly one set's width, immune to gap-rounding.
    const setWidth = () => cards[originals.length].offsetLeft - cards[0].offsetLeft;

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
    // Only runs once scrolling has actually settled (debounced) — correcting scrollLeft
    // mid-flight during an in-progress smooth-scroll animation (from the arrow buttons)
    // fights the browser's own animation and causes visible stutter/lag right around
    // whichever card happens to straddle the wrap boundary.
    const wrapIfNeeded = () => {
      const w = setWidth();
      if (track.scrollLeft < w * 0.5) {
        track.scrollLeft += w;
      } else if (track.scrollLeft > w * 1.5) {
        track.scrollLeft -= w;
      }
    };
    let wrapTimer = null;

    track.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActive);
      }
      clearTimeout(wrapTimer);
      wrapTimer = setTimeout(wrapIfNeeded, 120);
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

  // ---------- hero pagination: clicking a dot, or swiping the hero, swaps copy + photo ----------
  const heroSection = document.querySelector('.hero');
  const heroInfo = document.getElementById('heroInfo');
  const heroAlc = document.getElementById('heroAlc');
  const heroName = document.getElementById('heroName');
  const heroDesc = document.getElementById('heroDesc');
  const heroMedia = document.getElementById('heroMedia');
  const heroBubbles = [...document.querySelectorAll('.hero__bubble')];

  const activateBubble = (bubble) => {
    if (!bubble || bubble.classList.contains('is-active')) return;
    heroBubbles.forEach((b) => b.classList.remove('is-active'));
    bubble.classList.add('is-active');

    heroInfo.classList.add('is-swapping');
    heroMedia.style.opacity = 0;
    window.setTimeout(() => {
      heroAlc.textContent = bubble.dataset.alc;
      heroName.textContent = bubble.dataset.name;
      heroDesc.textContent = bubble.dataset.desc;
      if (bubble.dataset.media) heroMedia.style.backgroundImage = `url('${bubble.dataset.media}')`;
      heroInfo.classList.remove('is-swapping');
      heroMedia.style.opacity = 1;
    }, 200);
  };

  heroBubbles.forEach((bubble) => {
    bubble.addEventListener('click', () => activateBubble(bubble));
  });

  // Swipe the hero photo itself to step through flavors — same activation path as
  // clicking a dot, just driven by a touch gesture instead.
  if (heroSection) {
    let touchStartX = 0;
    let touchStartY = 0;

    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return; // too short, or a vertical scroll
      const activeIndex = heroBubbles.findIndex((b) => b.classList.contains('is-active'));
      const step = dx < 0 ? 1 : -1; // swipe left -> next, swipe right -> previous
      const nextIndex = (activeIndex + step + heroBubbles.length) % heroBubbles.length;
      activateBubble(heroBubbles[nextIndex]);
    }, { passive: true });
  }
})();
