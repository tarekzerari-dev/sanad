// ============================
// Avatar System - Clean & Simple SVG Illustrations
// ============================

const SKIN_TONES = {
  light: '#FFE0C4',
  medium: '#F3C398',
  tan: '#E0A678'
};

const HAIR_COLORS = {
  black: '#2C2C2C',
  brown: '#5C3A1E',
  darkBrown: '#3D2B1F'
};

const HIJAB_COLORS = {
  pink: '#F472B6',
  purple: '#A78BFA',
  teal: '#2DD4BF',
  blue: '#60A5FA',
  green: '#34D399',
  peach: '#FB923C'
};

const SHIRT_COLORS = {
  green: '#34D399',
  blue: '#60A5FA',
  orange: '#FB923C',
  purple: '#A78BFA'
};

function boyAvatar(skinTone, hairColor, shirtColor) {
  const skin = SKIN_TONES[skinTone];
  const hair = HAIR_COLORS[hairColor];
  const shirt = SHIRT_COLORS[shirtColor];
  
  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <circle cx="32" cy="32" r="32" fill="${shirt}" opacity="0.15"/>
    
    <!-- Body -->
    <path d="M16 64 L16 48 C16 38, 48 38, 48 48 L48 64 Z" fill="${shirt}"/>
    
    <!-- Neck -->
    <rect x="28" y="36" width="8" height="6" rx="2" fill="${skin}"/>
    
    <!-- Head -->
    <circle cx="32" cy="26" r="14" fill="${skin}"/>
    
    <!-- Hair -->
    <path d="M16 26 C16 10, 48 10, 48 26 C48 20, 32 14, 16 26 Z" fill="${hair}"/>
    
    <!-- Eyes -->
    <circle cx="27" cy="26" r="2" fill="#333333"/>
    <circle cx="37" cy="26" r="2" fill="#333333"/>
    
    <!-- Smile -->
    <path d="M28 32 Q32 36 36 32" fill="none" stroke="#C0846E" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function girlAvatar(skinTone, hijabColorKey) {
  const skin = SKIN_TONES[skinTone];
  const hijab = HIJAB_COLORS[hijabColorKey];

  return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <circle cx="32" cy="32" r="32" fill="${hijab}" opacity="0.15"/>
    
    <!-- Body (Abaya/Dress) -->
    <path d="M14 64 L14 46 C14 36, 50 36, 50 46 L50 64 Z" fill="${hijab}"/>
    
    <!-- Hijab Back & Wrap -->
    <path d="M18 40 Q16 18 32 12 Q48 18 46 40 Q32 50 18 40 Z" fill="${hijab}"/>
    
    <!-- Inner face background for complete coverage -->
    <circle cx="32" cy="28" r="11" fill="${skin}"/>
    
    <!-- Hijab top inner styling -->
    <path d="M22 22 Q32 16 42 22 Q32 19 22 22 Z" fill="#ffffff" opacity="0.3"/>
    
    <!-- Eyes -->
    <circle cx="27.5" cy="28" r="2" fill="#333333"/>
    <circle cx="36.5" cy="28" r="2" fill="#333333"/>
    
    <!-- Smile -->
    <path d="M29 33 Q32 36 35 33" fill="none" stroke="#C0846E" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

export const AVATARS = {
  boy1: { id: 'boy1', gender: 'male', label: 'ولد 1', render: () => boyAvatar('light', 'black', 'blue') },
  boy2: { id: 'boy2', gender: 'male', label: 'ولد 2', render: () => boyAvatar('medium', 'brown', 'green') },
  boy3: { id: 'boy3', gender: 'male', label: 'ولد 3', render: () => boyAvatar('tan', 'darkBrown', 'orange') },
  
  girl1: { id: 'girl1', gender: 'female', label: 'بنت 1', render: () => girlAvatar('light', 'pink') },
  girl2: { id: 'girl2', gender: 'female', label: 'بنت 2', render: () => girlAvatar('medium', 'purple') },
  girl3: { id: 'girl3', gender: 'female', label: 'بنت 3', render: () => girlAvatar('tan', 'teal') }
};

export function getAvatar(id) {
  return AVATARS[id] || AVATARS.boy1;
}

export function renderAvatar(avatarId, sizeClass = 'avatar-md') {
  const avatar = getAvatar(avatarId);
  return `<div class="avatar ${sizeClass}">${avatar.render()}</div>`;
}

export function getAvatarsForGender(gender) {
  return Object.values(AVATARS).filter(a => {
    if (gender === 'ذكر') return a.gender === 'male';
    if (gender === 'أنثى') return a.gender === 'female';
    return true;
  });
}

export function renderAvatarSelector(selectedId, gender) {
  const avatars = getAvatarsForGender(gender);
  return `
    <div class="avatar-selector">
      ${avatars.map(a => `
        <div class="avatar-option ${a.id === selectedId ? 'selected' : ''}" data-avatar-id="${a.id}">
          ${a.render()}
        </div>
      `).join('')}
    </div>
  `;
}
