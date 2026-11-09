// ============================================================
// سند — Public & Administrative Master Navbar
// ============================================================

import { isAdminLoggedIn, getSettings } from '../data/store.js';
import { initIcons } from '../utils/helpers.js';

export function renderNavbar(currentPath = '/') {
  const isAdmin = isAdminLoggedIn();
  const settings = getSettings();
  
  const links = [
    { path: '/', label: 'الرئيسية', icon: 'home' },
    { path: '/journal', label: 'يوميات المدرسة', icon: 'book-open' },
    { path: '/students', label: 'الطلبة', icon: 'users' },
    { path: '/leaderboard', label: 'لوحة الصدارة', icon: 'star' },
    { path: '/competitions', label: 'المسابقات', icon: 'trophy' },
    { path: '/about', label: 'عن المدرسة', icon: 'info' },
    { path: '/developer', label: 'عن المطور', icon: 'code-2' },
  ];

  return `
    <header class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <!-- Brand / Identity -->
        <a href="#/" class="navbar-brand">
          <img src="${settings.logoUrl || '/logo.png'}" alt="شعار منصة سند" class="brand-logo-img" />
          <div class="brand-text-wrapper">
            <span class="brand-text">سَنَد</span>
            <span class="brand-subtext">مدرسة القرآن الكريم وعلومه</span>
          </div>
        </a>
        
        <!-- Desktop Navigation Bar (Strictly ONE navbar on desktop) -->
        <nav class="navbar-nav-container" aria-label="التنقل الرئيسي">
          <ul class="navbar-links">
            ${links.map(l => `
              <li>
                <a href="#${l.path}" class="${currentPath === l.path ? 'active' : ''}">
                  <span>${l.label}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </nav>

        <!-- Right / Action Controls -->
        <div class="navbar-actions">
          ${isAdmin ? `
            <a href="#/admin/dashboard" class="navbar-admin-btn">
              <i data-lucide="layout-dashboard"></i>
              <span>لوحة الإدارة</span>
            </a>
          ` : `
            <a href="#/admin/login" class="navbar-login-btn">
              <i data-lucide="lock"></i>
              <span>الدخول الإداري</span>
            </a>
          `}

          <!-- Mobile Hamburger Toggle -->
          <button class="navbar-toggle" id="navbar-toggle" aria-label="فتح القائمة" aria-expanded="false">
            <i data-lucide="menu" id="toggle-icon-menu"></i>
            <i data-lucide="x" id="toggle-icon-close" style="display: none;"></i>
          </button>
        </div>
      </div>
      
      <!-- Mobile Drawer Menu (Hidden by default, only shown on mobile when toggled) -->
      <div class="mobile-nav" id="mobile-nav">
        <div class="mobile-nav-header">
          <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--emerald-800); text-transform: uppercase;">
            أقسام المنصة
          </span>
        </div>
        ${links.map(l => `
          <a href="#${l.path}" class="mobile-nav-link ${currentPath === l.path ? 'active' : ''}">
            <i data-lucide="${l.icon}"></i>
            <span>${l.label}</span>
          </a>
        `).join('')}
        
        <div style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--border-color);">
          ${isAdmin ? `
            <a href="#/admin/dashboard" class="btn btn-primary" style="width: 100%; justify-content: center;">
              <i data-lucide="layout-dashboard"></i>
              <span>الانتقال للوحة الإدارة</span>
            </a>
          ` : `
            <a href="#/admin/login" class="btn btn-secondary" style="width: 100%; justify-content: center;">
              <i data-lucide="lock"></i>
              <span>الدخول إلى لوحة الإدارة</span>
            </a>
          `}
        </div>
      </div>
    </header>
  `;
}

export function initNavbar() {
  const toggle = document.getElementById('navbar-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const iconMenu = document.getElementById('toggle-icon-menu');
  const iconClose = document.getElementById('toggle-icon-close');
  
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (iconMenu && iconClose) {
        iconMenu.style.display = isOpen ? 'none' : 'block';
        iconClose.style.display = isOpen ? 'block' : 'none';
      }
    });
    
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        if (iconMenu && iconClose) {
          iconMenu.style.display = 'block';
          iconClose.style.display = 'none';
        }
      });
    });
  }

  // Scroll effect
  const navbar = document.getElementById('main-navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
  
  initIcons();
}
