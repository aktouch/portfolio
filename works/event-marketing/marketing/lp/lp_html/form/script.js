(() => {
  'use strict';

  const UNIT_PRICE = 4180;
  const form = document.querySelector('#ticket-form');
  const people = document.querySelector('#people');
  const totalPrice = document.querySelector('#total-price');
  const submitButton = document.querySelector('#submit-button');
  const errorSummary = document.querySelector('#form-error-summary');

  const rules = {
    'last-name': value => value.trim() ? '' : '姓を入力してください。',
    'first-name': value => value.trim() ? '' : '名を入力してください。',
    'last-name-kana': value => validateKana(value, 'セイ'),
    'first-name-kana': value => validateKana(value, 'メイ'),
    tel: value => /^(?:\+81|0)[0-9\-\s()]{8,16}$/.test(value.trim()) ? '' : '電話番号を正しく入力してください。',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'メールアドレスを正しく入力してください。',
    'privacy-consent': (_value, element) => element.checked ? '' : 'プライバシーポリシーへの同意が必要です。'
  };

  function validateKana(value, label) {
    const trimmed = value.trim();
    if (!trimmed) return `${label}を入力してください。`;
    return /^[ァ-ヶー\s]+$/.test(trimmed) ? '' : '全角カタカナで入力してください。';
  }

  function updateTotal() {
    const count = Number(people.value) || 1;
    totalPrice.textContent = `${(UNIT_PRICE * count).toLocaleString('ja-JP')}円`;
  }

  function setFieldError(element, message) {
    const errorElement = document.querySelector(`#${element.id}-error`);
    element.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errorElement) errorElement.textContent = message;
  }

  function validateField(element) {
    const rule = rules[element.id];
    if (!rule) return '';
    const message = rule(element.value, element);
    setFieldError(element, message);
    return message;
  }

  function validateForm() {
    const errors = [];
    Object.keys(rules).forEach(id => {
      const element = document.getElementById(id);
      const message = validateField(element);
      if (message) errors.push({ element, message });
    });

    const list = errorSummary.querySelector('ul');
    list.innerHTML = '';
    errors.forEach(({ message }) => {
      const li = document.createElement('li');
      li.textContent = message;
      list.appendChild(li);
    });
    errorSummary.hidden = errors.length === 0;

    if (errors.length) {
      errorSummary.focus();
      errors[0].element.focus();
      return false;
    }
    return true;
  }

  people.addEventListener('change', updateTotal);
  updateTotal();

  Object.keys(rules).forEach(id => {
    const element = document.getElementById(id);
    element.addEventListener(element.type === 'checkbox' ? 'change' : 'blur', () => validateField(element));
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validateForm()) return;

    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = '決済画面を準備しています…';

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.unit_price = UNIT_PRICE;

    try {
      const response = await fetch('./server/create-checkout-session.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || '決済画面を開けませんでした。');
      }
      window.location.href = data.url;
    } catch (error) {
      errorSummary.hidden = false;
      errorSummary.querySelector('ul').innerHTML = `<li>${escapeHtml(error.message)}時間をおいて再度お試しいただくか、運営へお問い合わせください。</li>`;
      errorSummary.focus();
      submitButton.disabled = false;
      submitButton.querySelector('span').textContent = 'Stripeの決済画面へ進む';
    }
  });

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }
})();
