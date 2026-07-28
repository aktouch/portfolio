const menuButton = document.querySelector('.header-toggle');
const navigation = document.querySelector('#header-nav');

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

// ヘッダーの背景切り替え：MVに乗っている間は透過、MVを抜けたらべた塗り（.is-solid）
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');

if (header && hero) {
  let threshold = 0;

  // ヘッダー下端がMVの下端を抜ける位置。ブレイクポイントで高さが変わるので測り直す
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
