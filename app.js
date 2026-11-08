/**
 * HabitFlow — мой личный трекер привычек
 * Vanilla JS SPA с localStorage и PWA
 */

// ============================================================
// 1. ХРАНИЛИЩЕ
// ============================================================
const Storage = {
  keys: {
    habits: 'hf_habits',
    categories: 'hf_categories',
    completions: 'hf_completions',
    settings: 'hf_settings',
    lastBest: 'hf_last_best'
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getHabits() {
    return this.get(this.keys.habits, []);
  },

  setHabits(habits) {
    this.set(this.keys.habits, habits);
  },

  getCategories() {
    return this.get(this.keys.categories, []);
  },

  setCategories(categories) {
    this.set(this.keys.categories, categories);
  },

  getCompletions() {
    return this.get(this.keys.completions, {});
  },

  setCompletions(completions) {
    this.set(this.keys.completions, completions);
  },

  getSettings() {
    return this.get(this.keys.settings, { theme: 'dark', userName: 'Нейронавт' });
  },

  setSettings(settings) {
    this.set(this.keys.settings, settings);
  },

  getLastBest() {
    return this.get(this.keys.lastBest, 0);
  },

  setLastBest(value) {
    this.set(this.keys.lastBest, value);
  }
};

// ============================================================
// 2. УТИЛИТЫ
// ============================================================
const Utils = {
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  today() {
    return new Date().toISOString().split('T')[0];
  },

  formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
  },

  formatDateShort(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  },

  addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  },

  startOfWeek(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    return date.toISOString().split('T')[0];
  },

  getMonthName(dateStr) {
    const [y, m] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('ru-RU', { month: 'long' });
  },

  daysInMonth(dateStr) {
    const [y, m] = dateStr.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  },

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// ============================================================
// 3. РЕСУРСЫ
// ============================================================
const ASSETS = {
  icons: [
    '💧', '📚', '🏃', '🧘', '🥗', '🛌', '💊', '🎸', '💻', '🧹',
    '🚭', '🍎', '⏰', '💰', '🎨', '✍️', '🌱', '🔋', '🏋️', '🚴',
    '🧠', '☕', '🌙', '📵', '🧼', '🪥', '🥦', '🍵', '🎧', '📅'
  ],

  colors: [
    '#00f0ff', '#ff00ff', '#ffe600', '#00ff9d', '#ff2a6d',
    '#ff8c00', '#7b61ff', '#00d2ff', '#ff5e00', '#39ff14'
  ],

  defaultCategories: [
    { id: 'cat_health', name: 'Здоровье', icon: '❤️', color: '#ff2a6d' },
    { id: 'cat_work', name: 'Работа', icon: '💼', color: '#00f0ff' },
    { id: 'cat_education', name: 'Образование', icon: '📚', color: '#7b61ff' },
    { id: 'cat_sport', name: 'Спорт', icon: '🏃', color: '#00ff9d' },
    { id: 'cat_nutrition', name: 'Питание', icon: '🥗', color: '#39ff14' },
    { id: 'cat_home', name: 'Дом', icon: '🏠', color: '#ff8c00' },
    { id: 'cat_bad', name: 'Вредные привычки', icon: '🚭', color: '#ff5e00' },
    { id: 'cat_creative', name: 'Творчество', icon: '🎨', color: '#ff00ff' },
    { id: 'cat_sleep', name: 'Сон', icon: '🌙', color: '#00d2ff' }
  ],

  sampleHabits: [
    {
      id: 'h_1',
      name: 'Выпить 2 литра воды',
      icon: '💧',
      color: '#00f0ff',
      categoryId: 'cat_health',
      frequency: { type: 'daily' },
      targetValue: 8,
      unit: 'стаканов',
      reminder: '10:00',
      monthlySkips: 2,
      archived: false,
      createdAt: '2026-10-01'
    },
    {
      id: 'h_2',
      name: 'Читать 30 минут',
      icon: '📚',
      color: '#7b61ff',
      categoryId: 'cat_education',
      frequency: { type: 'daily' },
      targetValue: 1,
      unit: 'раз',
      reminder: '21:00',
      monthlySkips: 1,
      archived: false,
      createdAt: '2026-10-01'
    },
    {
      id: 'h_3',
      name: 'Пробежка',
      icon: '🏃',
      color: '#00ff9d',
      categoryId: 'cat_sport',
      frequency: { type: 'weekly', days: ['mon', 'wed', 'fri'] },
      targetValue: 1,
      unit: 'раз',
      reminder: '07:00',
      monthlySkips: 3,
      archived: false,
      createdAt: '2026-10-01'
    }
  ]
};

