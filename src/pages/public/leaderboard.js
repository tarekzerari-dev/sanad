// ============================================================
// سند — Public Leaderboard View (لوحة الصدارة والتميز)
// ============================================================

import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { getStudents, getAllPoints, isAdminLoggedIn, getQuotes, addQuote, deleteQuote } from '../../data/store.js';
import { initIcons, generateId } from '../../utils/helpers.js';
import { renderAvatar } from '../../utils/avatars.js';

export function renderLeaderboardPage() {
  const students = getStudents();
  const allPoints = getAllPoints();

  // Calculate totals and sort
  const rankedStudents = students.map(student => {
    const pData = allPoints[student.id];
    const total = pData ? pData.total : 0;
    return { ...student, pointsTotal: total };
  }).sort((a, b) => b.pointsTotal - a.pointsTotal);

  const content = `
    ${renderNavbar('/leaderboard')}
    
    <main class="section" style="padding-top: var(--space-8); padding-bottom: var(--space-16); background: var(--bg-canvas);">
      <div class="container">
        
        <header class="section-header" style="margin-bottom: var(--space-6);">
          <h1 style="font-family: var(--font-heading); font-size: 2.5rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
            لوحة الصدارة والفرسان المتميزين
          </h1>
          <p>ترتيب فرسان القرآن الكريم بناءً على اجتهادهم ومواظبتهم وحسن التلاوة والتجويد</p>
        </header>

        <!-- Recognition Notice -->
        <div class="card" style="background: var(--brass-50); border: 1.5px solid var(--brass-300); margin-bottom: var(--space-6);">
          <div class="card-body" style="text-align: center; padding: var(--space-6);">
            <div style="width: 48px; height: 48px; border-radius: var(--border-radius-full); background: var(--brass-100); color: var(--brass-700); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3); border: 1px solid var(--brass-300);">
              <i data-lucide="award" style="width: 24px; height: 24px;"></i>
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
              تكريم فرسان القرآن الكريم
            </h3>
            <p class="reading-content" style="font-size: var(--font-size-sm); color: var(--text-secondary); max-width: 680px; margin: 0 auto; line-height: 1.8;">
              نقاط التميز هي رصيد حصادكم واجتهادكم في رحاب القرآن العظيم. تعتمد إدارة المدرسة على هذا السجل لتكريم وتتويج الطلبة الأوائل في الحفل الختامي للموسم القرآني.
            </p>
          </div>
        </div>

        <!-- Leaderboard Table -->
        <div class="card" style="box-shadow: var(--shadow-sm); margin-bottom: var(--space-8);">
          <div class="card-header" style="background: var(--bg-canvas);">
            <h2 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--emerald-950); margin: 0; display: flex; align-items: center; gap: var(--space-2);">
              <i data-lucide="list-ordered" style="color: var(--emerald-800);"></i>
              <span>ترتيب الفرسان الحالي</span>
            </h2>
            <span class="badge badge-green" style="font-size: 11px;">محدث آنياً</span>
          </div>
          
          <div class="card-body" style="padding: 0;">
            ${rankedStudents.length === 0 ? `
              <div style="padding: var(--space-8); text-align: center; color: var(--text-muted);">
                لا يوجد طلبة مسجلين بعد.
              </div>
            ` : `
              <ul style="list-style: none; margin: 0; padding: 0;">
                ${rankedStudents.map((s, index) => {
                  const rank = index + 1;
                  let rankStyle = '';
                  let rankBadge = '';
                  
                  if (rank === 1) {
                    rankStyle = 'background: var(--brass-50); border-right: 4px solid var(--brass-500);';
                    rankBadge = '<span style="font-size: 1.5rem;">🥇</span>';
                  } else if (rank === 2) {
                    rankStyle = 'background: var(--bg-surface); border-right: 4px solid #94a3b8;';
                    rankBadge = '<span style="font-size: 1.5rem;">🥈</span>';
                  } else if (rank === 3) {
                    rankStyle = 'background: var(--bg-surface); border-right: 4px solid #b45309;';
                    rankBadge = '<span style="font-size: 1.5rem;">🥉</span>';
                  } else {
                    rankStyle = 'border-bottom: 1px solid var(--border-subtle);';
                    rankBadge = `<span style="font-size: 1rem; font-weight: 700; color: var(--text-muted); width: 32px; text-align: center; display: inline-block;">#${rank}</span>`;
                  }

                  return `
                    <li style="padding: var(--space-4) var(--space-5); display: flex; align-items: center; justify-content: space-between; ${rankStyle}">
                      <div style="display: flex; align-items: center; gap: var(--space-4);">
                        ${rankBadge}
                        <div style="width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; overflow: hidden; border: 1.5px solid var(--border-color); display: flex; align-items: center; justify-content: center;">
                          ${renderAvatar(s.avatar, 'avatar-md')}
                        </div>
                        <div>
                          <a href="#/student/${s.id}" style="text-decoration: none; color: var(--text-primary);">
                            <h4 style="margin: 0; font-size: var(--font-size-base); font-weight: 700;">${s.firstName} ${s.lastName}</h4>
                          </a>
                          <span style="font-size: 11px; color: var(--text-muted);">${s.group} • ${s.level}</span>
                        </div>
                      </div>
                      <div style="text-align: left;">
                        <span class="badge ${s.pointsTotal > 0 ? 'badge-green' : 'badge-gray'}" style="font-size: 13px; font-weight: 800; padding: 4px 12px;">
                          ${s.pointsTotal > 0 ? '+' : ''}${s.pointsTotal} نقطة
                        </span>
                      </div>
                    </li>
                  `;
                }).join('')}
              </ul>
            `}
          </div>
        </div>

        <!-- Prophetic Quotes & Wisdom Section -->
        <div class="card">
          <div class="card-header" style="background: var(--bg-canvas);">
            <h2 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--emerald-950); margin: 0; display: flex; align-items: center; gap: var(--space-2);">
              <i data-lucide="book-open" style="color: var(--emerald-800);"></i>
              <span>أحاديث نبوية في فضل القرآن وأهله</span>
            </h2>
          </div>
          <div class="card-body">
            <div id="quotes-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);"></div>
            
            ${isAdminLoggedIn() ? `
              <div style="margin-top: var(--space-6); border-top: 1px solid var(--border-color); padding-top: var(--space-4);">
                <div style="font-size: var(--font-size-xs); font-weight: 700; color: var(--emerald-800); margin-bottom: var(--space-3);">
                  إضافة شاهد قرآني أو حديث شريف (خاص بمدير النظام):
                </div>
                <form id="add-quote-form" style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                  <input type="text" id="quote-text" class="form-input" placeholder="نص الحديث أو الشاهد..." style="flex: 2; min-width: 200px;" required>
                  <input type="text" id="quote-author" class="form-input" placeholder="التخريج (مثال: رواه البخاري)..." style="flex: 1; min-width: 150px;" required>
                  <button type="submit" class="btn btn-primary btn-sm" style="white-space: nowrap;">إضافة</button>
                </form>
              </div>
            ` : ''}
          </div>
        </div>

      </div>
    </main>
    
    ${renderFooter()}
  `;

  document.getElementById('app').innerHTML = content;
  initNavbar();
  renderQuotes();

  if (isAdminLoggedIn()) {
    const form = document.getElementById('add-quote-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('quote-text').value.trim();
        const author = document.getElementById('quote-author').value.trim();
        
        if (text && author) {
          addQuote({
            id: generateId(),
            text,
            author,
            date: new Date().toISOString()
          });
          document.getElementById('quote-text').value = '';
          document.getElementById('quote-author').value = '';
          renderQuotes();
        }
      });
    }
  }

  initIcons();
}

