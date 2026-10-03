// ============================
// Navbar Component
// ============================

import { isAdminLoggedIn, getSettings } from '../data/store.js';
import { initIcons } from '../utils/helpers.js';

export function renderNavbar(currentPath = '/') {
  const isAdmin = isAdminLoggedIn();
  const settings = getSettings();
  
  const links = [
    { path: '/', label: 'الرئيسية' },
    { path: '/journal', label: 'يوميات المدرسة' },
    { path: '/students', label: 'الطلبة' },
    { path: '/leaderboard', label: 'لوحة الصدارة' },
    { path: '/competitions', label: 'المسابقات' },
    { path: '/about', label: 'عن المدرسة' },
    { path: '/developer', label: 'عن المطور' },
  ];

  return `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-inner">
        <a href="#/" class="navbar-brand">
          <img src="${settings.logoUrl || '/logo.png'}" alt="شعار منصة سند" class="brand-logo-img" />
          <div class="brand-text-wrapper">
            <span class="brand-text">سَنَد</span>
            <span class="brand-subtext">المدرسة القرآنية</span>
          </div>
        </a>
        
        <ul class="navbar-links">
          ${links.map(l => `
            <li><a href="#${l.path}" class="${currentPath === l.path ? 'active' : ''}">${l.label}</a></li>
          `).join('')}
          ${isAdmin ? `
            <li>
              <a href="#/admin/dashboard" class="navbar-admin-btn">
                <i data-lucide="layout-dashboard"></i>
                لوحة التحكم
              </a>
            </li>
          ` : ''}
        </ul>

        <button class="navbar-toggle" id="navbar-toggle">
          <i data-lucide="menu"></i>
        </button>
      </div>
      
      <div class="mobile-nav" id="mobile-nav">
        ${links.map(l => `
          <a href="#${l.path}" class="${currentPath === l.path ? 'active' : ''}">${l.label}</a>
        `).join('')}
        ${isAdmin ? `
          <a href="#/admin/dashboard">
            🔧 لوحة التحكم
          </a>
        ` : ''}
      </div>
    </nav>
  `;
}

export function initNavbar() {
  const toggle = document.getElementById('navbar-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
    
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
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
