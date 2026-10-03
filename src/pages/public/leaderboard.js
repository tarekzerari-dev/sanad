// ============================
// Public - Leaderboard Page (لوحة الصدارة)
// ============================

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
    
    <main class="container" style="padding-top: var(--space-8); padding-bottom: var(--space-8);">
      <header style="text-align: center; margin-bottom: var(--space-6);">
        <h1 style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: var(--space-2);">لوحة الصدارة والتنقيط</h1>
        <p style="color: var(--text-secondary); font-size: var(--font-size-lg);">ترتيب فرسان القرآن الكريم بناءً على اجتهادهم ومواظبتهم</p>
      </header>

      <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-6); margin-bottom: var(--space-8);">
        
        <!-- التنويه بالتكريم -->
        <div class="card" style="background: linear-gradient(135deg, var(--gold-100), var(--gold-200)); border-color: var(--gold-400);">
          <div class="card-body" style="text-align: center; color: var(--gold-700);">
            <i data-lucide="award" style="width: 48px; height: 48px; margin-bottom: var(--space-3); color: var(--gold-600);"></i>
            <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--space-2);">تكريم فرسان القرآن</h3>
            <p style="font-size: var(--font-size-md);">نقاط التميز هذه ليست مجرد أرقام، بل هي رصيد حصادكم. سيتم الاعتماد على هذا الترتيب لتكريم الطلبة الأوائل والمتميزين في نهاية الموسم الدراسي تقديراً لجهودهم في حفظ كتاب الله.</p>
          </div>
        </div>

      </div>

      <!-- قائمة المتصدرين -->
      <div class="card" style="box-shadow: var(--shadow-lg); margin-bottom: var(--space-8);">
        <div class="card-header" style="background: var(--gray-50); border-bottom: 1px solid var(--border-color); padding: var(--space-4);">
          <h2 style="margin: 0; font-size: var(--font-size-lg); display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="list-ordered" style="color: var(--primary-color);"></i>
            ترتيب الطلبة
          </h2>
        </div>
        <div class="card-body" style="padding: 0;">
          ${rankedStudents.length === 0 ? `
            <div style="padding: var(--space-6); text-align: center; color: var(--text-muted);">
              لا يوجد طلبة مسجلين بعد.
            </div>
          ` : `
            <ul style="list-style: none; margin: 0; padding: 0;">
              ${rankedStudents.map((s, index) => {
                const rank = index + 1;
                let rankStyle = '';
                let rankBadge = '';
                
                if (rank === 1) {
                  rankStyle = 'background-color: var(--gold-50); border-left: 4px solid var(--gold-500);';
                  rankBadge = '<span style="font-size: 1.5rem;">🥇</span>';
                } else if (rank === 2) {
                  rankStyle = 'background-color: #f8f9fa; border-left: 4px solid #c0c0c0;';
                  rankBadge = '<span style="font-size: 1.5rem;">🥈</span>';
                } else if (rank === 3) {
                  rankStyle = 'background-color: #fffaf0; border-left: 4px solid #cd7f32;';
                  rankBadge = '<span style="font-size: 1.5rem;">🥉</span>';
                } else {
                  rankStyle = 'border-bottom: 1px solid var(--gray-100);';
                  rankBadge = `<span style="font-size: 1.2rem; font-weight: bold; color: var(--text-muted); width: 32px; text-align: center; display: inline-block;">${rank}</span>`;
                }

                return `
                  <li style="padding: var(--space-4); display: flex; align-items: center; justify-content: space-between; ${rankStyle}">
                    <div style="display: flex; align-items: center; gap: var(--space-4);">
                      ${rankBadge}
                      <div style="width: 48px; height: 48px; flex-shrink: 0; border-radius: 50%; background: var(--primary-50); border: 2px solid white; box-shadow: var(--shadow-sm); overflow: hidden;">
                        ${renderAvatar(s.avatar, 'avatar-md')}
                      </div>
                      <div>
                        <a href="#/student/${s.id}" style="text-decoration: none; color: var(--text-main);">
                          <h4 style="margin: 0; font-size: var(--font-size-md); font-weight: 600;">${s.firstName} ${s.lastName}</h4>
                        </a>
                        <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${s.group}</span>
                      </div>
                    </div>
                    <div style="text-align: left;">
                      <span class="badge ${s.pointsTotal > 0 ? 'badge-primary' : 'badge-gray'}" style="font-size: var(--font-size-md); padding: var(--space-1) var(--space-3);">
                        ${s.pointsTotal} نقطة
                      </span>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          `}
        </div>
      </div>

      <div class="card" style="margin-bottom: var(--space-8);">
        <div class="card-header" style="background: var(--gray-50); border-bottom: 1px solid var(--border-color); padding: var(--space-4); display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: var(--font-size-lg); display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="book-open" style="color: var(--primary-color);"></i>
            أحاديث وحكم
          </h2>
        </div>
        <div class="card-body" style="padding: var(--space-4);">
          <div id="quotes-list" class="grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-4);">
            <!-- Quotes will be injected here -->
          </div>
          
          ${isAdminLoggedIn() ? `
            <div style="margin-top: var(--space-6); border-top: 1px solid var(--border-color); padding-top: var(--space-4);">
              <h3 style="font-size: var(--font-size-md); margin-bottom: var(--space-3);">إضافة حكمة أو حديث جديد (كأدمن)</h3>
              <form id="add-quote-form" style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
                <input type="text" id="quote-text" class="form-input" placeholder="نص الحديث أو الحكمة..." style="flex: 2; min-width: 200px;" required>
                <input type="text" id="quote-author" class="form-input" placeholder="الراوي أو القائل..." style="flex: 1; min-width: 150px;" required>
                <button type="submit" class="btn btn-primary" style="white-space: nowrap;">إضافة</button>
              </form>
            </div>
          ` : ''}
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
  
  // Default quotes if empty
  if (quotes.length === 0) {
    quotes = [
      { id: '1', text: 'خَيرُكُم من تعلَّمَ القرآنَ وعلَّمَهُ', author: 'رواه البخاري' },
      { id: '2', text: 'إنَّ للهِ أَهْلينَ منَ النَّاسِ... هم أَهْلُ القرآنِ، أَهْلُ اللهِ وخاصَّتُهُ', author: 'رواه ابن ماجه' },
      { id: '3', text: 'القرآن كالصاحب، كلما أطلت صحبته عرفت أسراره. فصاحبوه ولا تهجروه لعلكم تفلحون.', author: 'حكمة' }
    ];
  }

  container.innerHTML = quotes.map(q => `
    <div style="background: var(--primary-50); padding: var(--space-4); border-radius: var(--border-radius-lg); position: relative;">
      ${isAdminLoggedIn() && q.id.length > 5 ? `
        <button class="btn btn-ghost btn-sm delete-quote-btn" data-id="${q.id}" style="position: absolute; top: 4px; left: 4px; color: var(--danger); padding: 4px;">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      ` : ''}
      <p style="font-size: var(--font-size-md); color: var(--text-main); font-style: italic; margin-bottom: var(--space-2); margin-top: var(--space-2);">"${q.text}"</p>
      <span style="font-size: var(--font-size-sm); color: var(--primary-600); font-weight: 600;">— ${q.author}</span>
    </div>
  `).join('');
  
  // Attach delete handlers
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
