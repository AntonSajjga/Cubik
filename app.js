
// ================================================================
// RUBIK'S CUBE 3D PRO - MAIN APPLICATION
// ================================================================

// ================================================================
// 1. СИСТЕМА ПЕРЕКЛАДІВ
// ================================================================
let translations = {};
let currentLang = localStorage.getItem('rubik_language') || 'en';

async function loadTranslations(lang) {
    const cacheKey = `translations_${lang}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            translations = JSON.parse(cached);
            return translations;
        } catch (e) {}
    }

    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) throw new Error('Мова не знайдена');
        translations = await response.json();
        localStorage.setItem(cacheKey, JSON.stringify(translations));
        localStorage.setItem('rubik_language', lang);
        return translations;
    } catch (error) {
        console.warn('⚠️ Не вдалося завантажити мову:', lang, error);
        if (lang !== 'en') {
            try {
                const fallback = await fetch('locales/en.json');
                translations = await fallback.json();
                localStorage.setItem(cacheKey, JSON.stringify(translations));
                return translations;
            } catch (e) {}
        }
        translations = {
            moves: 'Moves:', settings: 'Settings', sound: 'Sound',
            choose: 'Choose combination...', auto_hint: 'Press Auto to start',
            manual: 'Manual', auto: 'Auto', choose_algo: '🎓 Choose algorithm...',
            basic: '👶 Basic Algorithms', pro_cfop: '🧒 PRO: Advanced Speedcubing (CFOP)',
            pro_patterns: '🧔 PRO: Creative Art & Patterns', right_sexy: 'Right Sexy Move',
            left_sexy: 'Left Sexy Move', sledgehammer: 'Sledgehammer', sune: 'Sune OLL',
            four_corners: 'Four Corners Swap', anti_sune: 'Anti-Sune OLL',
            j_perm: 'J-Permutation', y_perm: 'Y-Permutation', a_perm: 'A-Permutation',
            ua_perm: 'Ua-Permutation', ub_perm: 'Ub-Permutation', e_perm: 'E-Permutation',
            t_perm: 'T-Permutation', cube_in_cube: 'Cube in a Cube',
            dot_pattern: 'Dot Pattern', snake_pattern: 'Snake Pattern',
            stripes_pattern: 'Stripes / Banded Pattern', double_cross: 'Double Cross Pattern',
            nested_cube: 'Nested Cube Pattern', scramble: '🔀 Scramble',
            pro: '🛟 PRO', reset: '⟳ Reset', settings_title: '⚙️ Settings',
            version: 'Version', language: 'Language', social: 'Social Networks',
            rating: 'Rating', share: 'Share with Friends', feedback: 'Feedback',
            close: '✕ Close', facebook: 'Facebook', instagram: 'Instagram',
            youtube: 'YouTube', telegram: 'Telegram', tiktok: 'TikTok', x: 'X',
            gmail: 'Gmail', pro_title: '🏆 LogixCube PRO',
            pro_desc: 'Select subscription plan or enter your license key:',
            monthly: 'Monthly', yearly: 'Yearly', month: '/ month', save_50: 'Save 50%',
            subscribe_month: '🛒 Subscribe for $4.99 / mo',
            subscribe_year: '🛒 Subscribe for $29.99 / yr',
            activate: 'Activate PRO', close_pro: 'Close', enter_key: 'XXXXX-XXXXX-XXXXX',
            pro_locked: '🔒 Algorithm available in PRO version!',
            pro_activated: '👑 PRO Mode activated for 2 hours!',
            pro_activated_license: '🎉 PRO version activated!',
            invalid_key: '❌ Invalid key!', connection_error: 'Connection error.',
            share_title: "Rubik's Cube 3D",
            share_text: "Try Rubik's Cube 3D! Solve and learn algorithms! 🎲",
            share_copied: '📋 Link copied! Share with friends.', copy_link: 'Copy link:',
            email_subject: "Feedback Rubik's Cube 3D",
            lang_uk: 'Ukrainian', lang_en: 'English', lang_de: 'German',
            lang_fr: 'French', lang_es: 'Spanish', lang_it: 'Italian',
            lang_pl: 'Polish', lang_pt: 'Portuguese', lang_ja: 'Japanese',
            lang_ko: 'Korean', loading: 'Loading...', init_3d: 'Initializing 3D...',
            creating_scene: 'Creating scene...', setup_renderer: 'Setting up renderer...',
            setup_controls: 'Setting up controls...', building_cube: 'Building cube...',
            checking_pro: 'Checking PRO status...', starting_animation: 'Starting animation...',
            done: 'Done!', cross_oll: 'Yellow Cross', edge_insert_right: 'Insert edge right',
            edge_insert_left: 'Insert edge left', yearly_algo: 'Mirror Corner',
            yearly_only: '🔒 This algorithm is available only with yearly PRO subscription!'
        };
        return translations;
    }
}

function applyLanguage(lang) {
    const t = translations;
    if (!t || Object.keys(t).length === 0) return;

    // Оновлення тексту завантаження
    const loaderEl = document.getElementById('loader-text');
    if (loaderEl) loaderEl.textContent = t.loading || 'Loading...';

    document.querySelector('.stat-badge').innerHTML = t.moves + ' <span id="counter">' + document.getElementById('counter').innerText + '</span>';
    document.getElementById('settings-btn').title = t.settings;
    document.getElementById('sound-btn').title = t.sound;
    document.getElementById('help-btn').title = 'Показати мітки';

    if (!storedAlgoStr) {
        document.getElementById('algo-display').innerText = t.choose;
    } else {
        updateAlgoDisplay();
    }

    document.getElementById('mode-manual').innerText = t.manual;
    document.getElementById('mode-auto').innerText = t.auto;

    document.querySelector('.action-btn').innerHTML = t.scramble;
    document.getElementById('reset-btn').innerHTML = t.reset;
    updateProUI();

    const settingsItems = document.querySelectorAll('.settings-item');
    const settingsLabels = [
        { icon: '📦', text: t.version },
        { icon: '🌐', text: t.language },
        { icon: '📱', text: t.social },
        { icon: '⭐', text: t.rating },
        { icon: '🫂', text: t.share },
        { icon: '💬', text: t.feedback }
    ];
    settingsItems.forEach((item, index) => {
        if (index < settingsLabels.length) {
            const label = item.querySelector('.label');
            if (label) {
                label.innerHTML = `<span class="icon">${settingsLabels[index].icon}</span> ${settingsLabels[index].text}`;
            }
        }
    });

    const socialLinks = document.querySelectorAll('.social-link');
    const socialData = [
        { icon: 'icons/facebook.svg', name: t.facebook || 'Facebook' },
        { icon: 'icons/instagram.svg', name: t.instagram || 'Instagram' },
        { icon: 'icons/youtube.svg', name: t.youtube || 'YouTube' },
        { icon: 'icons/telegram.svg', name: t.telegram || 'Telegram' },
        { icon: 'icons/tiktok.svg', name: t.tiktok || 'TikTok' },
        { icon: 'icons/x.svg', name: t.x || 'X' }
    ];
    socialLinks.forEach((link, index) => {
        if (index < socialData.length) {
            link.innerHTML = `<img src="${socialData[index].icon}" width="18" height="18" alt="" style="vertical-align:middle;margin-right:4px;"> ${socialData[index].name}`;
        }
    });

    document.querySelector('.settings-close-btn').innerText = t.close;
    document.querySelector('#settings-modal h2').innerHTML = t.settings_title;

    const langOptions = document.querySelectorAll('.lang-option');
    const langNames = {
        'uk': t.lang_uk, 'en': t.lang_en, 'de': t.lang_de,
        'fr': t.lang_fr, 'es': t.lang_es, 'it': t.lang_it,
        'pl': t.lang_pl, 'pt': t.lang_pt, 'ja': t.lang_ja, 'ko': t.lang_ko
    };
    langOptions.forEach(el => {
        const langKey = el.getAttribute('data-lang');
        if (langKey && langNames[langKey]) {
            const flag = el.textContent.match(/^[^\s]+\s/)?.[0] || '';
            el.textContent = flag + langNames[langKey];
        }
    });

    document.querySelector('#pro-modal h3').innerHTML = t.pro_title;
    document.querySelector('#pro-modal .modal-content p').innerHTML = t.pro_desc;
    document.getElementById('plan-monthly').querySelector('.plan-title').innerText = t.monthly;
    document.getElementById('plan-yearly').querySelector('.plan-title').innerText = t.yearly;
    document.querySelector('#plan-monthly .plan-badge').innerText = t.month;
    document.querySelector('#plan-yearly .plan-badge').innerText = t.save_50;
    const buyBtn = document.getElementById('buy-btn-link');
    if (currentSelectedPlan === 'monthly') {
        buyBtn.innerText = t.subscribe_month;
    } else {
        buyBtn.innerText = t.subscribe_year;
    }
    document.querySelector('.modal-btn-confirm').innerText = t.activate;
    document.querySelector('#pro-modal .close-modal-btn').innerText = t.close_pro;
    document.getElementById('license-key-input').placeholder = t.enter_key;

    document.title = t.share_title + ' PRO';

    updateAlgorithmList();
}

async function setLanguage(lang, element) {
    document.querySelectorAll('.lang-option').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    await loadTranslations(lang);
    applyLanguage(lang);
    localStorage.setItem('rubik_language', lang);
}

async function initLanguage() {
    await loadTranslations(currentLang);
    applyLanguage(currentLang);
    document.querySelectorAll('.lang-option').forEach(el => {
        if (el.getAttribute('data-lang') === currentLang) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// ================================================================
// 2. ОСНОВНІ ГЛОБАЛЬНІ ЗМІННІ
// ================================================================
let scene, camera, renderer, controls, cubies = [];
let moveQueue = [];
let historyMoves = [];
let isAnimating = false;
let isRestoring = false;
let isScrambling = false;
let moveCount = 0;
let currentMode = 'manual';
let isMuted = false;
let isProUser = false;
let isYearlyPro = false;
let storedAlgoStr = "";
let activeAlgoSteps = [];
let currentStepIndex = -1;
let animFrameId = null;
let faceLabelsGroup = new THREE.Group();
let showLabels = false;
const pivot = new THREE.Group();
const CUBIE_SIZE = 0.98;
const PLASTIC_COLOR = '#2b2b32';
let currentProgress = 0;
let currentSelectedPlan = 'monthly';
let lastSolvedState = true;

// ================================================================
// 3. БЕЗПЕЧНА ПЕРЕВІРКА АДМІН-КЛЮЧА
// ================================================================
const ADMIN_KEY_HASH = "8381f59d38bb9ba78520e60ba87bf4a2e56dac64099e0f7064d7b2df5618e396";
async function hashString(str) {
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

let proAttempts = 0;
const MAX_ATTEMPTS = 5;

const FREE_ALGORITHMS = [
    "R U R' U'", "L' U' L U", "R' F R F'", "R U R' U R U2 R'", "U R U' L' U R' U' L"
];

const COLORS = {
    U: '#fffb00', D: '#ffffff', R: '#00ff66',
    L: '#0066ff', F: '#ff0055', B: '#ff7700'
};
const FACE_NORMALS = {
    R: new THREE.Vector3(1, 0, 0),
    L: new THREE.Vector3(-1, 0, 0),
    U: new THREE.Vector3(0, 1, 0),
    D: new THREE.Vector3(0, -1, 0),
    F: new THREE.Vector3(0, 0, 1),
    B: new THREE.Vector3(0, 0, -1)
};
const THEMES = {
    dark: { gradient: 'linear-gradient(135deg, #09090e 0%, #141420 100%)', clearColor: 0x09090e },
    mint: { gradient: 'linear-gradient(180deg, #529b89 0%, #3d796a 100%)', clearColor: 0x529b89 },
    teal: { gradient: 'linear-gradient(135deg, #142824 0%, #0a1412 100%)', clearColor: 0x142824 }
};
const STORE_URLS = {
    monthly: "https://logixcube.lemonsqueezy.com/checkout/buy/a9c73a40-c798-4914-8682-1c4ca210f04f",
    yearly: "https://logixcube.lemonsqueezy.com/checkout/buy/e5280fde-1c68-4504-8c23-22d464aff311"
};

// ================================================================
// 4. ФУНКЦІЇ ТЕКСТУР, МІТОК, ПОБУДОВИ КУБА
// ================================================================
function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + h - r);
    ctx.quadraticCurveTo(x, y + h, x, y + r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function createFaceTexture(hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PLASTIC_COLOR;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = hexColor;
    drawRoundedRect(ctx, 12, 12, 232, 232, 28);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createXeroxLogoTexture(hexColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = PLASTIC_COLOR;
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = hexColor;
    drawRoundedRect(ctx, 7, 7, 114, 114, 16);
    ctx.fill();

    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(32, 25); ctx.lineTo(46, 25); ctx.lineTo(64, 49); ctx.lineTo(50, 49); ctx.fill();
    ctx.beginPath(); ctx.moveTo(96, 25); ctx.lineTo(82, 25); ctx.lineTo(64, 49); ctx.lineTo(78, 49); ctx.fill();
    ctx.beginPath(); ctx.moveTo(32, 79); ctx.lineTo(46, 79); ctx.lineTo(64, 55); ctx.lineTo(50, 55); ctx.fill();
    ctx.beginPath(); ctx.moveTo(96, 79); ctx.lineTo(82, 79); ctx.lineTo(64, 55); ctx.lineTo(78, 55); ctx.fill();

    ctx.strokeStyle = '#141420';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(36, 52); ctx.lineTo(92, 52); ctx.stroke();

    ctx.fillStyle = '#141420';
    ctx.font = '900 9px "Courier New", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = "LOGIXCUBE";
    ctx.fillText(text.split('').join(' '), 64, 102);

    return new THREE.CanvasTexture(canvas);
}

function createLabelSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(20, 20, 30, 0.85)';
    ctx.beginPath(); ctx.arc(64, 64, 50, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = color; ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 55px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);

    const spriteMaterial = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.8, 0.8, 0.8);
    return sprite;
}

function getPhysicalFace(virtualLabel) {
    if (!camera) return virtualLabel;

    const viewDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    const upDir = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

    const axes = {
        'R': new THREE.Vector3(1, 0, 0),
        'L': new THREE.Vector3(-1, 0, 0),
        'U': new THREE.Vector3(0, 1, 0),
        'D': new THREE.Vector3(0, -1, 0),
        'F': new THREE.Vector3(0, 0, 1),
        'B': new THREE.Vector3(0, 0, -1)
    };

    const targets = {
        F: viewDir.clone().negate(),
        B: viewDir,
        R: rightDir,
        L: rightDir.clone().negate(),
        U: upDir,
        D: upDir.clone().negate()
    };

    const target = targets[virtualLabel];
    if (!target) return virtualLabel;

    let bestFace = 'F';
    let bestDot = -Infinity;
    for (const [face, vec] of Object.entries(axes)) {
        const dot = vec.dot(target);
        if (dot > bestDot) {
            bestDot = dot;
            bestFace = face;
        }
    }
    return bestFace;
}

function updateFaceLabels() {
    scene.remove(faceLabelsGroup);
    faceLabelsGroup = new THREE.Group();

    if (!showLabels) {
        scene.add(faceLabelsGroup);
        return;
    }

    const viewDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    const upDir = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

    const axes = {
        'R': new THREE.Vector3(1, 0, 0),
        'L': new THREE.Vector3(-1, 0, 0),
        'U': new THREE.Vector3(0, 1, 0),
        'D': new THREE.Vector3(0, -1, 0),
        'F': new THREE.Vector3(0, 0, 1),
        'B': new THREE.Vector3(0, 0, -1)
    };

    function getBestAxis(target) {
        let maxDot = -Infinity, best = 'R';
        for (const [key, vec] of Object.entries(axes)) {
            const dot = vec.dot(target);
            if (dot > maxDot) { maxDot = dot; best = key; }
        }
        return best;
    }

    const labelMap = {};
    labelMap[getBestAxis(viewDir.clone().negate())] = 'F';
    labelMap[getBestAxis(viewDir)] = 'B';
    labelMap[getBestAxis(rightDir)] = 'R';
    labelMap[getBestAxis(rightDir.clone().negate())] = 'L';
    labelMap[getBestAxis(upDir)] = 'U';
    labelMap[getBestAxis(upDir.clone().negate())] = 'D';

    const colorMap = {
        'R': '#00ff66', 'L': '#0066ff', 'U': '#fffb00',
        'D': '#ffffff', 'F': '#ff0055', 'B': '#ff7700'
    };

    const positions = {
        'R': new THREE.Vector3(2.1, 0, 0),
        'L': new THREE.Vector3(-2.1, 0, 0),
        'U': new THREE.Vector3(0, 2.1, 0),
        'D': new THREE.Vector3(0, -2.1, 0),
        'F': new THREE.Vector3(0, 0, 2.1),
        'B': new THREE.Vector3(0, 0, -2.1)
    };

    for (const [phys, pos] of Object.entries(positions)) {
        const letter = labelMap[phys] || phys;
        const color = colorMap[phys] || '#ffffff';
        const sprite = createLabelSprite(letter, color);
        sprite.position.copy(pos);
        faceLabelsGroup.add(sprite);
    }

    scene.add(faceLabelsGroup);
}

function toggleFaceLabels() {
    showLabels = !showLabels;
    if (showLabels) {
        updateFaceLabels();
    } else {
        scene.remove(faceLabelsGroup);
        faceLabelsGroup = new THREE.Group();
        scene.add(faceLabelsGroup);
    }
    document.getElementById('help-btn').classList.toggle('active', showLabels);
}

let cachedCubeGeom = null;
let cachedInternalMat = null;
let cachedCubeMaterials = null;

function getCubeAssets() {
    if (!cachedCubeGeom) {
        cachedCubeGeom = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
    }
    if (!cachedInternalMat) {
        cachedInternalMat = new THREE.MeshLambertMaterial({ color: PLASTIC_COLOR, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    }
    if (!cachedCubeMaterials) {
        cachedCubeMaterials = [
            new THREE.MeshBasicMaterial({ map: createFaceTexture(COLORS.R), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
            new THREE.MeshBasicMaterial({ map: createFaceTexture(COLORS.L), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
            new THREE.MeshBasicMaterial({ map: createFaceTexture(COLORS.U), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
            new THREE.MeshBasicMaterial({ map: createFaceTexture(COLORS.D), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
            new THREE.MeshBasicMaterial({ map: createXeroxLogoTexture(COLORS.D), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
            new THREE.MeshBasicMaterial({ map: createFaceTexture(COLORS.F), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
            new THREE.MeshBasicMaterial({ map: createFaceTexture(COLORS.B), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
        ];
    }
    return { geom: cachedCubeGeom, internalMat: cachedInternalMat, materials: cachedCubeMaterials };
}

function buildCube() {
    cubies.forEach(c => scene.remove(c));
    cubies = [];

    const { geom, internalMat, materials } = getCubeAssets();

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                if (x === 0 && y === 0 && z === 0) continue;
                const isWhiteCenter = (x === 0 && y === -1 && z === 0);
                const mats = [
                    x === 1 ? materials[0] : internalMat,
                    x === -1 ? materials[1] : internalMat,
                    y === 1 ? materials[2] : internalMat,
                    y === -1 ? (isWhiteCenter ? materials[4] : materials[3]) : internalMat,
                    z === 1 ? materials[5] : internalMat,
                    z === -1 ? materials[6] : internalMat
                ];
                const mesh = new THREE.Mesh(geom, mats);
                mesh.position.set(x, y, z);
                mesh.userData.solvedPos = { x: x, y: y, z: z };
                scene.add(mesh);
                cubies.push(mesh);
            }
        }
    }
    updateFaceLabels();
}

// ================================================================
// 5. ІНІЦІАЛІЗАЦІЯ 3D
// ================================================================
let isFirstRender = true;

function init3D() {
    initLanguage().then(() => {
        const container = document.getElementById('canvas-container');

        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js не завантажено!');
            document.getElementById('canvas-container').innerHTML = `
                <div style="display:flex; align-items:center; justify-content:center; height:100%; flex-direction:column; gap:10px; color:#fff; text-align:center; padding:20px;">
                    <h2>⚠️ Помилка завантаження</h2>
                    <p>Не вдалося завантажити 3D-рушій.<br>Перевірте з'єднання з інтернетом.</p>
                    <button onclick="location.reload()" style="padding:10px 30px; background:#27ae60; border:none; color:#fff; border-radius:8px; font-size:16px; cursor:pointer;">Оновити</button>
                </div>
            `;
            document.getElementById('canvas-container').classList.add('loaded');
            hideLoadingScreen();
            return;
        }

        const t = translations;
        updateProgress(10, t.init_3d);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(6.5, 5.0, 9.5);

        updateProgress(40, t.setup_renderer);
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            precision: 'highp',
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x529b89, 1);
        container.appendChild(renderer.domElement);
        container.style.background = 'linear-gradient(180deg, #529b89 0%, #3d796a 100%)';

        updateProgress(55, t.setup_controls);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.target.set(0, -1.2, 0);
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        controls.minDistance = 2.5;
        controls.maxDistance = 25;
        controls.zoomSpeed = -1.2;

        controls.addEventListener('change', function() {
            if (showLabels) updateFaceLabels();
        });

        scene.add(new THREE.AmbientLight(0xffffff, 0.85));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.35);
        dirLight.position.set(5, 15, 7);
        scene.add(dirLight);
        scene.add(pivot);

        updateProgress(70, t.building_cube);
        buildCube();
        cubies.forEach(cubie => {
            if (Array.isArray(cubie.material)) {
                cubie.material.forEach(mat => {
                    if (mat.map) mat.map.needsUpdate = true;
                    mat.needsUpdate = true;
                });
            }
        });

        updateProgress(85, t.checking_pro);
        checkProStatus();

        loadSavedStateSync();

        if (renderer && scene && camera) {
            if (typeof renderer.compile === 'function') {
                renderer.compile(scene, camera);
            }
            renderer.render(scene, camera);
        }

        isFirstRender = true;
        container.classList.add('loaded');

        window.addEventListener('resize', onWindowResize);

        updateProgress(95, t.starting_animation);
        animateLoop();

        updateProgress(100, t.done);
        setTimeout(() => {
            hideLoadingScreen();
            appInitialLoadComplete = true;
        }, 300);
    });
}

function handleContextLost(event) {
    event.preventDefault();
    console.warn('⚠️ WebGL контекст втрачено. Перезавантажуємо...');
    setTimeout(() => { location.reload(); }, 1000);
}

function restoreCubeAfterContextLoss() {
    if (!renderer || !scene || !camera) return;
    buildCube();
    if (historyMoves.length > 0) {
        isRestoring = true;
        historyMoves.forEach(move => executeInstantMove(move));
        isRestoring = false;
    }
    const currentTheme = document.querySelector('.theme-dot.active');
    if (currentTheme) {
        const themeKey = currentTheme.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'mint';
        switchTheme(themeKey, currentTheme);
    } else {
        renderer.setClearColor(0x529b89, 1);
    }
    renderer.render(scene, camera);
}

function handleContextRestored() {
    console.log('✅ WebGL контекст відновлено');
    restoreCubeAfterContextLoss();
}

function animateLoop() {
    requestAnimationFrame(animateLoop);
    if (!renderer) return;
    if (isFirstRender) {
        isFirstRender = false;
        controls.update();
        renderer.render(scene, camera);
        return;
    }
    if (!isAnimating && moveQueue.length > 0 && !isRestoring) {
        if (activeAlgoSteps.length > 0 && currentMode === 'auto') {
            currentStepIndex++;
            updateAlgoDisplay();
        }
        const nextMove = moveQueue.shift();
        historyMoves.push(nextMove);
        if (!isScrambling) {
            moveCount++;
            document.getElementById('counter').innerText = moveCount;
        }
        saveState();
        executeMove(nextMove);
    }
    controls.update();
    renderer.render(scene, camera);
}

function getLayerCubies(face) {
    return cubies.filter(c => {
        if (face === 'R') return c.position.x > 0.5;
        if (face === 'L') return c.position.x < -0.5;
        if (face === 'U') return c.position.y > 0.5;
        if (face === 'D') return c.position.y < -0.5;
        if (face === 'F') return c.position.z > 0.5;
        if (face === 'B') return c.position.z < -0.5;
        return false;
    });
}

function executeInstantMove(moveStr) {
    const isPrime = moveStr.includes("'");
    const isDouble = moveStr.includes("2");
    const face = moveStr[0];
    const layer = getLayerCubies(face);

    pivot.position.set(0, 0, 0);
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();

    layer.forEach(c => pivot.attach(c));

    let angle = Math.PI / 2;
    if (face === 'R' || face === 'U' || face === 'F') angle = -angle;
    if (isPrime) angle = -angle;
    if (isDouble) angle = angle * 2;

    if (face === 'R' || face === 'L') pivot.rotation.x = angle;
    if (face === 'U' || face === 'D') pivot.rotation.y = angle;
    if (face === 'F' || face === 'B') pivot.rotation.z = angle;

    pivot.updateMatrixWorld();
    const tempArray = [...pivot.children];
    tempArray.forEach(c => {
        scene.attach(c);
        c.position.x = Math.round(c.position.x);
        c.position.y = Math.round(c.position.y);
        c.position.z = Math.round(c.position.z);
        c.rotation.x = Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
        c.rotation.y = Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
        c.rotation.z = Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
    });
    updateFaceLabels();
}

function executeMove(moveStr) {
    isAnimating = true;
    updateResetButtonState();
    playClickSound();

    const isPrime = moveStr.includes("'");
    const isDouble = moveStr.includes("2");
    const face = moveStr[0];
    const layer = getLayerCubies(face);

    pivot.position.set(0, 0, 0);
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();

    layer.forEach(c => pivot.attach(c));

    let angle = Math.PI / 2;
    if (face === 'R' || face === 'U' || face === 'F') angle = -angle;
    if (isPrime) angle = -angle;
    if (isDouble) angle = angle * 2;

    let progress = 0;
    let duration = (isScrambling || currentMode === 'auto') ? 38 : (moveQueue.length > 2 ? 12 : 25);

    function animateRotation() {
        progress++;
        const step = angle / duration;

        if (face === 'R' || face === 'L') pivot.rotation.x += step;
        if (face === 'U' || face === 'D') pivot.rotation.y += step;
        if (face === 'F' || face === 'B') pivot.rotation.z += step;

        if (progress < duration) {
            animFrameId = requestAnimationFrame(animateRotation);
        } else {
            pivot.updateMatrixWorld();
            const tempArray = [...pivot.children];
            tempArray.forEach(c => {
                scene.attach(c);
                c.position.x = Math.round(c.position.x);
                c.position.y = Math.round(c.position.y);
                c.position.z = Math.round(c.position.z);
                c.rotation.x = Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
                c.rotation.y = Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
                c.rotation.z = Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
            });

            isAnimating = false;
            animFrameId = null;
            if (isScrambling && moveQueue.length === 0) isScrambling = false;
            updateResetButtonState();
            updateFaceLabels();
            checkSolved();
        }
    }
    animFrameId = requestAnimationFrame(animateRotation);
}

function updateAlgoDisplay() {
    const container = document.getElementById('algo-display');
    const t = translations;
    if (!storedAlgoStr || activeAlgoSteps.length === 0) {
        container.innerHTML = t.choose;
        return;
    }
    if (currentMode === 'manual') {
        container.innerHTML = activeAlgoSteps.map(step =>
            `<span class="algo-step">${step}</span>`
        ).join(' ') + ' ⏸️ ' + t.auto_hint;
        return;
    }
    let html = '';
    activeAlgoSteps.forEach((step, idx) => {
        let cls = 'algo-step';
        if (idx === currentStepIndex) cls += ' current';
        if (idx < currentStepIndex) cls += ' done';
        html += `<span class="${cls}">${step}</span>`;
    });
    container.innerHTML = html;
}

function handleMove(move) {
    const base = move[0];
    const suffix = move.substring(1);
    const physicalBase = getPhysicalFace(base);
    const physicalMove = physicalBase + suffix;
    moveQueue.push(physicalMove);
    updateResetButtonState();
}

function setMode(mode) {
    if (mode === 'auto' && storedAlgoStr && activeAlgoSteps.length > 0) {
        moveQueue = [];
        activeAlgoSteps = storedAlgoStr.split(' ');
        currentStepIndex = -1;
        activeAlgoSteps.forEach(step => {
            const base = step[0];
            const suffix = step.slice(1);
            moveQueue.push(getPhysicalFace(base) + suffix);
        });
        updateAlgoDisplay();
    }
    currentMode = mode;
    document.querySelectorAll('.mode-toggle').forEach(el => el.classList.remove('active'));
    document.getElementById(mode === 'auto' ? 'mode-auto' : 'mode-manual').classList.add('active');
    if (mode === 'manual') {
        moveQueue = [];
        currentStepIndex = -1;
        updateAlgoDisplay();
    }
    updateResetButtonState();
    saveState();
}

function triggerScramble() {
    isScrambling = true;
    updateResetButtonState();
    const moves = ['U', 'D', 'R', 'L', 'F', 'B', "U'", "D'", "R'", "L'", "F'", "B'"];
    for (let i = 0; i < 20; i++) {
        const m = moves[Math.floor(Math.random() * moves.length)];
        const base = m[0];
        const suffix = m.slice(1);
        moveQueue.push(getPhysicalFace(base) + suffix);
    }
}

function triggerReset() {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    while (pivot.children.length > 0) {
        scene.attach(pivot.children[0]);
    }
    pivot.rotation.set(0, 0, 0);
    pivot.position.set(0, 0, 0);
    moveQueue = []; historyMoves = []; activeAlgoSteps = [];
    currentStepIndex = -1; isAnimating = false; isScrambling = false; moveCount = 0; storedAlgoStr = "";
    localStorage.removeItem('rubik_cube_save_data');
    document.getElementById('counter').innerText = '0';
    const t = translations;
    document.getElementById('algo-display').innerText = t.choose;
    const btn = document.getElementById('alg-select-btn');
    if (btn) btn.textContent = t.choose_algo;
    document.querySelectorAll('.algo-item').forEach(el => el.classList.remove('selected'));
    buildCube();
    lastSolvedState = true;
    if (controls) controls.target.set(0, -1.2, 0);
    updateResetButtonState();
    updateFaceLabels();
}

function saveState() {
    localStorage.setItem('rubik_cube_save_data', JSON.stringify({
        historyMoves: historyMoves,
        moveCount: moveCount,
        storedAlgoStr: storedAlgoStr,
        currentMode: currentMode
    }));
}

function loadSavedStateSync() {
    const savedRaw = localStorage.getItem('rubik_cube_save_data');
    if (!savedRaw) return;

    try {
        const data = JSON.parse(savedRaw);
        if (data.historyMoves && data.historyMoves.length > 0) {
            isRestoring = true;
            historyMoves = [...data.historyMoves];
            moveCount = data.moveCount || 0;
            document.getElementById('counter').innerText = moveCount;
            if (data.storedAlgoStr) {
                storedAlgoStr = data.storedAlgoStr;
                activeAlgoSteps = storedAlgoStr.split(' ');
                updateAlgoDisplay();
            }
            if (data.currentMode) {
                currentMode = data.currentMode;
                document.querySelectorAll('.mode-toggle').forEach(el => el.classList.remove('active'));
                document.getElementById(data.currentMode === 'auto' ? 'mode-auto' : 'mode-manual').classList.add('active');
            }
            historyMoves.forEach(move => executeInstantMove(move));
            isRestoring = false;
            updateFaceLabels();
        } else {
            if (data.currentMode) {
                currentMode = data.currentMode;
                document.querySelectorAll('.mode-toggle').forEach(el => el.classList.remove('active'));
                document.getElementById(data.currentMode === 'auto' ? 'mode-auto' : 'mode-manual').classList.add('active');
            }
            if (data.storedAlgoStr) {
                storedAlgoStr = data.storedAlgoStr;
                activeAlgoSteps = storedAlgoStr.split(' ');
                updateAlgoDisplay();
            }
            moveCount = data.moveCount || 0;
            document.getElementById('counter').innerText = moveCount;
            isRestoring = false;
        }
        lastSolvedState = isCubeSolved();
    } catch (err) {
        isRestoring = false;
    }
}

function switchTheme(themeKey, element) {
    document.querySelectorAll('.theme-dot').forEach(dot => dot.classList.remove('active'));
    element.classList.add('active');
    const theme = THEMES[themeKey];
    if (!theme) return;
    document.body.style.background = theme.gradient;
    const container = document.getElementById('canvas-container');
    if (container) container.style.background = theme.gradient;
    if (renderer) {
        renderer.setClearColor(theme.clearColor, 1);
        renderer.render(scene, camera);
    }
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

// ================================================================
// 6. АЛГОРИТМИ
// ================================================================
function updateAlgorithmList() {
    const t = translations;
    const list = document.getElementById('algo-list');
    const btn = document.getElementById('alg-select-btn');
    if (!list) return;

    const optionsData = [
        { optgroup: t.basic },
        { value: "R U R' U'", text: t.right_sexy },
        { value: "L' U' L U", text: t.left_sexy },
        { value: "R' F R F'", text: t.sledgehammer },
        { value: "R U R' U R U2 R'", text: t.sune },
        { value: "U R U' L' U R' U' L", text: t.four_corners },
        { optgroup: isProUser ? t.pro_cfop : '🔒 ' + t.pro_cfop },
        { value: "R U2 R' U' R U' R'", text: isProUser ? t.anti_sune : '🔒 ' + t.anti_sune, locked: !isProUser },
        { value: "R U R' F' R U R' U' R' F R2 U' R'", text: isProUser ? t.j_perm : '🔒 ' + t.j_perm, locked: !isProUser },
        { value: "F R U' R' U' R U R' F' R U R' U' R' F R F'", text: isProUser ? t.y_perm : '🔒 ' + t.y_perm, locked: !isProUser },
        { value: "R' F R' B2 R F' R' B2 R2", text: isProUser ? t.a_perm : '🔒 ' + t.a_perm, locked: !isProUser },
        { value: "R U' R U R U R U' R' U' R2", text: isProUser ? t.ua_perm : '🔒 ' + t.ua_perm, locked: !isProUser },
        { value: "R2 U R U R' U' R' U' R' U R'", text: isProUser ? t.ub_perm : '🔒 ' + t.ub_perm, locked: !isProUser },
        { value: "R' U R' U' R D' R' D R' U2 R D' R' D R2", text: isProUser ? t.e_perm : '🔒 ' + t.e_perm, locked: !isProUser },
        { value: "R U R' U' R' F R2 U' R' U' R U R' F'", text: isProUser ? t.t_perm : '🔒 ' + t.t_perm, locked: !isProUser },
        { value: "F R U R' U' F'", text: isProUser ? t.cross_oll : '🔒 ' + t.cross_oll, locked: !isProUser },
        { value: "U R U' R' U' F' U F", text: isProUser ? t.edge_insert_right : '🔒 ' + t.edge_insert_right, locked: !isProUser },
        { value: "U' L' U L U F U' F'", text: isProUser ? t.edge_insert_left : '🔒 ' + t.edge_insert_left, locked: !isProUser },
        { optgroup: isProUser ? t.pro_patterns : '🔒 ' + t.pro_patterns },
        { value: "F R U R' U' F' R U R' U' R' F R F'", text: isProUser ? t.cube_in_cube : '🔒 ' + t.cube_in_cube, locked: !isProUser },
        { value: "U F B' R2 B2 L2 U' D' R2 F R' L B2 U' F2 B R2 D' F2 U2", text: isProUser ? t.dot_pattern : '🔒 ' + t.dot_pattern, locked: !isProUser },
        { value: "R L U2 R' L' U2", text: isProUser ? t.snake_pattern : '🔒 ' + t.snake_pattern, locked: !isProUser },
        { value: "F2 R2 F2 R2 F2 R2", text: isProUser ? t.stripes_pattern : '🔒 ' + t.stripes_pattern, locked: !isProUser },
        { value: "U2 R2 U2 L2 U2 F2 U2 B2", text: isProUser ? t.double_cross : '🔒 ' + t.double_cross, locked: !isProUser },
        { value: "R U2 L' D2 R' U2 L D2", text: isProUser ? t.nested_cube : '🔒 ' + t.nested_cube, locked: !isProUser }
    ];

    if (isYearlyPro) {
        optionsData.push({
            value: "R' D' R D",
            text: t.yearly_algo,
            locked: false,
            yearly: true
        });
    }

    let html = '';
    optionsData.forEach(item => {
        if (item.optgroup) {
            html += `<div class="algo-group-title">${item.optgroup}</div>`;
        } else {
            const lockedClass = item.locked ? 'locked' : '';
            const selectedClass = (storedAlgoStr === item.value) ? 'selected' : '';
            const escapedValue = item.value.replace(/'/g, "\\'");
            html += `
                <div class="algo-item ${lockedClass} ${selectedClass}" onclick="selectAlgorithmFromModal('${escapedValue}', ${!!item.locked}, this)">
                    <div class="radio-circle"></div>
                    <span>${item.text}</span>
                </div>
            `;
        }
    });

    list.innerHTML = html;

    if (btn) {
        if (storedAlgoStr) {
            const found = optionsData.find(o => o.value === storedAlgoStr);
            btn.textContent = found ? found.text : t.choose_algo;
        } else {
            btn.textContent = t.choose_algo;
        }
    }
    updateAlgoDisplay();
}

function selectAlgorithmFromModal(value, isLocked, element) {
    if (isLocked) {
        const yearlyAlgoValue = "R' D' R D";
        if (value === yearlyAlgoValue) {
            const t = translations;
            alert(t.yearly_only || 'Цей алгоритм доступний тільки в річній підписці PRO!');
        } else {
            openActivationModal();
        }
        return;
    }
    const decodedValue = value.replace(/\\'/g, "'");
    selectAlgorithm(decodedValue);
    document.querySelectorAll('.algo-item').forEach(el => el.classList.remove('selected'));
    if (element) element.classList.add('selected');
    const btn = document.getElementById('alg-select-btn');
    if (btn) {
        const t = translations;
        const found = document.querySelector(`.algo-item.selected span`);
        if (found) {
            btn.textContent = found.textContent;
        } else {
            btn.textContent = t.choose_algo;
        }
    }
    updateAlgoDisplay();
    closeAlgorithmModal();
}

function openAlgorithmModal() {
    const modal = document.getElementById('algo-modal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        const t = translations;
        const modalTitle = document.getElementById('algo-modal-title');
        if (modalTitle) modalTitle.textContent = t.choose_algo;
        updateAlgorithmList();
    }
}

function closeAlgorithmModal() {
    const modal = document.getElementById('algo-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function selectAlgorithm(algoStr) {
    if (!algoStr) return;
    const t = translations;
    if (!FREE_ALGORITHMS.includes(algoStr) && !isProUser) {
        alert(t.pro_locked);
        openActivationModal();
        return;
    }
    storedAlgoStr = algoStr;
    activeAlgoSteps = algoStr.split(' ');
    currentStepIndex = -1;
    updateAlgoDisplay();
    const btn = document.getElementById('alg-select-btn');
    if (btn) {
        const optionsData = [
            { value: "R U R' U'", text: t.right_sexy },
            { value: "L' U' L U", text: t.left_sexy },
            { value: "R' F R F'", text: t.sledgehammer },
            { value: "R U R' U R U2 R'", text: t.sune },
            { value: "U R U' L' U R' U' L", text: t.four_corners },
            { value: "R U2 R' U' R U' R'", text: t.anti_sune },
            { value: "R U R' F' R U R' U' R' F R2 U' R'", text: t.j_perm },
            { value: "F R U' R' U' R U R' F' R U R' U' R' F R F'", text: t.y_perm },
            { value: "R' F R' B2 R F' R' B2 R2", text: t.a_perm },
            { value: "R U' R U R U R U' R' U' R2", text: t.ua_perm },
            { value: "R2 U R U R' U' R' U' R' U R'", text: t.ub_perm },
            { value: "R' U R' U' R D' R' D R' U2 R D' R' D R2", text: t.e_perm },
            { value: "R U R' U' R' F R2 U' R' U' R U R' F'", text: t.t_perm },
            { value: "F R U R' U' F' R U R' U' R' F R F'", text: t.cube_in_cube },
            { value: "U F B' R2 B2 L2 U' D' R2 F R' L B2 U' F2 B R2 D' F2 U2", text: t.dot_pattern },
            { value: "R L U2 R' L' U2", text: t.snake_pattern },
            { value: "F2 R2 F2 R2 F2 R2", text: t.stripes_pattern },
            { value: "U2 R2 U2 L2 U2 F2 U2 B2", text: t.double_cross },
            { value: "R U2 L' D2 R' U2 L D2", text: t.nested_cube },
            { value: "F R U R' U' F'", text: t.cross_oll },
            { value: "U R U' R' U' F' U F", text: t.edge_insert_right },
            { value: "U' L' U L U F U' F'", text: t.edge_insert_left },
            { value: "R' D' R D", text: t.yearly_algo }
        ];
        const found = optionsData.find(o => o.value === algoStr);
        btn.textContent = found ? found.text : t.choose_algo;
    }
    moveQueue = [];
    saveState();
}

function updateResetButtonState() {
    const resetBtn = document.getElementById('reset-btn');
    if (!resetBtn) return;
    if (isScrambling || isAnimating || moveQueue.length > 0) {
        resetBtn.disabled = true;
        resetBtn.style.opacity = '0.4';
        resetBtn.style.cursor = 'not-allowed';
    } else {
        resetBtn.disabled = false;
        resetBtn.style.opacity = '1';
        resetBtn.style.cursor = 'pointer';
    }
}

// ================================================================
// 7. PRO СТАТУС
// ================================================================
async function checkProStatus() {
    const saved = localStorage.getItem('rubik_license_data');
    if (!saved) {
        isProUser = false;
        isYearlyPro = false;
        updateProUI();
        return;
    }

    try {
        const data = JSON.parse(saved);
        if (data.type === 'admin') {
            const elapsed = Date.now() - data.activatedAt;
            const twoHours = 2 * 60 * 60 * 1000;
            if (elapsed > twoHours) {
                localStorage.removeItem('rubik_license_data');
                isProUser = false;
                isYearlyPro = false;
                updateProUI();
                return;
            } else {
                isProUser = true;
                isYearlyPro = true;
                updateProUI();
                return;
            }
        }

        if (data.type === 'license') {
            isProUser = true;
            isYearlyPro = (data.plan === 'yearly');
            updateProUI();
        }
    } catch (e) {
        localStorage.removeItem('rubik_license_data');
        isProUser = false;
        isYearlyPro = false;
        updateProUI();
    }
}

function updateProUI() {
    const btn = document.getElementById('pro-status-btn');
    const t = translations;

    if (isYearlyPro) {
        btn.innerText = '🎉 PRO';
        btn.style.background = '#9b59b6';
        btn.style.color = '#ffffff';
        btn.style.boxShadow = '0 0 20px rgba(155, 89, 182, 0.6)';
    } else if (isProUser) {
        btn.innerText = '🚀 PRO';
        btn.style.background = '#2ecc71';
        btn.style.color = '#1a1a1a';
        btn.style.boxShadow = '0 0 20px rgba(46, 204, 113, 0.6)';
    } else {
        btn.innerText = t.pro;
        btn.style.background = '#f39c12';
        btn.style.color = '#1a1a1a';
        btn.style.boxShadow = '0 0 15px rgba(243, 156, 18, 0.4)';
    }

    btn.style.fontWeight = '700';
    btn.style.textShadow = '0 1px 2px rgba(255,255,255,0.3)';

    updateAlgorithmList();
}

// ================================================================
// 8. ФУНКЦІЇ МОДАЛЬНИХ ВІКОН
// ================================================================
function openActivationModal() {
    document.getElementById('pro-modal').style.display = 'flex';
}

function closeActivationModal() {
    document.getElementById('pro-modal').style.display = 'none';
}

function selectPlan(planType) {
    currentSelectedPlan = planType;
    const t = translations;
    document.getElementById('plan-monthly').classList.remove('active');
    document.getElementById('plan-yearly').classList.remove('active');
    const buyLink = document.getElementById('buy-btn-link');
    if (planType === 'monthly') {
        document.getElementById('plan-monthly').classList.add('active');
        buyLink.innerText = t.subscribe_month;
    } else {
        document.getElementById('plan-yearly').classList.add('active');
        buyLink.innerText = t.subscribe_year;
    }
}

function openSelectedCheckout() {
    const t = translations;
    const checkoutUrl = STORE_URLS[currentSelectedPlan];
    if (checkoutUrl) {
        window.location.href = checkoutUrl;
    } else {
        alert(t.connection_error);
    }
}

async function validateLicense() {
    const t = translations;
    const keyInput = document.getElementById('license-key-input');
    const key = keyInput.value.trim();

    if (!key) {
        alert('Введіть ключ ліцензії!');
        return;
    }

    if (proAttempts >= MAX_ATTEMPTS) {
        alert('🔒 Забагато спроб. Перезавантажте додаток.');
        keyInput.value = '';
        return;
    }

    const userHash = await hashString(key);
    if (userHash === ADMIN_KEY_HASH) {
        localStorage.setItem('rubik_license_data', JSON.stringify({
            type: 'admin',
            activatedAt: Date.now(),
            plan: 'yearly'
        }));
        isProUser = true;
        isYearlyPro = true;
        updateProUI();
        closeActivationModal();
        keyInput.value = '';
        proAttempts = 0;
        alert('🎉 PRO активовано на 2 години!');
        return;
    }

    proAttempts++;
    try {
        const response = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                license_key: key,
                instance_id: window.location.hostname
            })
        });
        const data = await response.json();
        if (data.valid) {
            const variant = data.meta?.variant_name?.toLowerCase() || '';
            const isYearly = variant.includes('yearly') || variant.includes('річний');
            alert('🎉 PRO активовано!');
            localStorage.setItem('rubik_license_data', JSON.stringify({
                type: 'license',
                key: key,
                plan: isYearly ? 'yearly' : 'monthly'
            }));
            isProUser = true;
            isYearlyPro = isYearly;
            updateProUI();
            closeActivationModal();
            keyInput.value = '';
            proAttempts = 0;
        } else {
            alert('❌ Невірний ключ!');
        }
    } catch (error) {
        alert('❌ Помилка з\'єднання.');
    }
}

// ================================================================
// 9. НАЛАШТУВАННЯ, ЗВУК, СОЦІАЛЬНІ ФУНКЦІЇ
// ================================================================
function openSettings() {
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

document.addEventListener('click', function(e) {
    const modal = document.getElementById('settings-modal');
    if (e.target === modal) {
        closeSettings();
    }
});

function rateApp() {
    const url = 'https://play.google.com/store/apps/details?id=your.app.id';
    window.open(url, '_blank');
}

function shareApp() {
    const t = translations;
    if (navigator.share) {
        navigator.share({
            title: t.share_title,
            text: t.share_text,
            url: window.location.href
        }).catch(() => {});
    } else {
        const url = window.location.href;
        const text = t.share_text + ' ' + url;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert(t.share_copied);
            });
        } else {
            prompt(t.copy_link, text);
        }
    }
}

function feedbackApp() {
    const t = translations;
    window.location.href = 'mailto:support@your-app.com?subject=' + encodeURIComponent(t.email_subject);
}

function toggleSound() {
    isMuted = !isMuted;
    const btn = document.getElementById('sound-btn');
    btn.innerText = isMuted ? '🔇' : '🔊';
    btn.classList.toggle('muted', isMuted);
}

let audioCtx = null;
function playClickSound() {
    if (isRestoring || isMuted) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.08), audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2100, now);
        noiseFilter.Q.setValueAtTime(1.8, now);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now);
    } catch (e) {}
}

// ================================================================
// 10. ФУНКЦІЇ ЗАВАНТАЖЕННЯ
// ================================================================
function updateProgress(value, text) {
    currentProgress = Math.min(value, 100);
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const loaderText = document.querySelector('.loader-text');

    if (progressBar) progressBar.style.width = currentProgress + '%';
    if (progressText) progressText.textContent = currentProgress + '%';
    if (loaderText && text) loaderText.textContent = text;
}

function hideLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (screen) {
        screen.classList.add('hidden');
        setTimeout(() => {
            screen.style.display = 'none';
        }, 800);
    }
}

function loadLanguage() {
    const savedLang = localStorage.getItem('rubik_language') || 'en';
    const options = document.querySelectorAll('.lang-option');
    options.forEach(el => {
        const langKey = el.getAttribute('data-lang');
        if (langKey === savedLang) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    loadTranslations(savedLang).then(() => {
        applyLanguage(savedLang);
    });
}

// ================================================================
// 11. ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ
// ================================================================
function resetZoom() {
    window.scrollTo(0, 0);
    document.body.style.zoom = 1;
    if (window.visualViewport) {
        try { window.visualViewport.scale = 1; } catch(e) {}
    }
    document.body.style.transform = 'scale(1)';
    document.body.style.transform = 'none';
}

document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
document.addEventListener('dblclick', function(e) { e.preventDefault(); });

const licenseInput = document.getElementById('license-key-input');
if (licenseInput) {
    licenseInput.addEventListener('focus', function() { setTimeout(resetZoom, 50); });
    licenseInput.addEventListener('blur', function() { setTimeout(resetZoom, 300); });
    licenseInput.addEventListener('input', function() {
        if (window.visualViewport && window.visualViewport.scale > 1) resetZoom();
    });
}

window.addEventListener('orientationchange', function() { setTimeout(resetZoom, 300); });
window.addEventListener('resize', function() {
    if (window.visualViewport && window.visualViewport.scale > 1) resetZoom();
    setTimeout(resetZoom, 100);
});

let appInitialLoadComplete = false;
let appWasHidden = false;

function forceCubeResync() {
    if (!appInitialLoadComplete) return;
    if (!renderer || !scene || !camera) return;
    if (renderer.getContext && renderer.getContext().isContextLost()) {
        location.reload();
        return;
    }
    setTimeout(() => {
        restoreCubeAfterContextLoss();
    }, 50);
}

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        forceCubeResync();
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        appWasHidden = true;
    } else if (document.visibilityState === 'visible' && appWasHidden) {
        appWasHidden = false;
        forceCubeResync();
    }
});

window.addEventListener('focus', function() {
    if (appWasHidden) {
        appWasHidden = false;
        forceCubeResync();
    }
});

document.addEventListener('click', function(e) {
    if (document.getElementById('pro-modal').style.display !== 'flex') {
        setTimeout(resetZoom, 50);
    }
});

// ================================================================
// 12. ЗАПУСК
// ================================================================
window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas-container');
    if (canvas) {
        canvas.addEventListener('webglcontextlost', handleContextLost, false);
        canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    }

    init3D();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('✅ Service Worker зареєстровано'))
            .catch(err => console.error('❌ Помилка реєстрації SW:', err));
    }

    setTimeout(() => {
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }, 50);
});

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('alg-select-btn');
    if (btn) {
        btn.addEventListener('click', openAlgorithmModal);
    }
});

window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT') {
        console.warn('⚠️ Помилка завантаження скрипта:', e.target.src);
        document.body.innerHTML += `
            <div style="position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:#c0392b; color:#fff; padding:10px 20px; border-radius:8px; z-index:999; font-size:14px; text-align:center; max-width:90%;">
                ⚠️ Помилка завантаження 3D-движка. Перевірте підключення до інтернету.
            </div>
        `;
        hideLoadingScreen();
    }
}, true);
// ================================================================
// САЛЮТ ПРИ СКЛАДАННІ КУБИКА
// ================================================================

const confetti = (function() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return { spawn: () => {} };
    const ctx = canvas.getContext('2d');
    let particles = [];
    let running = false;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function spawn(count = 250) {
        resize();
        canvas.style.display = 'block';
        const colors = ['#ffcc00', '#ff0055', '#00ff66', '#0066ff', '#ff7700', '#ffffff', '#9b59b6'];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 300,
                vx: (Math.random() - 0.5) * 4,
                vy: 2 + Math.random() * 4,
                size: 6 + Math.random() * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                life: 1
            });
        }
        if (!running) {
            running = true;
            animate();
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            if (p.life <= 0) continue;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.vx *= 0.99;
            p.rotation += p.rotationSpeed;
            if (p.y > canvas.height * 0.75) p.life -= 0.02;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
            ctx.restore();
        }
        particles = particles.filter(p => p.life > 0 && p.y < canvas.height + 50);
        if (particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            running = false;
            canvas.style.display = 'none';
        }
    }
    
    return { spawn };
})();

let celebrationCooldown = 0;

function celebrate() {
    const now = Date.now();
    if (now - celebrationCooldown < 3000) return;
    celebrationCooldown = now;
    
    playVictorySound();
    showSolvedMessage();
    confetti.spawn(250);
}

function showSolvedMessage() {
    const old = document.querySelector('.solved-message');
    if (old) old.remove();
    
    const el = document.createElement('div');
    el.className = 'solved-message';
    el.innerHTML = `🎉 Кубик зібрано! 🎉<span class="sub">за ${moveCount} ходів · ${currentMode === 'auto' ? 'Auto' : 'Manual'}</span>`;
    document.body.appendChild(el);
    
    requestAnimationFrame(() => el.classList.add('show'));
    
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 600);
    }, 4000);
}

function playVictorySound() {
    if (isMuted) return;
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
        
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.7);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.8);
        });
    } catch (e) {}
}

function isCubeSolved() {
    if (!cubies || cubies.length !== 26) return false;
    if (!cachedCubeMaterials) return false;
    for (const c of cubies) {
        const sp = c.userData.solvedPos;
        if (!sp) return false;
        if (Math.abs(c.position.x - sp.x) > 0.1) return false;
        if (Math.abs(c.position.y - sp.y) > 0.1) return false;
        if (Math.abs(c.position.z - sp.z) > 0.1) return false;
    }
    const localNormals = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1)
    ];
    const expectedMaterials = [
        cachedCubeMaterials[0], cachedCubeMaterials[1], cachedCubeMaterials[2],
        cachedCubeMaterials[3], cachedCubeMaterials[5], cachedCubeMaterials[6]
    ];
    const worldDirections = [
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
    ];
    for (const c of cubies) {
        const activeFaces = [];
        if (c.position.x > 0.5) activeFaces.push(0);
        if (c.position.x < -0.5) activeFaces.push(1);
        if (c.position.y > 0.5) activeFaces.push(2);
        if (c.position.y < -0.5) activeFaces.push(3);
        if (c.position.z > 0.5) activeFaces.push(4);
        if (c.position.z < -0.5) activeFaces.push(5);
        for (const faceIdx of activeFaces) {
            const worldDir = worldDirections[faceIdx];
            let visibleLocalIdx = -1;
            let maxDot = -Infinity;
            for (let i = 0; i < 6; i++) {
                const worldNormal = localNormals[i].clone().applyQuaternion(c.quaternion);
                const dot = worldNormal.dot(worldDir);
                if (dot > maxDot) { maxDot = dot; visibleLocalIdx = i; }
            }
            if (visibleLocalIdx === -1) return false;
            if (c.material[visibleLocalIdx] !== expectedMaterials[faceIdx]) return false;
        }
    }
    return true;
}

function checkSolved() {
    if (!cubies || cubies.length !== 26) return;
    const nowSolved = isCubeSolved();
    if (!isScrambling && !isRestoring) {
        if (nowSolved && !lastSolvedState) {
            celebrate();
        }
    }
    lastSolvedState = nowSolved;
}

// ================================================================
// КІНЕЦЬ
// ================================================================
