tailwind.config = {
    theme: {
      extend: {
        colors: {
          deep: '#1D4E89',
          dark: '#0F2C4C',
          accent: '#3B82F6',
          soft: '#EAF2FB',
          ink: '#0F172A',
          paper: '#F8FAFC',
          green: '#0FA76F',
          greendark: '#0B7F55',
        },
        fontFamily: {
          display: ['"Plus Jakarta Sans"', 'sans-serif'],
          mono: ['"IBM Plex Mono"', 'monospace'],
        },
      }
    }
  }


  
  lucide.createIcons();

  // Menú móvil (hamburguesa)
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');

  function toggleMobileMenu(forceClose) {
    const isOpen = mobileMenu.classList.contains('open');
    const shouldOpen = forceClose ? false : !isOpen;

    mobileMenu.classList.toggle('open', shouldOpen);
    mobileBackdrop.classList.toggle('open', shouldOpen);
    iconOpen.classList.toggle('hidden', shouldOpen);
    iconClose.classList.toggle('hidden', !shouldOpen);
    menuBtn.setAttribute('aria-expanded', String(shouldOpen));
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => toggleMobileMenu());
  mobileBackdrop.addEventListener('click', () => toggleMobileMenu(true));
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(true));
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMobileMenu(true);
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view', 'reveal');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => { el.classList.add('reveal'); io.observe(el); });

  // Signature divider draw when in view
  document.querySelectorAll('[data-sig]').forEach(svg => {
    const sigIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); sigIo.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    sigIo.observe(svg);
  });