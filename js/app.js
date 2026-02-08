(function () {
  'use strict';

  // --- Config ---
  var STORAGE_KEY = 'sfsc_data';
  var SAVE_DELAY = 500;
  var STAGE1_TOTAL_STEPS = 11;
  var STAGE2_TOTAL_STEPS = 13;

  // --- Fear data (labels + explanations) ---
  var FEAR_DATA = [
    {
      label: '1. Fear of self-indulgence or letting oneself off the hook. There\u2019s a concern that being too self-compassionate means making excuses or not taking responsibility or being lazy.',
      explanation: 'Although many people fear that being self-compassionate means being self-indulgent, it is actually just the opposite. Compassion inclines us toward long-term health and well-being, not short-term pleasure (just as a compassionate mother might not let her child eat all the ice cream the child wants). Research shows self-compassionate people engage in healthier behaviors like exercise, eating in balanced ways, drinking less, and going to the doctor more regularly.'
    },
    {
      label: '2. Fear that self-compassion is a form of self-pity.',
      explanation: 'Many people fear that self-compassion is really just a form of self-pity. In fact, self-compassion is an antidote to self-pity. While self-pity says, \u201cpoor me,\u201d self-compassion recognizes that life is challenging at different points for everyone. Research shows that self-compassionate people are more likely to engage in perspective-taking, rather than solely focusing on their own distress. They are also less likely to ruminate on how bad things are, which is one of the reasons self-compassionate people have stronger mental health. When we are self-compassionate, we remember that everyone suffers from time to time (common humanity), and we don\u2019t judge or over-fixate on our struggles (mindfulness). Self-compassion is not a \u201cwoe is me\u201d attitude.'
    },
    {
      label: '3. Fear of becoming complacent or lacking motivation if self-criticism is eliminated. Many believe harsh self-criticism is required to perform at a high level and to succeed. Self-criticism can become such an ingrained habit that it feels right or like the only way. Some people worry that self-compassion will make them complacent and less driven to improve.',
      explanation: 'The most common misgiving people have is that self-compassion might undermine their motivation to achieve. Most people believe self-criticism is an effective motivator, but it\u2019s not. Self-criticism tends to undermine self-confidence and leads to fear of failure. If we are self-compassionate, we will still be motivated to reach our goals\u2014not because we\u2019re inadequate as we are, but because we care about ourselves and want to reach our full potential. Research shows that self-compassionate people have high personal standards; they just don\u2019t beat themselves up when they fail. This means they are less afraid of failure and are more likely to try again and to persist in their efforts even if they feel like they have failed.'
    },
    {
      label: '4. Fear of appearing narcissistic or self-absorbed. In some cultures, there is the belief that caring for oneself is selfish and self-focused.',
      explanation: 'Some worry that by being self-compassionate rather than just focusing on being compassionate to others, they will become self-centered or selfish. However, giving compassion to ourselves actually enables us to give more to others in relationships. Research shows self-compassionate people tend to be more caring and supportive in romantic relationships, are more likely to compromise in relationship conflicts, and are more compassionate and forgiving toward others.'
    },
    {
      label: '5. Discomfort with feelings of warmth/kindness toward self and the belief that one doesn\u2019t deserve self-compassion. For some, self-compassionate feelings seem unfamiliar or even threatening, and some people may feel undeserving of kindness from themselves or others.',
      explanation: 'The belief that one doesn\u2019t deserve self-compassion is a common but mistaken idea. Many people are taught to think they need to be perfect or meet certain standards to be worthy of kindness. This makes it hard for them to be gentle with themselves and can make self-compassion feel strange or even scary. However, research shows that self-compassion is crucial for mental health and emotional well-being. It helps people recognize their inherent value as human beings, without needing to earn it. Being kind to yourself reduces stress, builds resilience, and leads to a healthier outlook on life. Everyone deserves kindness and understanding from themselves, just as they would from others, simply because they are human.'
    },
    {
      label: '6. Associations of self-compassion with weakness and vulnerability. There are cultural narratives that equate self-compassion with being weak or inferior. It may be related to fear of losing one\u2019s \u201cedge\u201d or psychological toughness.',
      explanation: 'In fact, self-compassion is a reliable source of inner strength that confers courage and enhances resilience when we are faced with difficulties. Research shows self-compassionate people are better able to cope with tough situations like divorce, trauma, or chronic pain.'
    }
  ];

  // --- State ---
  var currentTab = 'stage1';
  var saveTimer = null;
  var INFO_TABS = ['therapists', 'resources'];

  // --- Helpers ---
  function getData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getCurrentStep() {
    var data = getData();
    var stage = data[currentTab] || {};
    return stage.currentStep || 1;
  }

  function setCurrentStep(step) {
    var data = getData();
    if (!data[currentTab]) data[currentTab] = {};
    data[currentTab].currentStep = step;
    saveData(data);
  }

  function getTotalSteps() {
    return currentTab === 'stage1' ? STAGE1_TOTAL_STEPS : STAGE2_TOTAL_STEPS;
  }

  // --- Populate selected fears on Challenge page ---
  function populateSelectedFears() {
    var container = document.getElementById('selectedFearsDisplay');
    if (!container) return;
    var data = getData();
    var selected = (data.stage2 && data.stage2.selectedFears) || [];
    if (selected.length === 0) {
      container.innerHTML = '';
      return;
    }
    var html = '';
    selected.forEach(function (idx) {
      var fear = FEAR_DATA[idx];
      if (!fear) return;
      html += '<div class="text-block selected-fear-block">';
      html += '<p><strong>' + fear.label + '</strong></p>';
      html += '<div class="fear-explanation" style="display:block;">';
      html += '<p>' + fear.explanation + '</p>';
      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  // --- Render Step ---
  function showStep(step) {
    var stageEl = document.getElementById(currentTab);
    var steps = stageEl.querySelectorAll('.step');
    steps.forEach(function (el) {
      el.classList.remove('step--active');
    });

    var target = stageEl.querySelector('.step[data-step="' + step + '"]');
    if (target) {
      target.classList.add('step--active');
    }

    // Populate selected fears on Stage 2 Step 3
    if (currentTab === 'stage2' && step === 3) {
      populateSelectedFears();
    }

    // Update progress bar
    var total = getTotalSteps();
    var pct = Math.round((step / total) * 100);
    document.getElementById('progressFill').style.width = pct + '%';

    // Update nav buttons
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    prevBtn.style.visibility = step <= 1 ? 'hidden' : 'visible';

    if (step >= total) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = '';
      nextBtn.textContent = 'Next';
    }

    // Save current step
    setCurrentStep(step);

    // Scroll to top of stage
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function isInfoTab(tab) {
    return INFO_TABS.indexOf(tab) !== -1;
  }

  // --- Tab Switching ---
  function switchTab(tab) {
    currentTab = tab;

    // Update tab UI
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('tab--active', t.getAttribute('data-tab') === tab);
    });

    // Show/hide stages
    document.querySelectorAll('.stage').forEach(function (s) {
      s.style.display = s.id === tab ? '' : 'none';
    });

    var stepNav = document.querySelector('.step-nav');
    var progressBar = document.querySelector('.progress-bar');

    if (isInfoTab(tab)) {
      // Hide step nav and progress bar for info tabs
      stepNav.style.display = 'none';
      progressBar.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      stepNav.style.display = '';
      progressBar.style.display = '';
      // Show the saved step
      var step = getCurrentStep();
      showStep(step);
    }
  }

  // --- Fear Checkbox Logic ---
  function initFears() {
    var checkboxes = document.querySelectorAll('.fear-input');
    var data = getData();
    var selected = (data.stage2 && data.stage2.selectedFears) || [];

    // Restore saved fears
    checkboxes.forEach(function (cb) {
      var idx = parseInt(cb.getAttribute('data-fear'));
      if (selected.indexOf(idx) !== -1) {
        cb.checked = true;
        cb.closest('.fear-item').classList.add('fear-item--selected');
        cb.closest('.fear-item').querySelector('.fear-explanation').style.display = '';
      }
    });

    checkboxes.forEach(function (cb) {
      cb.addEventListener('change', function () {
        var allChecked = document.querySelectorAll('.fear-input:checked');
        var fearItem = cb.closest('.fear-item');
        var explanation = fearItem.querySelector('.fear-explanation');

        if (cb.checked) {
          if (allChecked.length > 3) {
            cb.checked = false;
            return;
          }
          fearItem.classList.add('fear-item--selected');
          explanation.style.display = '';
        } else {
          fearItem.classList.remove('fear-item--selected');
          explanation.style.display = 'none';
        }

        // Save selected fears
        var selectedFears = [];
        document.querySelectorAll('.fear-input:checked').forEach(function (c) {
          selectedFears.push(parseInt(c.getAttribute('data-fear')));
        });
        var d = getData();
        if (!d.stage2) d.stage2 = {};
        d.stage2.selectedFears = selectedFears;
        saveData(d);

        // Update validation message
        var valMsg = document.getElementById('fearValidation');
        if (selectedFears.length === 3) {
          valMsg.style.display = 'none';
        }
      });
    });
  }

  // --- Fear Validation ---
  function validateFears() {
    var checked = document.querySelectorAll('.fear-input:checked');
    if (checked.length !== 3) {
      document.getElementById('fearValidation').style.display = '';
      return false;
    }
    document.getElementById('fearValidation').style.display = 'none';
    return true;
  }

  // --- Auto-save ---
  function scheduleSave(field, value) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var data = getData();
      var parts = field.split('.');
      if (!data[parts[0]]) data[parts[0]] = {};
      data[parts[0]][parts[1]] = value;
      saveData(data);
    }, SAVE_DELAY);
  }

  function initAutoSave() {
    // Textareas & text inputs
    document.querySelectorAll('[data-field]').forEach(function (el) {
      el.addEventListener('input', function () {
        scheduleSave(el.getAttribute('data-field'), el.value);

        // Update slider display if it's a range
        if (el.type === 'range') {
          var valEl = document.getElementById(el.id + 'Val');
          if (valEl) valEl.textContent = el.value;
        }
      });
    });
  }

  // --- Populate Form ---
  function populateForm() {
    var data = getData();
    document.querySelectorAll('[data-field]').forEach(function (el) {
      var parts = el.getAttribute('data-field').split('.');
      var stage = data[parts[0]];
      if (stage && stage[parts[1]] !== undefined) {
        el.value = stage[parts[1]];

        // Update slider display
        if (el.type === 'range') {
          var valEl = document.getElementById(el.id + 'Val');
          if (valEl) valEl.textContent = el.value;
        }
      }
    });
  }

  // --- Navigation ---
  function initNav() {
    var nextBtn = document.getElementById('nextBtn');
    var prevBtn = document.getElementById('prevBtn');

    nextBtn.addEventListener('click', function () {
      var step = getCurrentStep();

      // Validate fears on Stage 2 Step 2
      if (currentTab === 'stage2' && step === 2) {
        if (!validateFears()) return;
      }

      var total = getTotalSteps();
      if (step < total) {
        showStep(step + 1);

        // Mark stage as completed when reaching the end
        if (step + 1 === total) {
          var data = getData();
          if (!data[currentTab]) data[currentTab] = {};
          data[currentTab].completed = true;
          saveData(data);
        }
      }
    });

    prevBtn.addEventListener('click', function () {
      var step = getCurrentStep();
      if (step > 1) {
        showStep(step - 1);
      }
    });
  }

  // --- Reset Buttons ---
  function resetStage(stageName) {
    var data = getData();
    // Keep only currentStep reset to 1, clear all other fields
    data[stageName] = { currentStep: 1 };
    saveData(data);

    // Clear form fields for this stage
    document.querySelectorAll('[data-field^="' + stageName + '."]').forEach(function (el) {
      if (el.type === 'range') {
        el.value = 50;
        var valEl = document.getElementById(el.id + 'Val');
        if (valEl) valEl.textContent = '50';
      } else {
        el.value = '';
      }
    });

    // Clear fear checkboxes if resetting stage2
    if (stageName === 'stage2') {
      document.querySelectorAll('.fear-input').forEach(function (cb) {
        cb.checked = false;
        var item = cb.closest('.fear-item');
        item.classList.remove('fear-item--selected');
        item.querySelector('.fear-explanation').style.display = 'none';
      });
    }

    switchTab(stageName);
  }

  function initResetButtons() {
    var s1Reset = document.getElementById('s1_reset');
    if (s1Reset) {
      s1Reset.addEventListener('click', function () {
        if (confirm('Are you sure you want to reset Stage 1? All your responses for this stage will be cleared.')) {
          resetStage('stage1');
        }
      });
    }
    var s2Reset = document.getElementById('s2_reset');
    if (s2Reset) {
      s2Reset.addEventListener('click', function () {
        if (confirm('Are you sure you want to reset Stage 2? All your responses for this stage will be cleared.')) {
          resetStage('stage2');
        }
      });
    }
  }

  // --- "Continue to Stage 2" button ---
  function initStageSwitch() {
    var s1GoBtn = document.getElementById('s1_goToStage2');
    if (s1GoBtn) {
      s1GoBtn.addEventListener('click', function () {
        switchTab('stage2');
      });
    }
  }

  // --- Second PDF download button (at end of Stage 2) ---
  function initSecondPdfBtn() {
    var btn = document.getElementById('downloadPdfBtn2');
    if (btn) {
      btn.addEventListener('click', function () {
        if (typeof window.generatePdf === 'function') {
          window.generatePdf();
        }
      });
    }
  }

  // --- Init ---
  function init() {
    // Check session exists
    var data = getData();
    if (!data.sessionId) {
      window.location.href = 'index.html';
      return;
    }

    // Tab click handlers
    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        switchTab(t.getAttribute('data-tab'));
      });
    });

    populateForm();
    initAutoSave();
    initFears();
    initNav();
    initStageSwitch();
    initSecondPdfBtn();
    initResetButtons();

    // Show initial tab and step
    switchTab(currentTab);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
