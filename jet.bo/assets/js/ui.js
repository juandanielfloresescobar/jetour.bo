// Minimal UI interactions for navigation, scroll controls and corporate animations
(function () {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const header = document.querySelector('.brand-shell');
  const progressBar = document.querySelector('[data-scroll-progress]');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const banner = document.querySelector('[data-model-banner]');
  const bannerImage = banner?.querySelector('[data-banner-image]');
  const bannerClose = banner?.querySelector('[data-banner-close]');
  let bannerHideTimer = null;
  let bannerConcealTimer = null;
  let bannerPointerTimer = null;
  const HOVER_HIDE_DELAY = 120;

  const setActiveNav = (sectionId) => {
    if (!navLinks.length) return;
    navLinks.forEach((link) => {
      const isActive = link.dataset.navLink === sectionId;
      link.classList.toggle('is-active', isActive);
    });
  };

  const updateProgress = () => {
    if (!progressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.hidden = expanded;
    });
  }

  const showBanner = (link) => {
    if (!banner) return;
    const src = link.dataset.bannerSrc;
    if (!src) return;
    if (bannerPointerTimer) {
      window.clearTimeout(bannerPointerTimer);
      bannerPointerTimer = null;
    }
    if (bannerHideTimer) {
      window.clearTimeout(bannerHideTimer);
      bannerHideTimer = null;
    }
    if (bannerConcealTimer) {
      window.clearTimeout(bannerConcealTimer);
      bannerConcealTimer = null;
    }
    if (bannerImage) {
      if (bannerImage.getAttribute('src') !== src) {
        bannerImage.setAttribute('src', src);
      }
      if (link.dataset.bannerAlt) {
        bannerImage.setAttribute('alt', link.dataset.bannerAlt);
      }
    }
    banner.hidden = false;
    window.requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    });
    bannerHideTimer = window.setTimeout(() => {
      hideBanner();
    }, 4000);
  };

  const hideBanner = () => {
    if (!banner) return;
    if (bannerHideTimer) {
      window.clearTimeout(bannerHideTimer);
      bannerHideTimer = null;
    }
    if (bannerPointerTimer) {
      window.clearTimeout(bannerPointerTimer);
      bannerPointerTimer = null;
    }
    if (bannerConcealTimer) {
      window.clearTimeout(bannerConcealTimer);
      bannerConcealTimer = null;
    }
    banner.classList.remove('is-visible');
    bannerConcealTimer = window.setTimeout(() => {
      banner.hidden = true;
      bannerConcealTimer = null;
    }, 220);
  };

  const scheduleHoverHide = () => {
    if (!banner) return;
    if (bannerPointerTimer) {
      window.clearTimeout(bannerPointerTimer);
    }
    bannerPointerTimer = window.setTimeout(() => {
      hideBanner();
      bannerPointerTimer = null;
    }, HOVER_HIDE_DELAY);
  };

  if (bannerClose) {
    bannerClose.addEventListener('click', () => hideBanner());
  }

  if (banner) {
    banner.addEventListener('pointerenter', () => {
      if (bannerPointerTimer) {
        window.clearTimeout(bannerPointerTimer);
        bannerPointerTimer = null;
      }
    });
    banner.addEventListener('pointerleave', scheduleHoverHide);
    banner.addEventListener('click', (event) => {
      if (event.target === banner) {
        hideBanner();
      }
    });
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        hideBanner();
      }
    });
  }

  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        if (link.dataset.bannerSrc) {
          showBanner(link);
        }
        target.scrollIntoView({ behavior: 'smooth' });
        if (link.dataset.navLink) {
          setActiveNav(link.dataset.navLink);
        }
        if (mobileMenu && !mobileMenu.hidden) {
          mobileMenu.hidden = true;
          menuToggle?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  navLinks.forEach((link) => {
    if (!link.dataset.bannerSrc) return;
    link.addEventListener('pointerenter', () => showBanner(link));
    link.addEventListener('focus', () => showBanner(link));
    link.addEventListener('pointerleave', scheduleHoverHide);
    link.addEventListener('blur', scheduleHoverHide);
  });

  const scrollButtons = document.querySelectorAll('[data-scroll-next]');
  scrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-scroll-next');
      const target = targetId ? document.querySelector(targetId) : null;
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const animateTargets = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    animateTargets.forEach((target) => observer.observe(target));
  } else {
    animateTargets.forEach((target) => target.classList.add('animate-active'));
  }

  if (header) {
    let lastScroll = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const current = window.scrollY;
      const isMenuOpen = menuToggle?.getAttribute('aria-expanded') === 'true';
      if (current > lastScroll && current > 120 && !isMenuOpen) {
        header.classList.add('brand-shell--hidden');
      } else {
        header.classList.remove('brand-shell--hidden');
      }
      lastScroll = current;
      updateProgress();
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    });

    updateHeader();
  }

  if (!header) {
    window.addEventListener('scroll', updateProgress);
    updateProgress();
  }

  window.addEventListener('resize', updateProgress);

  const modelSections = Array.from(
    new Set(
      Array.from(navLinks)
        .map((link) => document.getElementById(link.dataset.navLink || ''))
        .filter((section) => section instanceof HTMLElement)
    )
  );

  if ('IntersectionObserver' in window && modelSections.length) {
    setActiveNav(modelSections[0].id);
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          setActiveNav(visible[0].target.id);
        }
      },
      {
        rootMargin: '-30% 0px -30% 0px',
        threshold: [0.4, 0.55, 0.75],
      }
    );

    modelSections.forEach((section) => sectionObserver.observe(section));
  } else if (modelSections.length) {
    setActiveNav(modelSections[0].id);
    window.addEventListener('scroll', () => {
      const currentSection = modelSections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.45;
      });
      if (currentSection) {
        setActiveNav(currentSection.id);
      }
    });
  }

  const interactiveTargets = document.querySelectorAll('[data-interactive]');
  const utImages = document.querySelectorAll('[data-ut-img]');

  if (utImages.length) {
    utImages.forEach((img) => {
      let retried = false;
      img.addEventListener('error', () => {
        if (retried) return;
        retried = true;
        const currentSrc = img.getAttribute('src') || '';
        const retrySrc = currentSrc.includes('?')
          ? `${currentSrc}&retry=1`
          : `${currentSrc}?retry=1`;
        img.src = retrySrc;
        console.warn('[ut-gallery] retrying frame', currentSrc);
      });
    });
  }

  interactiveTargets.forEach((target) => {
    const activate = () => {
      target.classList.add('is-active');
      window.setTimeout(() => target.classList.remove('is-active'), 260);
    };

    target.addEventListener('pointerenter', () => {
      target.classList.add('is-hovered');
    });

    target.addEventListener('pointerleave', () => {
      target.classList.remove('is-hovered');
      target.classList.remove('is-active');
    });

    target.addEventListener('pointerdown', activate);
    target.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        activate();
      }
    });

    target.addEventListener('focus', () => target.classList.add('is-hovered'));
    target.addEventListener('blur', () => {
      target.classList.remove('is-hovered');
      target.classList.remove('is-active');
    });
  });
})();