// ============================================================
// 4. ЛОГИКА ПРИВЫЧЕК
// ============================================================
const HabitLogic = {
  dayNames: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],

  initData() {
    let categories = Storage.getCategories();
    if (categories.length === 0) {
      categories = ASSETS.defaultCategories.map(c => ({ ...c }));
      Storage.setCategories(categories);
    }

    let habits = Storage.getHabits();
    if (habits.length === 0) {
      habits = ASSETS.sampleHabits.map(h => ({ ...h }));
      Storage.setHabits(habits);

      // Генерируем демо-данные выполнения
      const completions = {};
      const today = Utils.today();
      habits.forEach(h => {
        completions[h.id] = {};
        for (let i = 30; i >= 0; i--) {
          const date = Utils.addDays(today, -i);
          if (Math.random() > 0.35) {
            completions[h.id][date] = h.targetValue || 1;
          }
        }
      });
      Storage.setCompletions(completions);
    }
  },

  getCategory(id) {
    return Storage.getCategories().find(c => c.id === id) || { name: 'Без категории', icon: '📌', color: '#888' };
  },

  isScheduled(habit, dateStr) {
    const freq = habit.frequency;
    if (!freq || freq.type === 'daily') return true;
    if (freq.type === 'weekly_days') {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dayName = this.dayNames[new Date(y, m - 1, d).getDay()];
      return freq.days.includes(dayName);
    }
    if (freq.type === 'weekly_count') {
      // Показываем всегда, считаем выполнение по количеству
      return true;
    }
    return true;
  },

  getCompletion(habitId, dateStr) {
    const completions = Storage.getCompletions();
    return completions[habitId]?.[dateStr] || 0;
  },

  setCompletion(habitId, dateStr, value) {
    const completions = Storage.getCompletions();
    if (!completions[habitId]) completions[habitId] = {};
    if (value <= 0) {
      delete completions[habitId][dateStr];
    } else {
      completions[habitId][dateStr] = value;
    }
    Storage.setCompletions(completions);
  },

  toggleCompletion(habitId, dateStr) {
    const habit = Storage.getHabits().find(h => h.id === habitId);
    if (!habit) return;
    const current = this.getCompletion(habitId, dateStr);
    const target = habit.targetValue || 1;
    if (current >= target) {
      this.setCompletion(habitId, dateStr, 0);
    } else {
      this.setCompletion(habitId, dateStr, target);
    }
    // Обновляем лучший рекорд
    const allHabits = Storage.getHabits().filter(h => !h.archived);
    const maxStreak = Math.max(0, ...allHabits.map(h => this.getStreak(h)));
    if (maxStreak > Storage.getLastBest()) {
      Storage.setLastBest(maxStreak);
    }
  },

  getStreak(habit) {
    const completions = Storage.getCompletions()[habit.id] || {};
    const today = Utils.today();
    let streak = 0;
    for (let i = 0; i < 3650; i++) {
      const date = Utils.addDays(today, -i);
      if (!this.isScheduled(habit, date)) continue;
      const val = completions[date] || 0;
      const target = habit.targetValue || 1;
      if (val >= target) {
        streak++;
      } else if (date !== today) {
        break;
      }
    }
    return streak;
  },

  getBestStreak(habit) {
    const completions = Storage.getCompletions()[habit.id] || {};
    let best = 0;
    let current = 0;
    const dates = Object.keys(completions).sort();
    // Найдём максимальную непрерывную серию запланированных дней
    const today = Utils.today();
    for (let i = 365; i >= 0; i--) {
      const date = Utils.addDays(today, -i);
      if (!this.isScheduled(habit, date)) continue;
      const val = completions[date] || 0;
      if (val >= (habit.targetValue || 1)) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return best;
  },

  getWeeklyProgress(habit, dateStr) {
    const start = Utils.startOfWeek(dateStr);
    const completions = Storage.getCompletions()[habit.id] || {};
    let done = 0;
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const date = Utils.addDays(start, i);
      if (!this.isScheduled(habit, date)) continue;
      total++;
      const val = completions[date] || 0;
      if (val >= (habit.targetValue || 1)) done++;
    }
    return { done, total };
  },

  getMissesThisMonth(habit) {
    const today = Utils.today();
    const [year, month] = today.split('-').map(Number);
    const todayDay = parseInt(today.split('-')[2], 10);
    const completions = Storage.getCompletions()[habit.id] || {};
    let misses = 0;
    for (let d = 1; d <= todayDay; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (!this.isScheduled(habit, date)) continue;
      const val = completions[date] || 0;
      if (val < (habit.targetValue || 1)) misses++;
    }
    return misses;
  },

  getMonthlyStats(habit) {
    const today = Utils.today();
    const [year, month] = today.split('-').map(Number);
    const daysInMonth = Utils.daysInMonth(today);
    const completions = Storage.getCompletions()[habit.id] || {};
    let done = 0;
    let scheduled = 0;
    let totalValue = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (!this.isScheduled(habit, date)) continue;
      scheduled++;
      const val = completions[date] || 0;
      if (val >= (habit.targetValue || 1)) done++;
      totalValue += val;
    }
    return { done, scheduled, totalValue, daysInMonth };
  },

  getPeriodStats(habit, days) {
    const today = Utils.today();
    const completions = Storage.getCompletions()[habit.id] || {};
    let done = 0;
    let scheduled = 0;
    for (let i = days - 1; i >= 0; i--) {
      const date = Utils.addDays(today, -i);
      if (!this.isScheduled(habit, date)) continue;
      scheduled++;
      const val = completions[date] || 0;
      if (val >= (habit.targetValue || 1)) done++;
    }
    return { done, scheduled, percent: scheduled ? Math.round((done / scheduled) * 100) : 0 };
  },

  getTotalCompleted(habit) {
    const completions = Storage.getCompletions()[habit.id] || {};
    return Object.values(completions).reduce((a, b) => a + b, 0);
  }
};

// ============================================================
// 5. UI КОМПОНЕНТЫ
// ============================================================
const UI = {
  app: document.getElementById('app'),
  main: document.getElementById('main'),
  sidebar: document.getElementById('sidebar'),
  bottomNav: document.getElementById('bottom-nav'),
  modalOverlay: document.getElementById('modal-overlay'),

  init() {
    this.applyTheme();
    this.renderNavigation();
    this.setupSidebar();
  },

  applyTheme() {
    const settings = Storage.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme);
  },

  getNavItems() {
    return [
      { id: 'home', label: 'Главная', icon: '🏠', route: 'home' },
      { id: 'today', label: 'Today', icon: '⚡', route: 'today' },
      { id: 'habits', label: 'Привычки', icon: '📋', route: 'habits' },
      { id: 'categories', label: 'Категории', icon: '📂', route: 'categories' },
      { id: 'calendar', label: 'Календарь', icon: '📅', route: 'calendar' },
      { id: 'statistics', label: 'Статистика', icon: '📊', route: 'statistics' },
      { id: 'profile', label: 'Профиль', icon: '👤', route: 'profile' }
    ];
  },

  renderNavigation() {
    const items = this.getNavItems();
    const current = Router.currentRoute;

    // Sidebar
    this.sidebar.innerHTML = `
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">⚡</div>
        <span>HabitFlow</span>
      </div>
      <nav class="sidebar-nav">
        ${items.map(item => `
          <a href="#${item.route}" class="sidebar-link ${current === item.route ? 'active' : ''}" data-route="${item.route}">
            <span class="icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        Мой личный трекер привычек © 2026
      </div>
    `;

    // Bottom nav (only main sections)
    const bottomItems = items.filter(i => ['today', 'habits', 'calendar', 'statistics', 'profile'].includes(i.route));
    this.bottomNav.innerHTML = bottomItems.map(item => `
      <a href="#${item.route}" class="bottom-nav-link ${current === item.route ? 'active' : ''}" data-route="${item.route}">
        <span class="icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `).join('');
  },

  setupSidebar() {
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.id = 'sidebar-backdrop';
    this.app.appendChild(backdrop);

    const toggle = () => {
      this.sidebar.classList.toggle('open');
      backdrop.classList.toggle('open');
    };

    backdrop.addEventListener('click', toggle);

    document.addEventListener('click', e => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        const route = link.dataset.route;
        Router.navigate(route);
        this.sidebar.classList.remove('open');
        backdrop.classList.remove('open');
      }
    });
  },

  createHeader(title, subtitle = '') {
    const settings = Storage.getSettings();
    return `
      <div class="header-bar">
        <div>
          <button class="menu-toggle" id="menu-toggle" aria-label="Открыть меню">☰</button>
          <h1 class="header-title">${title}</h1>
          ${subtitle ? `<p class="text-muted">${subtitle}</p>` : ''}
        </div>
        <div class="flex items-center gap-2">
          <span class="tag tag-cyan">${settings.theme === 'dark' ? '🌙 Тёмная' : '☀️ Светлая'}</span>
        </div>
      </div>
    `;
  },

  bindMenuToggle() {
    const btn = document.getElementById('menu-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        this.sidebar.classList.toggle('open');
        document.getElementById('sidebar-backdrop').classList.toggle('open');
      });
    }
  },

  toast(message, duration = 2500) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
  },

  openModal(content) {
    this.modalOverlay.innerHTML = content;
    this.modalOverlay.classList.add('open');
    this.modalOverlay.setAttribute('aria-hidden', 'false');

    const closeBtn = this.modalOverlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
  },

  closeModal() {
    this.modalOverlay.classList.remove('open');
    this.modalOverlay.setAttribute('aria-hidden', 'true');
    this.modalOverlay.innerHTML = '';
  },

  habitIconStyle(color) {
    return `background: ${color}15; border-color: ${color}40; color: ${color}; box-shadow: 0 0 12px ${color}30;`;
  },

  getWeekProgressLine(habit) {
    const start = Utils.startOfWeek(Utils.today());
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const completions = Storage.getCompletions()[habit.id] || {};
    return `
      <div class="flex items-center gap-2 mt-1" style="font-size:0.8rem;color:var(--text-muted)">
        ${days.map((label, i) => {
          const date = Utils.addDays(start, i);
          const done = (completions[date] || 0) >= (habit.targetValue || 1);
          return `<span style="color:${done ? habit.color : 'inherit'}">${label}</span>`;
        }).join('')}
      </div>
    `;
  }
};

