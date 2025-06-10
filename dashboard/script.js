
    (() => {
      // Cache DOM elements
      const DOMElements = {
        navDashboard: document.getElementById('nav-dashboard'),
        navCheckin: document.getElementById('nav-checkin'),
        navProfile: document.getElementById('nav-profile'),
        dashboardSection: document.getElementById('dashboard-section'),
        checkinSection: document.getElementById('checkin-section'),
        profileSection: document.getElementById('profile-section'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        body: document.body,
        toast: document.getElementById('toast'),
        xpDesc: document.getElementById('xp-desc'),
        levelDesc: document.getElementById('level-desc'),
        streakDesc: document.getElementById('streak-desc'),
        moodFace: document.getElementById('mood-face'),
        checkinForm: document.getElementById('checkin-form'),
        xpRange: document.getElementById('xp-range'),
        xpRangeValue: document.getElementById('xp-range-value'),
        levelProgressBar: document.getElementById('level-progress-bar'),
        badgesContainer: document.getElementById('badges-container'),
        profileUsername: document.getElementById('profile-username'),
        profileJoined: document.getElementById('profile-joined'),
        profileEmail: document.getElementById('profile-email'),
        profileBio: document.getElementById('profile-bio')
      };

      // Default user data (can be loaded from an API in a real app)
      let userData = {
        xp: 2837,
        streak: 7,
        mood: '😊',
        unlockedBadges: [], // Initialize as empty, populate in initializeApp
        username: 'GamerPro123',
        joined: 'January 1, 2024',
        email: 'user@example.com',
        bio: 'Passionate about self-improvement and gamified learning!'
      };

      // Badge definitions with unlock conditions
      const allBadges = {
        'early-bird': { name: 'Early Bird', icon: '<circle cx="12" cy="12" r="10"/>', condition: (xp, streak) => true },
        'quiz-master': { name: 'Quiz Master', icon: '<rect x="6" y="6" width="12" height="12" />', condition: (xp, streak) => true },
        'consistency': { name: 'Consistency', icon: '<polygon points="12 2 15 11 24 11 17 17 20 26 12 21 4 26 7 17 0 11 9 11"/>', condition: (xp, streak) => true },
        'xp-beginner': { name: 'XP Novice', icon: '<path d="M12 2L2 12h5v8h10v-8h5L12 2z"/>', condition: (xp, streak) => xp >= 500 },
        'xp-intermediate': { name: 'XP Enthusiast', icon: '<path d="M12 2L2 12h5v8h10v-8h5L12 2zM12 5l-6 6h3v6h6v-6h3l-6-6z"/>', condition: (xp, streak) => xp >= 2000 },
        'streak-pro': { name: 'Streak Pro', icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5L7 12h3V7h4v5h3l-5 4.5z"/>', condition: (xp, streak) => streak >= 15 },
        'super-streak': { name: 'Super Streaker', icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5L7 12h3V7h4v5h3l-5 4.5zM12 5L7 9h2v4h6V9h2L12 5z"/>', condition: (xp, streak) => streak >= 30 },
      };

      /**
       * Calculates the user's level based on XP.
       * @param {number} xp - The user's experience points.
       * @returns {number} The calculated level.
       */
      const calculateLevel = (xp) => Math.min(50, Math.floor(xp / 250)); // Each 250 XP equals one level, max 50

      /**
       * Returns a descriptive string for the given level.
       * @param {number} level - The user's level.
       * @returns {string} The level description.
       */
      const getLevelDescription = (level) => {
        if (level === 0) return 'Beginner (lvl 0)';
        if (level < 5) return `Novice (lvl ${level})`;
        if (level < 15) return `Intermediate (lvl ${level})`;
        if (level < 30) return `Advanced (lvl ${level})`;
        return `Expert (lvl ${level})`;
      };

      /**
       * Updates the level progress bar's width and text.
       * @param {number} xp - The current XP.
       */
      const updateLevelProgressBar = (xp) => {
        const currentLevel = calculateLevel(xp);
        const xpForCurrentLevel = currentLevel * 250;
        const xpIntoCurrentLevel = xp - xpForCurrentLevel;
        const progressPercentage = (xpIntoCurrentLevel / 250) * 100;

        DOMElements.levelProgressBar.style.width = `${progressPercentage}%`;
        if (progressPercentage >= 100) {
          DOMElements.levelProgressBar.textContent = `Level Up! 🎉`;
        } else {
          DOMElements.levelProgressBar.textContent = `${Math.round(progressPercentage)}% to next level`;
        }
        DOMElements.levelProgressBar.setAttribute('aria-valuenow', Math.round(progressPercentage));
      };

      /**
       * Renders the user's unlocked badges in the dashboard.
       * @param {Array<Object>} unlockedBadges - An array of unlocked badge objects.
       */
      const renderBadges = (unlockedBadges) => {
        DOMElements.badgesContainer.innerHTML = '';
        unlockedBadges.forEach(badge => {
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'badge unlocked';
          badgeSpan.title = `${badge.name} Badge`;
          badgeSpan.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${badge.icon}</svg> ${badge.name}`;
          DOMElements.badgesContainer.appendChild(badgeSpan);
        });
      };

      /**
       * Checks for and unlocks new badges based on current XP and streak.
       * Displays a toast message if a new badge is unlocked.
       * @param {number} currentXp - The user's current XP.
       * @param {number} currentStreak - The user's current streak.
       */
      const checkAndUnlockBadges = (currentXp, currentStreak) => {
        let newBadgesUnlocked = false;
        Object.keys(allBadges).forEach(badgeId => {
          const badgeInfo = allBadges[badgeId];
          const isCurrentlyUnlocked = userData.unlockedBadges.some(b => b.id === badgeId);

          if (badgeInfo.condition(currentXp, currentStreak) && !isCurrentlyUnlocked) {
            userData.unlockedBadges.push({ id: badgeId, name: badgeInfo.name, icon: badgeInfo.icon });
            showToast(`New Badge Unlocked: ${badgeInfo.name}! 🌟`);
            newBadgesUnlocked = true;
          }
        });
        if (newBadgesUnlocked) {
          renderBadges(userData.unlockedBadges);
        }
      };

      /**
       * Shows a specific section of the application and updates navigation.
       * @param {string} sectionName - The name of the section to show ('dashboard', 'checkin', 'profile').
       */
      const showSection = (sectionName) => {
        const sections = {
          'dashboard': DOMElements.dashboardSection,
          'checkin': DOMElements.checkinSection,
          'profile': DOMElements.profileSection
        };
        const buttons = {
          'dashboard': DOMElements.navDashboard,
          'checkin': DOMElements.navCheckin,
          'profile': DOMElements.navProfile
        };

        for (const key in sections) {
          if (sections.hasOwnProperty(key)) {
            const section = sections[key];
            const button = buttons[key];

            if (key === sectionName) {
              section.classList.add('active');
              button.classList.add('active');
              button.setAttribute('aria-current', 'page');
              section.focus();
            } else {
              section.classList.remove('active');
              button.classList.remove('active');
              button.removeAttribute('aria-current');
            }
          }
        }
      };

      /**
       * Displays a temporary toast message.
       * @param {string} message - The message to display.
       */
      const showToast = (message) => {
        DOMElements.toast.textContent = message;
        DOMElements.toast.classList.add('show');
        setTimeout(() => {
          DOMElements.toast.classList.remove('show');
          DOMElements.toast.textContent = '';
        }, 3500);
      };

      /**
       * Loads the user's saved theme preference from localStorage.
       */
      const loadTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
          DOMElements.body.classList.add('dark');
          DOMElements.themeToggleBtn.textContent = '☀️';
        } else {
          DOMElements.body.classList.remove('dark');
          DOMElements.themeToggleBtn.textContent = '🌗';
        }
      };

      /**
       * Toggles between light and dark themes and saves the preference to localStorage.
       */
      const toggleTheme = () => {
        if (DOMElements.body.classList.contains('dark')) {
          DOMElements.body.classList.remove('dark');
          DOMElements.themeToggleBtn.textContent = '🌗';
          localStorage.setItem('theme', 'light');
        } else {
          DOMElements.body.classList.add('dark');
          DOMElements.themeToggleBtn.textContent = '☀️';
          localStorage.setItem('theme', 'dark');
        }
      };

      /**
       * Updates the dashboard display with the latest user data.
       * @param {number} xp - The user's XP.
       * @param {number} streak - The user's streak.
       * @param {string} mood - The user's current mood emoji.
       */
      const updateDashboardDisplay = (xp, streak, mood) => {
        DOMElements.xpDesc.textContent = `${xp.toLocaleString()} points earned`;
        const level = calculateLevel(xp);
        DOMElements.levelDesc.textContent = getLevelDescription(level);
        DOMElements.streakDesc.textContent = `${streak} day${streak !== 1 ? 's' : ''} in a row`;
        DOMElements.moodFace.textContent = mood;
        updateLevelProgressBar(xp);
        renderBadges(userData.unlockedBadges);
      };

      /**
       * Initializes the user profile section with data.
       */
      const updateProfileDisplay = () => {
        DOMElements.profileUsername.textContent = userData.username;
        DOMElements.profileJoined.textContent = userData.joined;
        DOMElements.profileEmail.textContent = userData.email;
        DOMElements.profileBio.textContent = userData.bio;
      };

      /**
       * Initializes the application by loading saved data or setting defaults,
       * and then updates the UI.
       */
      const initializeApp = () => {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          userData = JSON.parse(savedUserData);
        } else {
          // Set initial default badges if no data is saved yet
          userData.unlockedBadges = [
            { id: 'early-bird', name: 'Early Bird', icon: '<circle cx="12" cy="12" r="10"/>' },
            { id: 'quiz-master', name: 'Quiz Master', icon: '<rect x="6" y="6" width="12" height="12" />' },
            { id: 'consistency', name: 'Consistency', icon: '<polygon points="12 2 15 11 24 11 17 17 20 26 12 21 4 26 7 17 0 11 9 11"/>' }
          ];
        }

        // Set initial form values based on loaded data
        DOMElements.xpRange.value = userData.xp;
        DOMElements.xpRangeValue.textContent = userData.xp;
        document.getElementById('streak-select').value = userData.streak;
        document.getElementById('mood-select').value = userData.mood;

        loadTheme();
        updateDashboardDisplay(userData.xp, userData.streak, userData.mood);
        updateProfileDisplay(); // Initialize profile display
      };

      // Event Listeners
      DOMElements.navDashboard.addEventListener('click', () => showSection('dashboard'));
      DOMElements.navCheckin.addEventListener('click', () => showSection('checkin'));
      DOMElements.navProfile.addEventListener('click', () => showSection('profile'));
      DOMElements.themeToggleBtn.addEventListener('click', toggleTheme);

      DOMElements.xpRange.addEventListener('input', () => {
        DOMElements.xpRangeValue.textContent = DOMElements.xpRange.value;
      });

      DOMElements.checkinForm.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(DOMElements.checkinForm);
        const newXp = parseInt(formData.get('xp'), 10);
        const newStreak = parseInt(formData.get('streak'), 10);
        const newMood = formData.get('mood');

        const oldXp = userData.xp;
        const oldStreak = userData.streak;

        // Update user data
        userData.xp = newXp;
        userData.streak = newStreak;
        userData.mood = newMood;

        // Save data to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        updateDashboardDisplay(userData.xp, userData.streak, userData.mood);
        checkAndUnlockBadges(userData.xp, userData.streak);
        showToast('Check-in submitted! Keep up the great work! 🚀');

        showSection('dashboard'); // Automatically switch back to dashboard
      });

      // Run initialization
      initializeApp();
    })();
  
