if (window.self !== window.top) {
  document.documentElement.classList.add('is-embedded');
}

const menuButton = document.querySelector('.header-toggle');
const navigation = document.querySelector('#header-nav');
const mainContent = document.querySelector('.main');

if (menuButton && navigation) {

  const setOpen = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
    if (mainContent) mainContent.inert = open;
  };

  const closeMenu = () => setOpen(false);

  menuButton.addEventListener('click', () => {
    setOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  document.querySelectorAll('.header a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMenu();
  }, { passive: true });
}

const header = document.querySelector('.header');
const hero = document.querySelector('.hero');

if (header && hero) {
  let threshold = 0;

  const measure = () => {
    threshold = hero.offsetHeight - header.offsetHeight;
  };

  const update = () => {
    header.classList.toggle('is-solid', window.scrollY > threshold);
  };

  measure();
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    update();
  }, { passive: true });
}