function renderQuotes() {
  const container = document.getElementById('quotes-list');
  if (!container) return;
  
  let quotes = getQuotes();
  
  if (quotes.length === 0) {
    quotes = [
      { id: '1', text: 'خَيرُكُم مَن تعلَّمَ القُرآنَ وعَلَّمَهُ', author: 'رواه البخاري عن عثمان بن عفان رضي الله عنه' },
      { id: '2', text: 'إنَّ للَّهِ أَهْلينَ منَ النَّاسِ... هُم أَهْلُ القُرآنِ، أَهْلُ اللَّهِ وخاصَّتُهُ', author: 'رواه الإمام أحمد والنسائي' },
      { id: '3', text: 'يقالُ لصاحِبِ القرآنِ: اقرأْ وارتَقِ ورتِّلْ كما كُنتَ ترتِّلُ في الدُّنيا، فإنَّ منزلتَكَ عندَ آخرِ آيةٍ تقرأُ بِها', author: 'رواه الترمذي وصححه الألباني' }
    ];
  }

  container.innerHTML = quotes.map(q => `
    <div style="background: var(--bg-canvas); border: 1px solid var(--border-color); border-right: 3px solid var(--emerald-800); padding: var(--space-4); border-radius: var(--border-radius-md); position: relative;">
      ${isAdminLoggedIn() && q.id.length > 5 ? `
        <button class="btn btn-ghost btn-sm btn-icon delete-quote-btn" data-id="${q.id}" style="position: absolute; top: 4px; left: 4px; color: var(--danger); padding: 4px;">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      ` : ''}
      <p class="reading-content" style="font-size: var(--font-size-sm); color: var(--emerald-950); margin-bottom: var(--space-2); line-height: 1.8;">
        «${q.text}»
      </p>
      <span style="font-size: 11px; color: var(--brass-700); font-weight: 600;">— ${q.author}</span>
    </div>
  `).join('');
  
  if (isAdminLoggedIn()) {
    container.querySelectorAll('.delete-quote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        deleteQuote(id);
        renderQuotes();
      });
    });
  }
  
  initIcons();
}
