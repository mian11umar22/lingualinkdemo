/**
 * LinguaLink360 - Contact form behavior (demo, no backend).
 * Validation, double-submit protection, honeypot and success state.
 */
(function () {
  'use strict';

  var form = document.getElementById('ll-contact-form');
  if (!form) {
    return;
  }

  var submitBtn = document.getElementById('ll-cf-submit');
  var submitLabel = submitBtn.querySelector('.ll-form__submit-label');
  var spinner = submitBtn.querySelector('.ll-spinner');
  var success = document.getElementById('ll-cf-success');
  var status = document.getElementById('ll-cf-status');
  var resetBtn = document.getElementById('ll-cf-reset');
  var honeypot = document.getElementById('ll-cf-website');

  var IDLE_LABEL = submitLabel.textContent;
  var SENDING_LABEL = 'Sending...';
  var SUCCESS_TEXT = 'Thank you. We will get back to you soon.';
  var SEND_DELAY_MS = 1200;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var MIN_MESSAGE_LENGTH = 10;

  var fields = [
    { el: document.getElementById('ll-cf-name'), validate: validateName },
    { el: document.getElementById('ll-cf-email'), validate: validateEmail },
    { el: document.getElementById('ll-cf-topic'), validate: validateTopic },
    { el: document.getElementById('ll-cf-subject'), validate: validateSubject },
    { el: document.getElementById('ll-cf-message'), validate: validateMessage }
  ];

  var isSending = false;

  /* Each validator returns an error message, or '' when the value is valid. */
  function validateName(value) {
    return value ? '' : 'Please enter your full name.';
  }

  function validateEmail(value) {
    if (!value) {
      return 'Please enter your email address.';
    }
    return EMAIL_PATTERN.test(value) ? '' : 'Please enter a valid email address.';
  }

  function validateTopic(value) {
    return value ? '' : 'Please choose a topic.';
  }

  function validateSubject(value) {
    return value ? '' : 'Please enter a subject.';
  }

  function validateMessage(value) {
    if (!value) {
      return 'Please enter your message.';
    }
    return value.length >= MIN_MESSAGE_LENGTH
      ? ''
      : 'Your message must be at least ' + MIN_MESSAGE_LENGTH + ' characters.';
  }

  function errorElFor(field) {
    return document.getElementById(field.el.id + '-error');
  }

  function setError(field, message) {
    var errorEl = errorElFor(field);
    field.el.setAttribute('aria-invalid', 'true');
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError(field) {
    var errorEl = errorElFor(field);
    field.el.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  /* Trims the value, validates it and updates the UI. Returns true when valid. */
  function checkField(field) {
    if (field.el.tagName !== 'SELECT') {
      field.el.value = field.el.value.trim();
    }
    var message = field.validate(field.el.value);
    if (message) {
      setError(field, message);
      return false;
    }
    clearError(field);
    return true;
  }

  /* Clear an error as soon as the field becomes valid (never adds new errors while typing). */
  function onFieldChange(field) {
    if (field.el.getAttribute('aria-invalid') !== 'true') {
      return;
    }
    var value = field.el.tagName === 'SELECT' ? field.el.value : field.el.value.trim();
    if (!field.validate(value)) {
      clearError(field);
    }
  }

  fields.forEach(function (field) {
    field.el.addEventListener('input', function () { onFieldChange(field); });
    field.el.addEventListener('change', function () { onFieldChange(field); });
  });

  function setSending(sending) {
    isSending = sending;
    submitBtn.disabled = sending;
    submitBtn.setAttribute('aria-busy', sending ? 'true' : 'false');
    spinner.hidden = !sending;
    submitLabel.textContent = sending ? SENDING_LABEL : IDLE_LABEL;
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    /* Set the text after the region is visible so assistive tech announces it. */
    window.setTimeout(function () {
      status.textContent = SUCCESS_TEXT;
    }, 100);
    resetBtn.focus();
  }

  function resetForm() {
    form.reset();
    fields.forEach(clearError);
    status.textContent = '';
    success.hidden = true;
    form.hidden = false;
    setSending(false);
    fields[0].el.focus();
  }

  // DEMO ONLY: replace with a real POST (add @csrf) when moved to Laravel
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    /* Ignore any further submit (Enter key, rapid double clicks) while sending. */
    if (isSending) {
      return;
    }

    /* Honeypot filled: silently pretend success and do nothing. */
    if (honeypot.value) {
      showSuccess();
      return;
    }

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!checkField(field) && !firstInvalid) {
        firstInvalid = field.el;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setSending(true);
    window.setTimeout(function () {
      setSending(false);
      showSuccess();
    }, SEND_DELAY_MS);
  });

  resetBtn.addEventListener('click', resetForm);
})();
