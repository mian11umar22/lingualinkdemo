/**
 * LinguaLink360 - Home Page Script
 * Implements accessible WAI-ARIA tab pattern with responsive orientation and keyboard navigation.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initHome);

  function initHome() {
    initShowcaseTabs();
    initFaqAccordion();
  }

  /**
   * FAQ Accordion
   * One item open at a time. The collapsed look is only applied once this script has
   * added .ll-faq__list--ready, so every answer stays visible if JavaScript fails.
   */
  function initFaqAccordion() {
    const list = document.querySelector('.ll-faq__list');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('.ll-faq__item'));
    if (!items.length) return;

    function setOpen(item, open) {
      const trigger = item.querySelector('.ll-faq__trigger');
      item.classList.toggle('ll-faq__item--open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    items.forEach((item, index) => {
      setOpen(item, index === 0);
    });

    list.addEventListener('click', (event) => {
      const trigger = event.target.closest('.ll-faq__trigger');
      if (!trigger || !list.contains(trigger)) return;

      const item = trigger.closest('.ll-faq__item');
      const willOpen = !item.classList.contains('ll-faq__item--open');

      items.forEach((other) => setOpen(other, other === item && willOpen));
    });

    list.classList.add('ll-faq__list--ready');
  }

  /**
   * Accessible WAI-ARIA Showcase Tabs
   */
  function initShowcaseTabs() {
    const tabList = document.querySelector('.ll-showcase__tablist');
    if (!tabList) return;

    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const tabItems = Array.from(tabList.querySelectorAll('.ll-showcase__tab-item'));
    const panels = Array.from(document.querySelectorAll('.ll-tab-panel'));

    if (!tabs.length || !panels.length) return;

    // Responsive aria-orientation: vertical on desktop (>= 1024px), horizontal on mobile
    const mql = window.matchMedia('(min-width: 1024px)');
    function updateOrientation(matches) {
      tabList.setAttribute('aria-orientation', matches ? 'vertical' : 'horizontal');
    }
    updateOrientation(mql.matches);

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', (e) => updateOrientation(e.matches));
    } else if (typeof mql.addListener === 'function') {
      mql.addListener((e) => updateOrientation(e.matches));
    }

    function activateTab(newTab, setFocus = true) {
      tabs.forEach((tab, index) => {
        const isSelected = tab === newTab;
        tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        tab.setAttribute('tabindex', isSelected ? '0' : '-1');

        if (tabItems[index]) {
          tabItems[index].classList.toggle('ll-showcase__tab-item--active', isSelected);
        }
      });

      const targetPanelId = newTab.getAttribute('aria-controls');
      panels.forEach((panel) => {
        const matches = panel.id === targetPanelId;
        if (matches) {
          panel.removeAttribute('hidden');
          panel.classList.add('ll-tab-panel--active');
          panel.setAttribute('aria-hidden', 'false');
        } else {
          panel.setAttribute('hidden', '');
          panel.classList.remove('ll-tab-panel--active');
          panel.setAttribute('aria-hidden', 'true');
        }
      });

      if (setFocus) {
        newTab.focus({ preventScroll: true });
      }
    }

    // Click listener: keep focus on the tab, do not scroll the page
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab(tab, true);
      });
    });

    // Keyboard navigation (ArrowDown, ArrowUp, ArrowRight, ArrowLeft, Home, End)
    tabList.addEventListener('keydown', (e) => {
      const currentTab = document.activeElement;
      const currentIndex = tabs.indexOf(currentTab);
      if (currentIndex === -1) return;

      let nextIndex = null;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % tabs.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        const nextTab = tabs[nextIndex];
        activateTab(nextTab, true);
      }
    });
  }
})();