// ============================================================
// 6. СТРАНИЦЫ
// ============================================================
const Pages = {
  home() {
    const settings = Storage.getSettings();
    return `
      <div class="hero">
        <div class="hero-badge">⚡ Трекер привычек</div>
        <h1 class="hero-title">HabitFlow</h1>
        <p class="hero-subtitle">
          Мой личный трекер привычек. Создан для того, чтобы выстроить дисциплину, 
          укрепить полезные привычки и превратить рутину в прогресс.
        </p>
        <div class="hero-cta">
          <a href="#today" class="btn btn-primary btn-lg" data-route="today">Начать день</a>
          <a href="#habits" class="btn btn-secondary btn-lg" data-route="habits">Мои привычки</a>
        </div>
      </div>

      <section class="section">
        <h2 class="section-title">Как это работает</h2>
        <p class="section-subtitle">Три простых шага к лучшей версии себя</p>
        <div class="grid-3">
          <div class="card feature-card">
            <div class="feature-icon">1️⃣</div>
            <h3 class="feature-title">Создай привычку</h3>
            <p class="feature-text">Выбери иконку, цвет, периодичность и цель. Назначь напоминание на удобное время.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">2️⃣</div>
            <h3 class="feature-title">Отмечай выполнение</h3>
            <p class="feature-text">Ставь галочки каждый день, следи за сериями и не срывай стрик.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">3️⃣</div>
            <h3 class="feature-title">Анализируй рост</h3>
            <p class="feature-text">Смотри статистику, тепловые карты и мотивирующие инсайты о своём прогрессе.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Ключевые возможности</h2>
        <p class="section-subtitle">Всё, что нужно для дисциплины в одном приложении</p>
        <div class="grid-2">
          <div class="card feature-card">
            <div class="feature-icon">🔥</div>
            <h3 class="feature-title">Горящие серии</h3>
            <p class="feature-text">Счётчик стриков мотивирует не прерывать цепочку выполнения привычек.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">Статистика и графики</h3>
            <p class="feature-text">Неделя, 15 и 30 дней, лучшие серии и процент выполнения по каждой привычке.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">📅</div>
            <h3 class="feature-title">Календарь и тепловая карта</h3>
            <p class="feature-text">Просматривай историю выполнения и исправляй отметки за прошлые дни.</p>
          </div>
          <div class="card feature-card">
            <div class="feature-icon">🌗</div>
            <h3 class="feature-title">Светлая и тёмная тема</h3>
            <p class="feature-text">Переключай оформление в профиле под своё настроение и время суток.</p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Пример дашборда</h2>
        <p class="section-subtitle">Так выглядит твой ежедневный экран</p>
        <div class="dashboard-preview">
          <div class="preview-row">
            <div class="preview-block">
              <div class="card-title">Привет, ${settings.userName || 'Нейронавт'}!</div>
              <p class="text-muted">Сегодня ${Utils.formatDate(Utils.today())}</p>
              <div class="progress-bar mt-2">
                <div class="progress-fill" style="width: 72%"></div>
              </div>
              <p class="text-muted mt-1">Выполнено 5 из 7</p>
            </div>
            <div class="preview-block tall">
              <div class="card-title">🔥 Стрик</div>
              <div class="stat-value">12</div>
              <p class="text-muted">дней подряд</p>
            </div>
          </div>
          <div class="preview-row">
            <div class="preview-block">
              <div class="card-title">💧 Вода</div>
              <div class="habit-streak">6 / 8 стаканов</div>
            </div>
            <div class="preview-block">
              <div class="card-title">📚 Чтение</div>
              <div class="habit-streak">✓ выполнено</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Преимущества</h2>
        <div class="grid-4">
          <div class="card stat-card">
            <div class="stat-value text-green">100%</div>
            <div class="stat-label">Работает офлайн</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value text-cyan">PWA</div>
            <div class="stat-label">Установка на телефон</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value text-magenta">∞</div>
            <div class="stat-label">Привычек без лимитов</div>
          </div>
          <div class="card stat-card">
            <div class="stat-value text-yellow">0₽</div>
            <div class="stat-label">Бесплатно навсегда</div>
          </div>
        </div>
      </section>

      <footer class="footer">
        <div class="footer-logo">HabitFlow</div>
        <p>Мой личный трекер привычек. Выстраиваю дисциплину каждый день.</p>
      </footer>
    `;
  },

  today() {
    const today = Utils.today();
    const habits = Storage.getHabits().filter(h => !h.archived);
    const scheduledHabits = habits.filter(h => HabitLogic.isScheduled(h, today));
    const completions = Storage.getCompletions();

    let completedCount = 0;
    scheduledHabits.forEach(h => {
      const val = HabitLogic.getCompletion(h.id, today);
      if (val >= (h.targetValue || 1)) completedCount++;
    });

    const total = scheduledHabits.length;
    const percent = total ? Math.round((completedCount / total) * 100) : 0;

    // Динамика
    const yesterday = Utils.addDays(today, -1);
    const yesterdayScheduled = habits.filter(h => HabitLogic.isScheduled(h, yesterday));
    const yesterdayDone = yesterdayScheduled.filter(h => {
      const val = HabitLogic.getCompletion(h.id, yesterday);
      return val >= (h.targetValue || 1);
    }).length;

    let motivation = '';
    if (completedCount === total && total > 0) {
      motivation = `🎉 Идеальный день! Все ${total} привычек выполнены. Так держать!`;
    } else if (completedCount > yesterdayDone) {
      motivation = `🔥 Сегодня вы уже на шаг впереди: ${completedCount}/${total} против ${yesterdayDone}/${yesterdayScheduled.length} вчера.`;
    } else if (completedCount < yesterdayDone) {
      motivation = `⚡ Вчера вы сделали ${yesterdayDone}/${yesterdayScheduled.length}. Сегодня ${completedCount}/${total} — подтянитесь!`;
    } else {
      motivation = `🎯 Вы держите темп вчерашнего дня. Сделайте ещё один шаг вперёд!`;
    }

    if (completedCount < total && total > 0) {
      motivation += ` <span class="text-red">Ты пропустил сегодня аяяй, завтра не пропускаем!</span>`;
    }

    // Лучше, чем вчера
    const lastBest = Storage.getLastBest();
    const currentStreak = HabitLogic.getStreak(scheduledHabits[0]);
    const streakMsg = currentStreak > lastBest
      ? `🏆 Вы держитесь уже дольше, чем в прошлый раз, на ${currentStreak - lastBest} дня!`
      : `📈 Ваш рекорд — ${lastBest} дней. Текущая серия: ${currentStreak}.`;

    // Пропуски
    let missesMsg = '';
    if (scheduledHabits.length > 0) {
      const misses = scheduledHabits.reduce((sum, h) => sum + HabitLogic.getMissesThisMonth(h), 0);
      const allowed = scheduledHabits.reduce((sum, h) => sum + (h.monthlySkips || 0), 0);
      const remaining = Math.max(0, allowed - misses);
      missesMsg = remaining > 0
        ? `🛡️ У вас осталось ${remaining} поблажек в этом месяце.`
        : `🚨 Поблажки на месяц закончились. Завтра не пропускаем!`;
    }

    // Статистика в виде пользы
    const waterHabit = habits.find(h => h.name.toLowerCase().includes('вод'));
    const readHabit = habits.find(h => h.name.toLowerCase().includes('чита'));
    const socialHabit = habits.find(h => h.name.toLowerCase().includes('соцсет'));

    const benefitCards = [];
    if (waterHabit) {
      const stats = HabitLogic.getMonthlyStats(waterHabit);
      const glasses = stats.totalValue;
      const liters = (glasses * 0.25).toFixed(1);
      benefitCards.push(`<div class="card feature-card"><div class="feature-icon">💧</div><h3 class="feature-title">За месяц выпито ${glasses} стаканов воды</h3><p class="feature-text">Это примерно ${liters} литра — отличная гидратация организма!</p></div>`);
    }
    if (readHabit) {
      const stats = HabitLogic.getMonthlyStats(readHabit);
      const pages = stats.done * 30;
      const books = (pages / 150).toFixed(1);
      benefitCards.push(`<div class="card feature-card"><div class="feature-icon">📚</div><h3 class="feature-title">Прочитано ~${pages} страниц</h3><p class="feature-text">Это эквивалент ${books} книг среднего объёма. Мозг растёт!</p></div>`);
    }
    if (socialHabit) {
      const stats = HabitLogic.getMonthlyStats(socialHabit);
      const saved = stats.done * 25;
      benefitCards.push(`<div class="card feature-card"><div class="feature-icon">📵</div><h3 class="feature-title">Сэкономлено ${saved} минут</h3><p class="feature-text">Время, которое вы не потратили на соцсети в рабочее время.</p></div>`);
    }

    const benefitsHtml = benefitCards.length
      ? `<div class="grid-2 mt-2">${benefitCards.join('')}</div>`
      : `<div class="empty-state"><p>Добавьте привычки, чтобы увидеть пользу от их выполнения.</p></div>`;

    const habitsHtml = scheduledHabits.length
      ? scheduledHabits.map(h => this.renderHabitRow(h, today)).join('')
      : `<div class="empty-state"><div class="empty-state-icon">📝</div><p>Сегодня нет запланированных привычек</p><a href="#habits/new" class="btn btn-primary" data-route="habits/new">Создать первую</a></div>`;

    return `
      ${UI.createHeader('Today', `Сегодня ${Utils.formatDate(today)}`)}

      <div class="grid-2 mb-3">
        <div class="card">
          <div class="card-title">Привет, ${Storage.getSettings().userName}!</div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-muted">Прогресс дня</span>
            <span class="habit-streak">${completedCount} / ${total}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
          <p class="text-muted mt-1">${percent}% выполнено</p>
        </div>
        <div class="card">
          <div class="card-title">🔥 Лучшая серия</div>
          <div class="stat-value">
            ${Math.max(...habits.map(h => HabitLogic.getStreak(h)), 0)}
          </div>
          <p class="text-muted">дней подряд</p>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-title">⚡ Привычки на сегодня</div>
        ${habitsHtml}
        <div class="mt-2">
          <a href="#habits/new" class="btn btn-primary" data-route="habits/new">+ Быстро добавить привычку</a>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-title">📈 Лучше, чем вчера</div>
        <p>${motivation}</p>
        <p class="mt-1">${streakMsg}</p>
        <p class="mt-1">${missesMsg}</p>
      </div>

      <div class="card">
        <div class="card-title">🎯 Статистика в виде пользы</div>
        ${benefitsHtml}
      </div>
    `;
  },

  renderHabitRow(habit, dateStr) {
    const completion = HabitLogic.getCompletion(habit.id, dateStr);
    const target = habit.targetValue || 1;
    const done = completion >= target;
    const category = HabitLogic.getCategory(habit.categoryId);
    const streak = HabitLogic.getStreak(habit);

    return `
      <div class="habit-card">
        <div class="habit-icon" style="${UI.habitIconStyle(habit.color)}">${habit.icon}</div>
        <div class="habit-info">
          <div class="habit-name">${Utils.escapeHtml(habit.name)}</div>
          <div class="habit-meta">
            <span class="tag" style="border-color:${category.color}40;color:${category.color}">${category.icon} ${category.name}</span>
            ${habit.unit ? `<span>${completion}/${target} ${habit.unit}</span>` : ''}
          </div>
          ${dateStr === Utils.today() ? UI.getWeekProgressLine(habit) : ''}
        </div>
        <div class="habit-streak">🔥 ${streak}</div>
        <div class="habit-actions">
          <label class="checkbox-wrapper">
            <input type="checkbox" ${done ? 'checked' : ''}
              onchange="HabitLogic.toggleCompletion('${habit.id}', '${dateStr}'); Router.refresh();">
          </label>
          ${dateStr !== Utils.today() ? '' : `
            <a href="#habits/edit/${habit.id}" class="btn btn-secondary btn-sm" data-route="habits/edit/${habit.id}">✏️</a>
          `}
        </div>
      </div>
    `;
  },

  habits() {
    const habits = Storage.getHabits();
    const filter = Router.params.filter || 'active';
    const filtered = habits.filter(h => filter === 'all' ? true : filter === 'archived' ? h.archived : !h.archived);

    const listHtml = filtered.length
      ? filtered.map(h => {
          const streak = HabitLogic.getStreak(h);
          const category = HabitLogic.getCategory(h.categoryId);
          const weekly = HabitLogic.getWeeklyProgress(h, Utils.today());
          const misses = HabitLogic.getMissesThisMonth(h);
          const remaining = Math.max(0, (h.monthlySkips || 0) - misses);

          return `
            <div class="habit-card">
              <div class="habit-icon" style="${UI.habitIconStyle(h.color)}">${h.icon}</div>
              <div class="habit-info">
                <div class="habit-name">${Utils.escapeHtml(h.name)}</div>
                <div class="habit-meta">
                  <span class="tag" style="border-color:${category.color}40;color:${category.color}">${category.icon} ${category.name}</span>
                  <span>Напоминание: ${h.reminder || 'нет'}</span>
                </div>
                <div class="flex items-center gap-2 mt-1 wrap">
                  <span class="habit-streak">🔥 ${streak} дней</span>
                  <span class="text-muted">|</span>
                  <span class="text-muted">Неделя: ${weekly.done}/${weekly.total}</span>
                  <span class="text-muted">|</span>
                  <span class="text-muted">Пропусков осталось: ${remaining}</span>
                </div>
              </div>
              <div class="habit-actions">
                <a href="#stats/${h.id}" class="btn btn-ghost btn-sm" data-route="stats/${h.id}">📊</a>
                <a href="#habits/edit/${h.id}" class="btn btn-secondary btn-sm" data-route="habits/edit/${h.id}">✏️</a>
                <button class="btn btn-secondary btn-sm" onclick="Pages.archiveHabit('${h.id}', ${!h.archived})">${h.archived ? '↩️' : '📦'}</button>
                <button class="btn btn-danger btn-sm" onclick="Pages.deleteHabit('${h.id}')">🗑️</button>
              </div>
            </div>
          `;
        }).join('')
      : `<div class="empty-state"><div class="empty-state-icon">📭</div><p>Привычек не найдено</p></div>`;

    return `
      ${UI.createHeader('Мои привычки')}
      <div class="filters">
        <button class="filter-btn ${filter === 'active' ? 'active' : ''}" onclick="Router.navigate('habits', {filter:'active'})">Активные</button>
        <button class="filter-btn ${filter === 'archived' ? 'active' : ''}" onclick="Router.navigate('habits', {filter:'archived'})">Архивные</button>
        <button class="filter-btn ${filter === 'all' ? 'active' : ''}" onclick="Router.navigate('habits', {filter:'all'})">Все</button>
        <a href="#habits/new" class="btn btn-primary" data-route="habits/new" style="margin-left:auto">+ Новая привычка</a>
      </div>
      <div class="card">
        ${listHtml}
      </div>
    `;
  },

  habitForm(editId = null) {
    const habit = editId
      ? Storage.getHabits().find(h => h.id === editId)
      : {
          name: '',
          icon: ASSETS.icons[0],
          color: ASSETS.colors[0],
          categoryId: ASSETS.defaultCategories[0].id,
          frequency: { type: 'daily' },
          targetValue: 1,
          unit: 'раз',
          reminder: '',
          monthlySkips: 2,
          archived: false
        };

    if (!habit) return this.notFound();

    const categories = Storage.getCategories();
    const title = editId ? 'Редактирование привычки' : 'Новая привычка';

    const freq = habit.frequency || { type: 'daily' };
    const daysCheckboxes = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
      const labels = { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс' };
      const checked = freq.days?.includes(day) ? 'checked' : '';
      return `<label class="checkbox-wrapper" style="font-size:0.9rem"><input type="checkbox" name="freqDays" value="${day}" ${checked}> ${labels[day]}</label>`;
    }).join('');

    const iconPickerHtml = ASSETS.icons.map(icon => `
      <div class="icon-option ${habit.icon === icon ? 'selected' : ''}" data-icon="${icon}">${icon}</div>
    `).join('');

    const colorPickerHtml = ASSETS.colors.map(color => `
      <div class="color-option ${habit.color === color ? 'selected' : ''}" style="background:${color}" data-color="${color}"></div>
    `).join('');

    return `
      ${UI.createHeader(title)}
      <div class="card">
        <form id="habit-form">
          <input type="hidden" name="id" value="${habit.id || ''}">
          <div class="form-group">
            <label class="form-label">Название привычки</label>
            <input type="text" name="name" class="form-input" value="${Utils.escapeHtml(habit.name)}" placeholder="Например: Читать 30 минут" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Категория</label>
              <select name="categoryId" class="form-select">
                ${categories.map(c => `<option value="${c.id}" ${habit.categoryId === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Напоминание</label>
              <input type="time" name="reminder" class="form-input" value="${habit.reminder || ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Иконка</label>
            <div class="icon-picker">${iconPickerHtml}</div>
            <input type="hidden" name="icon" value="${habit.icon}">
          </div>

          <div class="form-group">
            <label class="form-label">Цвет</label>
            <div class="color-picker">${colorPickerHtml}</div>
            <input type="hidden" name="color" value="${habit.color}">
          </div>

          <div class="form-group">
            <label class="form-label">Периодичность</label>
            <select name="frequencyType" class="form-select" id="freq-type">
              <option value="daily" ${freq.type === 'daily' ? 'selected' : ''}>Ежедневно</option>
              <option value="weekly_days" ${freq.type === 'weekly_days' ? 'selected' : ''}>По дням недели</option>
              <option value="weekly_count" ${freq.type === 'weekly_count' ? 'selected' : ''}>X раз в неделю</option>
            </select>
          </div>

          <div class="form-group" id="freq-days-block" style="display:${freq.type === 'weekly_days' ? 'block' : 'none'}">
            <label class="form-label">Дни недели</label>
            <div class="flex gap-2 wrap">${daysCheckboxes}</div>
          </div>

          <div class="form-group" id="freq-count-block" style="display:${freq.type === 'weekly_count' ? 'block' : 'none'}">
            <label class="form-label">Количество раз в неделю</label>
            <input type="number" name="weeklyCount" class="form-input" min="1" max="7" value="${freq.count || 3}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Целевое значение</label>
              <input type="number" name="targetValue" class="form-input" min="1" value="${habit.targetValue || 1}">
            </div>
            <div class="form-group">
              <label class="form-label">Единица измерения</label>
              <input type="text" name="unit" class="form-input" value="${Utils.escapeHtml(habit.unit || 'раз')}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Сколько раз в месяц можно пропустить (поблажки)</label>
            <input type="number" name="monthlySkips" class="form-input" min="0" value="${habit.monthlySkips ?? 2}">
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary">${editId ? '💾 Сохранить' : '➕ Создать привычку'}</button>
            <a href="#habits" class="btn btn-secondary" data-route="habits">Отмена</a>
          </div>
        </form>
      </div>
    `;
  },

  categories() {
    const categories = Storage.getCategories();
    const listHtml = categories.map(c => `
      <div class="habit-card">
        <div class="habit-icon" style="${UI.habitIconStyle(c.color)}">${c.icon}</div>
        <div class="habit-info">
          <div class="habit-name">${Utils.escapeHtml(c.name)}</div>
        </div>
        <div class="habit-actions">
          <button class="btn btn-secondary btn-sm" onclick="Pages.editCategory('${c.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="Pages.deleteCategory('${c.id}')">🗑️</button>
        </div>
      </div>
    `).join('');

    return `
      ${UI.createHeader('Категории привычек')}
      <div class="mb-2">
        <button class="btn btn-primary" onclick="Pages.createCategory()">+ Новая категория</button>
      </div>
      <div class="card">
        ${listHtml}
      </div>
    `;
  },

  calendar() {
    const today = Utils.today();
    const [year, month] = today.split('-').map(Number);
    const daysInMonth = Utils.daysInMonth(today);
    const firstDay = new Date(year, month - 1, 1).getDay() || 7;
    const habits = Storage.getHabits().filter(h => !h.archived);

    const completions = Storage.getCompletions();
    const totalScheduledPerDay = {};
    const totalDonePerDay = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let scheduled = 0;
      let done = 0;
      habits.forEach(h => {
        if (!HabitLogic.isScheduled(h, date)) return;
        scheduled++;
        const val = completions[h.id]?.[date] || 0;
        if (val >= (h.targetValue || 1)) done++;
      });
      totalScheduledPerDay[date] = scheduled;
      totalDonePerDay[date] = done;
    }

    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    let cells = '';
    for (let i = 1; i < firstDay; i++) {
      cells += `<div class="calendar-day" style="visibility:hidden"></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const scheduled = totalScheduledPerDay[date];
      const done = totalDonePerDay[date];
      const isToday = date === today;
      const opacity = scheduled ? (done / scheduled) : 0;
      const dotColor = opacity >= 1 ? 'var(--accent-green)' : opacity > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)';
      cells += `
        <div class="calendar-day ${isToday ? 'today' : ''}" onclick="Pages.openDayModal('${date}')"
          style="background: rgba(0, 240, 255, ${opacity * 0.25})">
          <span class="calendar-day-number">${d}</span>
          <div class="calendar-day-dots">
            <span class="calendar-dot" style="background:${dotColor}"></span>
          </div>
          ${scheduled ? `<span style="font-size:0.65rem;color:var(--text-muted)">${done}/${scheduled}</span>` : ''}
        </div>
      `;
    }

    return `
      ${UI.createHeader('Календарь / История', `${Utils.getMonthName(today)} ${year}`)}
      <div class="card">
        <div class="calendar-grid">
          ${dayLabels.map(l => `<div class="calendar-day-label">${l}</div>`).join('')}
          ${cells}
        </div>
      </div>
      <div class="card mt-2">
        <div class="card-title">Тепловая карта</div>
        <p class="text-muted">Чем ярче день — тем больше привычек выполнено.</p>
      </div>
    `;
  },

  statistics() {
    const habits = Storage.getHabits().filter(h => !h.archived);
    const completions = Storage.getCompletions();
    const today = Utils.today();

    let totalDoneAllTime = 0;
    let bestHabit = null;
    let bestStreak = 0;
    let bestDay = { date: null, count: 0 };

    const allDates = new Set();
    Object.values(completions).forEach(map => Object.keys(map).forEach(d => allDates.add(d)));

    allDates.forEach(date => {
      let count = 0;
      habits.forEach(h => {
        if (!HabitLogic.isScheduled(h, date)) return;
        const val = completions[h.id]?.[date] || 0;
        if (val >= (h.targetValue || 1)) count++;
      });
      totalDoneAllTime += count;
      if (count > bestDay.count) bestDay = { date, count };
    });

    habits.forEach(h => {
      const s = HabitLogic.getStreak(h);
      if (s > bestStreak) {
        bestStreak = s;
        bestHabit = h;
      }
    });

    // Последние 7 дней
    const last7 = Array.from({ length: 7 }, (_, i) => Utils.addDays(today, -(6 - i)));
    const weeklyData = last7.map(date => {
      let count = 0;
      habits.forEach(h => {
        if (!HabitLogic.isScheduled(h, date)) return;
        const val = completions[h.id]?.[date] || 0;
        if (val >= (h.targetValue || 1)) count++;
      });
      return { date, count };
    });

    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    return `
      ${UI.createHeader('Общая статистика')}
      <div class="grid-4 mb-3">
        <div class="card stat-card">
          <div class="stat-value">${habits.length}</div>
          <div class="stat-label">Активных привычек</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${totalDoneAllTime}</div>
          <div class="stat-label">Выполнено всего</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${bestStreak}</div>
          <div class="stat-label">Лучший стрик</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${bestDay.count}</div>
          <div class="stat-label">Лучший день</div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-title">🏆 Самая успешная привычка</div>
        ${bestHabit ? `
          <div class="habit-card">
            <div class="habit-icon" style="${UI.habitIconStyle(bestHabit.color)}">${bestHabit.icon}</div>
            <div class="habit-info">
              <div class="habit-name">${Utils.escapeHtml(bestHabit.name)}</div>
              <div class="habit-meta">Текущая серия: ${bestStreak} дней</div>
            </div>
          </div>
        ` : '<p class="text-muted">Пока недостаточно данных</p>'}
      </div>

      <div class="card">
        <div class="card-title">📈 Активность за неделю</div>
        <div class="chart-bar">
          ${weeklyData.map(d => `
            <div class="chart-bar-item" style="height: ${(d.count / maxCount * 100).toFixed(1)}%" title="${d.date}: ${d.count}">
              <span class="chart-bar-label">${d.date.split('-')[2]}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-title">📊 По привычкам</div>
        ${habits.map(h => {
          const total = HabitLogic.getTotalCompleted(h);
          const s = HabitLogic.getStreak(h);
          return `
            <a href="#stats/${h.id}" class="habit-card" style="text-decoration:none;color:inherit" data-route="stats/${h.id}">
              <div class="habit-icon" style="${UI.habitIconStyle(h.color)}">${h.icon}</div>
              <div class="habit-info">
                <div class="habit-name">${Utils.escapeHtml(h.name)}</div>
                <div class="habit-meta">Выполнено: ${total} · Стрик: ${s}</div>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    `;
  },

  habitStats(habitId) {
    const habit = Storage.getHabits().find(h => h.id === habitId);
    if (!habit) return this.notFound();

    const streak = HabitLogic.getStreak(habit);
    const bestStreak = HabitLogic.getBestStreak(habit);
    const stats7 = HabitLogic.getPeriodStats(habit, 7);
    const stats15 = HabitLogic.getPeriodStats(habit, 15);
    const stats30 = HabitLogic.getPeriodStats(habit, 30);

    const today = Utils.today();
    const last14 = Array.from({ length: 14 }, (_, i) => Utils.addDays(today, -(13 - i)));
    const completions = Storage.getCompletions()[habit.id] || {};
    const chartData = last14.map(date => {
      const val = completions[date] || 0;
      const done = val >= (habit.targetValue || 1) ? 1 : 0;
      return { date, done };
    });

    return `
      ${UI.createHeader(`Статистика: ${habit.name}`)}
      <div class="grid-3 mb-3">
        <div class="card stat-card">
          <div class="stat-value">${streak}</div>
          <div class="stat-label">Текущая серия</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${bestStreak}</div>
          <div class="stat-label">Лучшая серия</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value">${HabitLogic.getTotalCompleted(habit)}</div>
          <div class="stat-label">Всего выполнено</div>
        </div>
      </div>

      <div class="grid-3 mb-3">
        <div class="card stat-card">
          <div class="stat-value text-cyan">${stats7.percent}%</div>
          <div class="stat-label">7 дней</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value text-magenta">${stats15.percent}%</div>
          <div class="stat-label">15 дней</div>
        </div>
        <div class="card stat-card">
          <div class="stat-value text-yellow">${stats30.percent}%</div>
          <div class="stat-label">30 дней</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📈 Выполнение за 14 дней</div>
        <div class="chart-bar">
          ${chartData.map(d => `
            <div class="chart-bar-item" style="height: ${d.done * 100}%; opacity: ${d.done ? 1 : 0.2}; background: ${d.done ? 'var(--accent-cyan)' : 'var(--text-muted)'}">
              <span class="chart-bar-label">${d.date.split('-')[2]}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="mt-2">
        <a href="#habits" class="btn btn-secondary" data-route="habits">← Назад к привычкам</a>
      </div>
    `;
  },

  profile() {
    const settings = Storage.getSettings();
    return `
      ${UI.createHeader('Личный кабинет')}
      <div class="card mb-3">
        <div class="card-title">⚙️ Настройки</div>
        <form id="settings-form">
          <div class="form-group">
            <label class="form-label">Имя пользователя</label>
            <input type="text" name="userName" class="form-input" value="${Utils.escapeHtml(settings.userName || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Тема оформления</label>
            <select name="theme" class="form-select">
              <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>🌙 Тёмная киберпанк</option>
              <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>☀️ Светлая неон</option>
            </select>
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-primary">Сохранить настройки</button>
          </div>
        </form>
      </div>

      <div class="card mb-3">
        <div class="card-title">🔔 Напоминания</div>
        <p class="text-muted mb-2">Разрешите push-уведомления, чтобы получать напоминания о привычках.</p>
        <button class="btn btn-secondary" id="enable-notifications">Включить уведомления</button>
      </div>

      <div class="card">
        <div class="card-title">💾 Данные</div>
        <p class="text-muted mb-2">Все данные хранятся локально в браузере этого устройства.</p>
        <button class="btn btn-danger" onclick="Pages.resetData()">🗑️ Сбросить все данные</button>
      </div>
    `;
  },

  notFound() {
    return `
      <div class="hero" style="min-height:70vh">
        <div class="hero-title">404</div>
        <p class="hero-subtitle">Страница не найдена. Возможно, она ушла на пробежку.</p>
        <div class="hero-cta">
          <a href="#today" class="btn btn-primary btn-lg" data-route="today">На дашборд</a>
          <a href="#home" class="btn btn-secondary btn-lg" data-route="home">На главную</a>
        </div>
      </div>
    `;
  },

  // ============================================================
  // ДЕЙСТВИЯ
  // ============================================================
  deleteHabit(id) {
    if (!confirm('Удалить привычку? Это действие нельзя отменить.')) return;
    const habits = Storage.getHabits().filter(h => h.id !== id);
    Storage.setHabits(habits);
    const completions = Storage.getCompletions();
    delete completions[id];
    Storage.setCompletions(completions);
    UI.toast('Привычка удалена');
    Router.refresh();
  },

  archiveHabit(id, archive) {
    const habits = Storage.getHabits();
    const habit = habits.find(h => h.id === id);
    if (habit) {
      habit.archived = archive;
      Storage.setHabits(habits);
      UI.toast(archive ? 'Привычка отправлена в архив' : 'Привычка восстановлена');
      Router.refresh();
    }
  },

  saveHabit(formData) {
    const habits = Storage.getHabits();
    const id = formData.get('id') || Utils.uuid();
    const isNew = !formData.get('id');

    const freqType = formData.get('frequencyType');
    const frequency = { type: freqType };
    if (freqType === 'weekly_days') {
      frequency.days = Array.from(formData.getAll('freqDays'));
      if (frequency.days.length === 0) frequency.days = ['mon', 'wed', 'fri'];
    }
    if (freqType === 'weekly_count') {
      frequency.count = parseInt(formData.get('weeklyCount'), 10) || 3;
    }

    const habit = {
      id,
      name: formData.get('name').trim(),
      icon: formData.get('icon') || ASSETS.icons[0],
      color: formData.get('color') || ASSETS.colors[0],
      categoryId: formData.get('categoryId'),
      frequency,
      targetValue: parseInt(formData.get('targetValue'), 10) || 1,
      unit: formData.get('unit').trim() || 'раз',
      reminder: formData.get('reminder'),
      monthlySkips: parseInt(formData.get('monthlySkips'), 10) || 0,
      archived: false
    };

    const existing = habits.findIndex(h => h.id === id);
    if (existing >= 0) {
      habit.archived = habits[existing].archived;
      habit.createdAt = habits[existing].createdAt;
      habits[existing] = habit;
    } else {
      habit.createdAt = Utils.today();
      habits.push(habit);
    }

    Storage.setHabits(habits);
    UI.toast(isNew ? 'Привычка создана' : 'Привычка обновлена');
    Router.navigate('habits');
  },

  deleteCategory(id) {
    const habits = Storage.getHabits();
    if (habits.some(h => h.categoryId === id)) {
      alert('Нельзя удалить категорию, к которой привязаны привычки.');
      return;
    }
    if (!confirm('Удалить категорию?')) return;
    const categories = Storage.getCategories().filter(c => c.id !== id);
    Storage.setCategories(categories);
    UI.toast('Категория удалена');
    Router.refresh();
  },

  createCategory() {
    const name = prompt('Название категории:');
    if (!name) return;
    const icon = prompt('Иконка (emoji):', '📌') || '📌';
    const color = ASSETS.colors[Math.floor(Math.random() * ASSETS.colors.length)];
    const categories = Storage.getCategories();
    categories.push({ id: Utils.uuid(), name, icon, color });
    Storage.setCategories(categories);
    UI.toast('Категория создана');
    Router.refresh();
  },

  editCategory(id) {
    const categories = Storage.getCategories();
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const name = prompt('Название категории:', cat.name);
    if (name === null) return;
    const icon = prompt('Иконка (emoji):', cat.icon) || cat.icon;
    cat.name = name.trim() || cat.name;
    cat.icon = icon;
    Storage.setCategories(categories);
    UI.toast('Категория обновлена');
    Router.refresh();
  },

  openDayModal(dateStr) {
    const habits = Storage.getHabits().filter(h => !h.archived && HabitLogic.isScheduled(h, dateStr));
    const rows = habits.map(h => Pages.renderHabitRow(h, dateStr)).join('');
    UI.openModal(`
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${Utils.formatDate(dateStr)}</div>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          ${rows || '<p class="text-muted">Нет запланированных привычек</p>'}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="UI.closeModal()">Закрыть</button>
        </div>
      </div>
    `);
  },

  saveSettings(formData) {
    const settings = Storage.getSettings();
    settings.userName = formData.get('userName').trim() || 'Нейронавт';
    settings.theme = formData.get('theme');
    Storage.setSettings(settings);
    UI.applyTheme();
    UI.renderNavigation();
    UI.toast('Настройки сохранены');
    Router.refresh();
  },

  resetData() {
    if (!confirm('ВНИМАНИЕ: все данные будут удалены. Продолжить?')) return;
    Object.values(Storage.keys).forEach(key => localStorage.removeItem(key));
    HabitLogic.initData();
    UI.toast('Данные сброшены');
    Router.navigate('home');
  }
};

// ============================================================
// 7. РОУТЕР
// ============================================================
const Router = {
  currentRoute: 'home',
  params: {},

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  parseHash() {
    let hash = window.location.hash.replace('#', '') || 'home';
    const [pathPart, queryPart] = hash.split('?');
    const params = {};

    if (queryPart) {
      queryPart.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    const parts = pathPart.split('/');
    const base = parts[0];
    if (parts.length > 1) params.id = parts[parts.length - 1];

    return { route: pathPart, base, params };
  },

  handleRoute() {
    const { route, base, params } = this.parseHash();
    this.currentRoute = base;
    this.params = params;

    let html = '';

    if (route === 'home' || route === '') {
      html = Pages.home();
    } else if (route === 'today') {
      html = Pages.today();
    } else if (route === 'habits') {
      html = Pages.habits();
    } else if (route === 'habits/new') {
      html = Pages.habitForm();
    } else if (route.startsWith('habits/edit/')) {
      html = Pages.habitForm(params.id);
    } else if (route === 'categories') {
      html = Pages.categories();
    } else if (route === 'calendar') {
      html = Pages.calendar();
    } else if (route === 'statistics') {
      html = Pages.statistics();
    } else if (route.startsWith('stats/')) {
      html = Pages.habitStats(params.id);
    } else if (route === 'profile') {
      html = Pages.profile();
    } else {
      html = Pages.notFound();
    }

    UI.main.innerHTML = html;
    UI.renderNavigation();
    UI.bindMenuToggle();
    this.bindForms();
    this.bindPickers();
    window.scrollTo(0, 0);
  },

  navigate(route, query = {}) {
    const queryStr = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&');
    window.location.hash = queryStr ? `${route}?${queryStr}` : route;
  },

  refresh() {
    this.handleRoute();
  },

  bindForms() {
    const habitForm = document.getElementById('habit-form');
    if (habitForm) {
      habitForm.addEventListener('submit', e => {
        e.preventDefault();
        Pages.saveHabit(new FormData(habitForm));
      });
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', e => {
        e.preventDefault();
        Pages.saveSettings(new FormData(settingsForm));
      });
    }

    const freqType = document.getElementById('freq-type');
    if (freqType) {
      freqType.addEventListener('change', e => {
        document.getElementById('freq-days-block').style.display = e.target.value === 'weekly_days' ? 'block' : 'none';
        document.getElementById('freq-count-block').style.display = e.target.value === 'weekly_count' ? 'block' : 'none';
      });
    }

    const notifyBtn = document.getElementById('enable-notifications');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', async () => {
        if (!('Notification' in window)) {
          UI.toast('Уведомления не поддерживаются этим браузером');
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          UI.toast('Уведомления включены');
          new Notification('HabitFlow', { body: 'Напоминания активированы. Время становиться лучше!' });
        } else {
          UI.toast('Уведомления отклонены');
        }
      });
    }
  },

  bindPickers() {
    document.querySelectorAll('.icon-option').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        const input = document.querySelector('input[name="icon"]');
        if (input) input.value = el.dataset.icon;
      });
    });

    document.querySelectorAll('.color-option').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.color-option').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        const input = document.querySelector('input[name="color"]');
        if (input) input.value = el.dataset.color;
      });
    });
  }
};

// ============================================================
// 8. ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  HabitLogic.initData();
  UI.init();
  Router.init();
});

// Глобальные экспорты для inline-обработчиков
window.Pages = Pages;
window.HabitLogic = HabitLogic;
window.Router = Router;
window.UI = UI;
window.Storage = Storage;
window.Utils = Utils;
