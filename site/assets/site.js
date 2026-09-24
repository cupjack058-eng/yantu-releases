(() => {
  'use strict';

  const DOWNLOADS = {
    windows: { href: '/download/windows', label: '下载 Windows 版' },
    mac: { href: '/download/mac', label: '下载 macOS 版' },
    other: { href: '/download/', label: '下载电脑版' },
  };

  const detectOS = () => {
    const ua = navigator.userAgent || '';
    const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/android|iphone|ipad|ipod|mobile/i.test(ua)) return 'other';
    if (/mac/i.test(platform) || /Mac OS X/.test(ua)) {
      return navigator.maxTouchPoints > 1 ? 'other' : 'mac';
    }
    if (/win/i.test(platform) || /Windows/.test(ua)) return 'windows';
    return 'other';
  };

  const os = detectOS();
  document.documentElement.dataset.os = os;

  document.querySelectorAll('[data-dl="auto"]').forEach((link) => {
    const target = DOWNLOADS[os];
    link.setAttribute('href', target.href);
    const label = link.querySelector('[data-dl-label]');
    if (label) label.textContent = target.label;
  });

  if (os === 'other') {
    document.querySelectorAll('[data-hide-other]').forEach((node) => {
      node.hidden = true;
    });
  }

  document.querySelectorAll('[data-dl="other"]').forEach((link) => {
    if (os === 'windows') {
      link.setAttribute('href', DOWNLOADS.mac.href);
      link.textContent = '下载 macOS 版';
    } else if (os === 'mac') {
      link.setAttribute('href', DOWNLOADS.windows.href);
      link.textContent = '下载 Windows 版';
    }
  });

  document.querySelectorAll('[data-platform]').forEach((card) => {
    card.classList.toggle('is-recommended', card.dataset.platform === os);
  });

  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const select = (tab, focus) => {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (event) => {
        let next = null;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          select(next, true);
        }
      });
    });
  });

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    const original = button.textContent;
    button.addEventListener('click', async () => {
      const source = document.getElementById(button.dataset.copy);
      if (!source) return;
      try {
        await copyText(source.textContent.trim());
        button.textContent = '已复制';
      } catch {
        button.textContent = '请手动复制';
      }
      window.setTimeout(() => {
        button.textContent = original;
      }, 1600);
    });
  });

  const revealed = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealed.forEach((node) => observer.observe(node));
  } else {
    revealed.forEach((node) => node.classList.add('is-in'));
  }

  // 首屏界面演示：窗口进入视野后再播放一次，减少动态效果时直接显示终态
  const demoWindow = document.querySelector('.app-window');
  const demoThread = document.querySelector('.app-thread');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (demoWindow && demoThread && 'IntersectionObserver' in window && !reduceMotion) {
    demoWindow.classList.add('is-armed');
    const demoObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          demoWindow.classList.add('is-playing');
          demoObserver.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    demoObserver.observe(demoThread);
  }

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
