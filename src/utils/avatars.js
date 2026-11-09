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
  
  return `<svg viewBox="-4 -4 72 72" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%;">
    <!-- Background Circle with breathing cushion -->
    <circle cx="32" cy="32" r="31" fill="${shirt}" opacity="0.16"/>
    
    <!-- Body -->
    <path d="M15 64 L15 49 C15 39, 49 39, 49 49 L49 64 Z" fill="${shirt}"/>
    
    <!-- Neck -->
    <rect x="28" y="37" width="8" height="6" rx="2" fill="${skin}"/>
    
    <!-- Head -->
    <circle cx="32" cy="27" r="13" fill="${skin}"/>
    
    <!-- Hair -->
    <path d="M17 27 C17 14, 47 14, 47 27 C47 21, 32 16, 17 27 Z" fill="${hair}"/>
    
    <!-- Eyes -->
    <circle cx="27.5" cy="27" r="1.9" fill="#2d3748"/>
    <circle cx="36.5" cy="27" r="1.9" fill="#2d3748"/>
    
    <!-- Smile -->
    <path d="M28.5 32 Q32 35.5 35.5 32" fill="none" stroke="#b46a55" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

function girlAvatar(skinTone, hijabColorKey) {
  const skin = SKIN_TONES[skinTone];
  const hijab = HIJAB_COLORS[hijabColorKey];

  return `<svg viewBox="-4 -4 72 72" xmlns="http://www.w3.org/2000/svg" style="display:block; width:100%; height:100%;">
    <!-- Background Circle with breathing cushion -->
    <circle cx="32" cy="32" r="31" fill="${hijab}" opacity="0.16"/>
    
    <!-- Body (Abaya/Dress) -->
    <path d="M14 64 L14 47 C14 37, 50 37, 50 47 L50 64 Z" fill="${hijab}"/>
    
    <!-- Hijab Back & Wrap -->
    <path d="M18 41 Q17 19 32 14 Q47 19 46 41 Q32 50 18 41 Z" fill="${hijab}"/>
    
    <!-- Inner face background for complete coverage -->
    <circle cx="32" cy="29" r="10.5" fill="${skin}"/>
    
    <!-- Hijab top inner styling -->
    <path d="M22 23 Q32 17 42 23 Q32 20 22 23 Z" fill="#ffffff" opacity="0.35"/>
    
    <!-- Eyes -->
    <circle cx="28" cy="29" r="1.9" fill="#2d3748"/>
    <circle cx="36" cy="29" r="1.9" fill="#2d3748"/>
    
    <!-- Smile -->
    <path d="M29.5 33.5 Q32 36 34.5 33.5" fill="none" stroke="#b46a55" stroke-width="2.2" stroke-linecap="round"/>
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
