/**
 * ==========================================================================
 * AGENTBLAZER — Student Technology Community Portal
 * Amrita Vishwa Vidyapeetham, Amaravati
 * Vanilla JavaScript (Clean, Modern, Modular, Zero-Dependencies)
 * ==========================================================================
 */

// ==========================================================================
// 1. CONFIGURATION
// ==========================================================================
const CONFIG = {
  clubName: "Agentblazer",
  campusName: "Amrita Vishwa Vidyapeetham – Amaravati",
  registrationPrefix: "AB-AMR",
  
  // Official Amrita student email domain
  collegeEmailDomain: "am.students.amrita.edu",
  
  // Optional secondary Google Apps Script endpoint (Supabase PostgreSQL is primary)
  formSubmissionEndpoint: ""
};

// Branch & Dynamic Section Mapping
const BRANCHES = {
  "CSE": ["A", "B", "C"],
  "AI": ["A", "B", "C"],
  "AIDS": ["N/A"],
  "CCE": ["N/A"],
  "ECE": ["N/A"],
  "Quantum Computing": ["N/A"]
};

// Domain Interests List (Max 3 selections)
const DOMAINS_LIST = [
  "AI & AGENTIC AI",
  "AGENTFORCE",
  "CLOUD",
  "SOFTWARE DEVELOPMENT",
  "DATA & ANALYTICS",
  "WEB DEVELOPMENT",
  "APP DEVELOPMENT",
  "UI / UX",
  "CYBERSECURITY",
  "BUSINESS & PRODUCT",
  "RESEARCH",
  "COMMUNITY & EVENTS"
];

// ==========================================================================
// 2. STATE MANAGEMENT
// ==========================================================================
const state = {
  currentStep: 1,
  totalSteps: 3,
  formData: {
    timestamp: "",
    registrationId: "",
    fullName: "",
    collegeEmail: "",
    personalEmail: "",
    contactNumber: "",
    whatsappNumber: "",
    year: "",
    branch: "",
    section: "",
    interests: [],
    motivation: "",
    aiAgentIdea: ""
  },
  sameAsContact: true,
  isSubmitting: false
};

// ==========================================================================
// 3. INITIALIZATION ON DOM READY
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  initParticlesCanvas();
  initMobileMenu();
  initFormInteractivity();
  initBranchAndSections();
  initInterestsChips();
  initCharacterCounters();
  initAdminExportFeature();
  initAdminRosterModal();
  checkDevBanner();
});

// Show development banner if database is not active
function checkDevBanner() {
  const devBanner = document.getElementById("dev-banner");
  if (!devBanner) return;

  const isSupabaseActive = window.AgentblazerDB && window.AgentblazerDB.isSupabaseConfigured();
  if (isSupabaseActive) {
    // Database is live and fully connected — hide development warning banner
    devBanner.style.display = "none";
    return;
  }

  const isDefaultDomain = CONFIG.collegeEmailDomain === "REPLACE_WITH_OFFICIAL_AMRITA_DOMAIN";
  const isDefaultEndpoint = !CONFIG.formSubmissionEndpoint || CONFIG.formSubmissionEndpoint === "REPLACE_WITH_GOOGLE_APPS_SCRIPT_URL";
  
  if (isDefaultDomain && isDefaultEndpoint) {
    devBanner.style.display = "block";
    devBanner.textContent = "Local Safeguard Mode Active — Registrations saved to local browser storage.";
  } else {
    devBanner.style.display = "none";
  }
}

// ==========================================================================
// 4. MOBILE NAVIGATION
// ==========================================================================
function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("mobile-open");
    const isOpen = navLinks.classList.contains("mobile-open");
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close menu on link click
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
    });
  });
}

// ==========================================================================
// 5. BACKGROUND NEURAL PARTICLES CANVAS
// ==========================================================================
function initParticlesCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  // Respect user preference for reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.min(45, Math.floor((width * height) / 25000));
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(1, 118, 211, ${0.15 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(1, 118, 211, 0.25)";
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

// ==========================================================================
// 6. FORM INTERACTIVITY & STEP NAVIGATION
// ==========================================================================
function initFormInteractivity() {
  const btnNext = document.getElementById("btn-next-step");
  const btnBack = document.getElementById("btn-back-step");
  const regForm = document.getElementById("agentblazer-form");
  const sameAsContactCheckbox = document.getElementById("same-as-contact");
  const whatsappGroup = document.getElementById("whatsapp-group");
  const contactInput = document.getElementById("contact-number");
  const whatsappInput = document.getElementById("whatsapp-number");

  // WhatsApp checkbox toggle
  if (sameAsContactCheckbox && whatsappGroup && contactInput && whatsappInput) {
    sameAsContactCheckbox.addEventListener("change", (e) => {
      state.sameAsContact = e.target.checked;
      if (state.sameAsContact) {
        whatsappGroup.style.display = "none";
        whatsappInput.value = contactInput.value;
        clearFieldError("whatsapp-number");
      } else {
        whatsappGroup.style.display = "block";
      }
    });

    contactInput.addEventListener("input", () => {
      if (state.sameAsContact) {
        whatsappInput.value = contactInput.value;
      }
    });
  }

  // Next Step button
  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (validateCurrentStep()) {
        goToStep(state.currentStep + 1);
      }
    });
  }

  // Back Step button
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      if (state.currentStep > 1) {
        goToStep(state.currentStep - 1);
      }
    });
  }

  // Form Submit
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (validateCurrentStep()) {
        submitRegistration();
      }
    });
  }

  // Year Selection Cards (First, Second, Third Year only)
  const yearCards = document.querySelectorAll(".year-card");
  yearCards.forEach(card => {
    card.addEventListener("click", () => {
      yearCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.formData.year = card.dataset.year;
      clearFieldError("year-selection");
    });
  });

  // Return to Agentblazer button on success screen
  const btnReset = document.getElementById("btn-reset-form");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      resetForm();
    });
  }

  // Copy Registration ID Button
  const btnCopyId = document.getElementById("btn-copy-id");
  if (btnCopyId) {
    btnCopyId.addEventListener("click", () => {
      const idCode = document.getElementById("display-reg-id").textContent;
      navigator.clipboard.writeText(idCode).then(() => {
        btnCopyId.textContent = "Copied!";
        setTimeout(() => {
          btnCopyId.textContent = "Copy ID";
        }, 2000);
      });
    });
  }
}

// Navigation between steps
function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > state.totalSteps) return;

  state.currentStep = stepNumber;

  // Update step panes visibility
  document.querySelectorAll(".step-pane").forEach(pane => {
    pane.classList.remove("active");
  });
  const currentPane = document.getElementById(`step-pane-${stepNumber}`);
  if (currentPane) currentPane.classList.add("active");

  // Update Progress Track & Labels
  const progressBar = document.getElementById("progress-bar-fill");
  const stepNumberTag = document.getElementById("current-step-number");
  const stepTitleTag = document.getElementById("current-step-title");

  const percentage = (stepNumber / state.totalSteps) * 100;
  if (progressBar) progressBar.style.width = `${percentage}%`;

  const titles = ["IDENTITY", "ACADEMICS", "YOUR MISSION"];
  if (stepNumberTag) stepNumberTag.textContent = `STEP 0${stepNumber} / 03`;
  if (stepTitleTag) stepTitleTag.textContent = titles[stepNumber - 1];

  // Update buttons
  const btnBack = document.getElementById("btn-back-step");
  const btnNext = document.getElementById("btn-next-step");
  const btnSubmit = document.getElementById("btn-submit-form");

  if (btnBack) {
    btnBack.disabled = stepNumber === 1;
  }

  if (stepNumber === state.totalSteps) {
    if (btnNext) btnNext.style.display = "none";
    if (btnSubmit) btnSubmit.style.display = "inline-flex";
  } else {
    if (btnNext) btnNext.style.display = "inline-flex";
    if (btnSubmit) btnSubmit.style.display = "none";
  }

  // Smooth scroll to top of wizard on step change
  const wizardCard = document.querySelector(".reg-wizard-card");
  if (wizardCard) {
    wizardCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ==========================================================================
// 7. BRANCH & DYNAMIC SECTIONS
// ==========================================================================
function initBranchAndSections() {
  const branchCards = document.querySelectorAll(".branch-card");
  const sectionOptionsContainer = document.getElementById("section-options-container");

  branchCards.forEach(card => {
    card.addEventListener("click", () => {
      branchCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      
      const selectedBranch = card.dataset.branch;
      state.formData.branch = selectedBranch;
      clearFieldError("branch-selection");

      // Dynamically populate sections
      renderSectionOptions(selectedBranch, sectionOptionsContainer);
    });
  });
}

function renderSectionOptions(branchKey, container) {
  if (!container) return;
  container.innerHTML = "";
  state.formData.section = "";
  clearFieldError("section-selection");

  const sections = BRANCHES[branchKey] || ["N/A"];

  sections.forEach((sec, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "section-pill-btn";
    btn.textContent = `Section ${sec}`;
    if (sec === "N/A") {
      btn.textContent = "N/A (Standard)";
    }

    // Auto-select if only one option (e.g. N/A for AIDS, CCE, ECE, Quantum Computing)
    if (sections.length === 1) {
      btn.classList.add("selected");
      state.formData.section = sec;
    }

    btn.addEventListener("click", () => {
      container.querySelectorAll(".section-pill-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.formData.section = sec;
      clearFieldError("section-selection");
    });

    container.appendChild(btn);
  });
}

// ==========================================================================
// 8. STEP 3: INTERESTS SELECTION (MAX 3)
// ==========================================================================
function initInterestsChips() {
  const container = document.getElementById("interests-container");
  const counterTag = document.getElementById("interests-counter");
  if (!container) return;

  container.innerHTML = "";

  DOMAINS_LIST.forEach(domain => {
    const chip = document.createElement("div");
    chip.className = "interest-chip";
    chip.dataset.domain = domain;

    chip.innerHTML = `
      <div class="interest-chip-dot"></div>
      <span class="interest-chip-label">${domain}</span>
    `;

    chip.addEventListener("click", () => {
      const isSelected = chip.classList.contains("selected");

      if (isSelected) {
        chip.classList.remove("selected");
        state.formData.interests = state.formData.interests.filter(item => item !== domain);
      } else {
        if (state.formData.interests.length >= 3) {
          showFieldError("interests-selection", "Maximum 3 interests can be selected.");
          return;
        }
        chip.classList.add("selected");
        state.formData.interests.push(domain);
        clearFieldError("interests-selection");
      }

      updateInterestsCounter(counterTag, container);
    });

    container.appendChild(chip);
  });
}

function updateInterestsCounter(counterTag, container) {
  const count = state.formData.interests.length;
  if (counterTag) {
    counterTag.textContent = `${count} / 3 SELECTED`;
  }

  // Update disabled state for unselected chips when count reaches 3
  const chips = container.querySelectorAll(".interest-chip");
  chips.forEach(chip => {
    if (count >= 3 && !chip.classList.contains("selected")) {
      chip.classList.add("disabled");
    } else {
      chip.classList.remove("disabled");
    }
  });
}

// ==========================================================================
// 9. LIVE CHARACTER COUNTERS
// ==========================================================================
function initCharacterCounters() {
  const motivationInput = document.getElementById("motivation-text");
  const motivationCounter = document.getElementById("motivation-char-counter");
  const aiIdeaInput = document.getElementById("ai-agent-idea");
  const aiIdeaCounter = document.getElementById("ai-char-counter");

  if (motivationInput && motivationCounter) {
    motivationInput.addEventListener("input", (e) => {
      const len = e.target.value.length;
      motivationCounter.textContent = `${len} / 400`;
      if (len > 400) {
        e.target.value = e.target.value.substring(0, 400);
        motivationCounter.textContent = "400 / 400";
      }
      clearFieldError("motivation-text");
    });
  }

  if (aiIdeaInput && aiIdeaCounter) {
    aiIdeaInput.addEventListener("input", (e) => {
      const len = e.target.value.length;
      aiIdeaCounter.textContent = `${len} / 400`;
      if (len > 400) {
        e.target.value = e.target.value.substring(0, 400);
        aiIdeaCounter.textContent = "400 / 400";
      }
    });
  }
}

// ==========================================================================
// 10. CLIENT-SIDE VALIDATION
// ==========================================================================
function validateCurrentStep() {
  let isValid = true;

  if (state.currentStep === 1) {
    // 1. Full Name
    const fullNameInput = document.getElementById("full-name");
    const nameVal = fullNameInput.value.trim();
    if (!nameVal || nameVal.length < 2) {
      showFieldError("full-name", "Please enter your full name.");
      isValid = false;
    } else {
      clearFieldError("full-name");
      state.formData.fullName = nameVal;
    }

    // 2. College Email
    const collegeEmailInput = document.getElementById("college-email");
    const collegeEmailVal = collegeEmailInput.value.trim().toLowerCase();
    
    // Check email domain configuration
    const isDomainPlaceholder = CONFIG.collegeEmailDomain === "REPLACE_WITH_OFFICIAL_AMRITA_DOMAIN";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isAmritaDomain = 
      collegeEmailVal.endsWith(`@${CONFIG.collegeEmailDomain}`) ||
      collegeEmailVal.endsWith(".amrita.edu") ||
      collegeEmailVal.endsWith("@amrita.edu");

    if (!collegeEmailVal || !emailRegex.test(collegeEmailVal)) {
      showFieldError("college-email", "Please enter a valid official Amrita email ID.");
      isValid = false;
    } else if (!isDomainPlaceholder && !isAmritaDomain) {
      showFieldError("college-email", `Please enter your official Amrita college email ID (ending with @${CONFIG.collegeEmailDomain} or @*.amrita.edu).`);
      isValid = false;
    } else {
      clearFieldError("college-email");
      state.formData.collegeEmail = collegeEmailVal;
    }

    // 3. Personal Email
    const personalEmailInput = document.getElementById("personal-email");
    const personalEmailVal = personalEmailInput.value.trim().toLowerCase();
    if (!personalEmailVal || !emailRegex.test(personalEmailVal)) {
      showFieldError("personal-email", "Please enter a valid personal email address.");
      isValid = false;
    } else {
      clearFieldError("personal-email");
      state.formData.personalEmail = personalEmailVal;
    }

    // 4. Contact Number (10 digits Indian format)
    const contactInput = document.getElementById("contact-number");
    const contactVal = contactInput.value.trim();
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(contactVal)) {
      showFieldError("contact-number", "Please enter a valid 10-digit Indian mobile number.");
      isValid = false;
    } else {
      clearFieldError("contact-number");
      state.formData.contactNumber = contactVal;
    }

    // 5. WhatsApp Number
    const sameCheckbox = document.getElementById("same-as-contact");
    const whatsappInput = document.getElementById("whatsapp-number");
    let whatsappVal = contactVal;
    
    if (sameCheckbox && !sameCheckbox.checked) {
      whatsappVal = whatsappInput.value.trim();
      if (!indianPhoneRegex.test(whatsappVal)) {
        showFieldError("whatsapp-number", "Please enter a valid 10-digit WhatsApp number.");
        isValid = false;
      } else {
        clearFieldError("whatsapp-number");
      }
    }
    state.formData.whatsappNumber = whatsappVal;

  } else if (state.currentStep === 2) {
    // 1. Year of study
    if (!state.formData.year) {
      showFieldError("year-selection", "Please select your year of study.");
      isValid = false;
    } else {
      clearFieldError("year-selection");
    }

    // 2. Branch
    if (!state.formData.branch) {
      showFieldError("branch-selection", "Please select your branch.");
      isValid = false;
    } else {
      clearFieldError("branch-selection");
    }

    // 3. Section
    if (!state.formData.section) {
      showFieldError("section-selection", "Please select your section.");
      isValid = false;
    } else {
      clearFieldError("section-selection");
    }

  } else if (state.currentStep === 3) {
    // 1. Interests (1 to 3 required)
    if (!state.formData.interests || state.formData.interests.length === 0) {
      showFieldError("interests-selection", "Please select at least 1 interest (up to 3 max).");
      isValid = false;
    } else if (state.formData.interests.length > 3) {
      showFieldError("interests-selection", "Please select up to 3 interests only.");
      isValid = false;
    } else {
      clearFieldError("interests-selection");
    }

    // 2. Motivation
    const motivationInput = document.getElementById("motivation-text");
    const motVal = motivationInput.value.trim();
    if (!motVal || motVal.length < 10) {
      showFieldError("motivation-text", "Please share why you want to join Agentblazer (minimum 10 characters).");
      isValid = false;
    } else {
      clearFieldError("motivation-text");
      state.formData.motivation = motVal;
    }

    // 3. Optional AI Idea
    const aiIdeaInput = document.getElementById("ai-agent-idea");
    if (aiIdeaInput) {
      state.formData.aiAgentIdea = aiIdeaInput.value.trim();
    }

    // 4. Declaration Checkbox
    const declarationCheckbox = document.getElementById("declaration-checkbox");
    if (!declarationCheckbox.checked) {
      showFieldError("declaration-checkbox", "You must confirm this declaration to proceed.");
      isValid = false;
    } else {
      clearFieldError("declaration-checkbox");
    }
  }

  return isValid;
}

function showFieldError(fieldId, errorMessage) {
  const group = document.querySelector(`[data-field-group="${fieldId}"]`);
  if (group) {
    group.classList.add("has-error");
    const errText = group.querySelector(".field-error");
    if (errText) errText.textContent = errorMessage;
  }
}

function clearFieldError(fieldId) {
  const group = document.querySelector(`[data-field-group="${fieldId}"]`);
  if (group) {
    group.classList.remove("has-error");
  }
}

// ==========================================================================
// 11. SUBMISSION & GOOGLE APPS SCRIPT / BACKEND HANDLING
// ==========================================================================
async function submitRegistration() {
  if (state.isSubmitting) return;
  state.isSubmitting = true;

  const btnSubmit = document.getElementById("btn-submit-form");
  const submissionError = document.getElementById("submission-error");
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span>Activating...</span>`;
  }
  if (submissionError) {
    submissionError.classList.remove("active");
  }

  // 1. Generate Registration ID
  // Random 4-digit code e.g. AB-AMR-4821 or sequence
  const randomFourDigit = Math.floor(1000 + Math.random() * 9000);
  const regId = `${CONFIG.registrationPrefix}-${randomFourDigit}`;
  
  state.formData.timestamp = new Date().toISOString();
  state.formData.registrationId = regId;

  // Prepare payload
  const payload = {
    timestamp: state.formData.timestamp,
    registrationId: state.formData.registrationId,
    fullName: state.formData.fullName,
    collegeEmail: state.formData.collegeEmail,
    personalEmail: state.formData.personalEmail,
    contactNumber: state.formData.contactNumber,
    whatsappNumber: state.formData.whatsappNumber,
    year: state.formData.year,
    branch: state.formData.branch,
    section: state.formData.section,
    interests: state.formData.interests,
    motivation: state.formData.motivation,
    aiAgentIdea: state.formData.aiAgentIdea || "None"
  };

  // Always save locally in localStorage as a bulletproof safeguard
  saveRegistrationLocally(payload);

  // 2. Insert into Real Database (Supabase PostgreSQL)
  let supabaseSaved = false;
  if (window.AgentblazerDB && window.AgentblazerDB.isSupabaseConfigured()) {
    try {
      const dbRes = await window.AgentblazerDB.dbInsertRegistration(payload);
      if (dbRes && dbRes.success) {
        supabaseSaved = true;
        console.info("⚡ Successfully recorded registration in Supabase PostgreSQL:", dbRes);
      } else if (dbRes && dbRes.error) {
        console.warn("Supabase returned error:", dbRes.error);
      }
    } catch (dbErr) {
      console.warn("Supabase insert failed, fallback continuing:", dbErr);
    }
  }

  const isEndpointConfigured = 
    CONFIG.formSubmissionEndpoint && 
    CONFIG.formSubmissionEndpoint !== "REPLACE_WITH_GOOGLE_APPS_SCRIPT_URL" &&
    CONFIG.formSubmissionEndpoint.startsWith("http");

  if (!isEndpointConfigured) {
    if (supabaseSaved) {
      // Successfully saved to Supabase!
      showSuccessScreen(regId, false);
      state.isSubmitting = false;
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>ACTIVATE MY AGENT ⚡</span>`;
      }
      return;
    }

    // Development / Local Mode
    console.info("==================================================");
    console.info("AGENTBLAZER REGISTRATION CAPTURED (LOCAL MODE):");
    console.info(payload);
    console.info("==================================================");

    // Simulate minor network delay for smooth UX
    setTimeout(() => {
      showSuccessScreen(regId, true);
      state.isSubmitting = false;
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>ACTIVATE MY AGENT ⚡</span>`;
      }
    }, 600);
    return;
  }

  // Live Production Submission to Google Apps Script (if also configured)
  try {
    const response = await fetch(CONFIG.formSubmissionEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok && response.type !== "opaque") {
      throw new Error(`Server returned status: ${response.status}`);
    }

    // Success
    showSuccessScreen(regId, false);
  } catch (error) {
    console.error("Submission failed:", error);
    if (submissionError) {
      submissionError.classList.add("active");
      submissionError.innerHTML = `
        <strong>Submission Notice:</strong> Something went wrong while submitting to Google Sheets.<br>
        Your data has been preserved and saved to your device. Please check your connection and try again.
      `;
    }
  } finally {
    state.isSubmitting = false;
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>ACTIVATE MY AGENT ⚡</span>`;
    }
  }
}

// Safeguard local storage of registrations
function saveRegistrationLocally(data) {
  try {
    const key = "agentblazer_registrations";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(data);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

// ==========================================================================
// 12. SUCCESS SCREEN
// ==========================================================================
function showSuccessScreen(regId, isDevMode) {
  const wizardCard = document.querySelector(".reg-wizard-card");
  const successScreen = document.getElementById("success-screen");
  const displayIdElem = document.getElementById("display-reg-id");

  if (displayIdElem) {
    displayIdElem.textContent = regId;
  }

  if (wizardCard) wizardCard.style.display = "none";
  if (successScreen) {
    successScreen.classList.add("active");
    successScreen.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function resetForm() {
  const wizardCard = document.querySelector(".reg-wizard-card");
  const successScreen = document.getElementById("success-screen");
  const regForm = document.getElementById("agentblazer-form");

  if (regForm) regForm.reset();

  state.currentStep = 1;
  state.formData = {
    timestamp: "",
    registrationId: "",
    fullName: "",
    collegeEmail: "",
    personalEmail: "",
    contactNumber: "",
    whatsappNumber: "",
    year: "",
    branch: "",
    section: "",
    interests: [],
    motivation: "",
    aiAgentIdea: ""
  };
  state.sameAsContact = true;

  // Reset visual cards
  document.querySelectorAll(".selectable-card").forEach(c => c.classList.remove("selected"));
  document.querySelectorAll(".interest-chip").forEach(c => {
    c.classList.remove("selected", "disabled");
  });

  const secContainer = document.getElementById("section-options-container");
  if (secContainer) secContainer.innerHTML = '<span class="text-dim text-sm">Select branch first</span>';

  const counterTag = document.getElementById("interests-counter");
  if (counterTag) counterTag.textContent = "0 / 3 SELECTED";

  const motCounter = document.getElementById("motivation-char-counter");
  if (motCounter) motCounter.textContent = "0 / 400";

  const aiCounter = document.getElementById("ai-char-counter");
  if (aiCounter) aiCounter.textContent = "0 / 400";

  goToStep(1);

  if (successScreen) successScreen.classList.remove("active");
  if (wizardCard) wizardCard.style.display = "block";

  // Scroll back to hero or registration
  const hero = document.getElementById("hero");
  if (hero) hero.scrollIntoView({ behavior: "smooth" });
}

// ==========================================================================
// 13. ADMIN EXPORT (CSV / EXCEL COMPATIBLE)
// ==========================================================================
function initAdminExportFeature() {
  const exportBtn = document.getElementById("admin-export-btn");
  if (!exportBtn) return;

  exportBtn.addEventListener("click", () => {
    try {
      const records = JSON.parse(localStorage.getItem("agentblazer_registrations") || "[]");
      if (records.length === 0) {
        alert("No registrations saved in this browser yet.");
        return;
      }

      const headers = [
        "Timestamp",
        "Registration ID",
        "Full Name",
        "College Email",
        "Personal Email",
        "Contact Number",
        "WhatsApp Number",
        "Year",
        "Branch",
        "Section",
        "Interests",
        "Why Agentblazer",
        "AI Agent Idea"
      ];

      const csvRows = [headers.join(",")];

      records.forEach(row => {
        const values = [
          `"${(row.timestamp || "").replace(/"/g, '""')}"`,
          `"${(row.registrationId || "").replace(/"/g, '""')}"`,
          `"${(row.fullName || "").replace(/"/g, '""')}"`,
          `"${(row.collegeEmail || "").replace(/"/g, '""')}"`,
          `"${(row.personalEmail || "").replace(/"/g, '""')}"`,
          `"${(row.contactNumber || "").replace(/"/g, '""')}"`,
          `"${(row.whatsappNumber || "").replace(/"/g, '""')}"`,
          `"${(row.year || "").replace(/"/g, '""')}"`,
          `"${(row.branch || "").replace(/"/g, '""')}"`,
          `"${(row.section || "").replace(/"/g, '""')}"`,
          `"${(Array.isArray(row.interests) ? row.interests.join("; ") : row.interests || "").replace(/"/g, '""')}"`,
          `"${(row.motivation || "").replace(/"/g, '""')}"`,
          `"${(row.aiAgentIdea || "").replace(/"/g, '""')}"`
        ];
        csvRows.push(values.join(","));
      });

      const csvBlob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const downloadUrl = URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `agentblazer_registrations_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Failed to export data.");
    }
  });
}

// ==========================================================================
// 14. ADMIN ROSTER MODAL CONTROLLER
// ==========================================================================
function initAdminRosterModal() {
  const modal = document.getElementById("admin-roster-modal");
  const rosterBtn = document.getElementById("admin-roster-btn");
  const closeBtn = document.getElementById("modal-close-btn");
  const footerCloseBtn = document.getElementById("modal-footer-close");
  const searchInput = document.getElementById("roster-search-input");
  const yearFilter = document.getElementById("roster-year-filter");
  const branchFilter = document.getElementById("roster-branch-filter");
  const modalExportBtn = document.getElementById("modal-export-btn");
  const seedSampleBtn = document.getElementById("btn-seed-sample");

  if (!modal || !rosterBtn) return;

  // Open modal
  rosterBtn.addEventListener("click", () => {
    modal.classList.add("active");
    renderRosterTable();
  });

  // Close modal
  const closeModal = () => modal.classList.remove("active");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (footerCloseBtn) footerCloseBtn.addEventListener("click", closeModal);
  
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Search & Filter listeners
  if (searchInput) searchInput.addEventListener("input", () => renderRosterTable());
  if (yearFilter) yearFilter.addEventListener("change", () => renderRosterTable());
  if (branchFilter) branchFilter.addEventListener("change", () => renderRosterTable());

  // Export from inside modal
  if (modalExportBtn) {
    modalExportBtn.addEventListener("click", () => {
      const exportBtn = document.getElementById("admin-export-btn");
      if (exportBtn) exportBtn.click();
    });
  }

  // Seed sample registrations for instant testing
  if (seedSampleBtn) {
    seedSampleBtn.addEventListener("click", () => {
      seedSampleRegistrations();
      renderRosterTable();
    });
  }
}

function renderRosterTable() {
  const tableBody = document.getElementById("roster-table-body");
  const totalCountEl = document.getElementById("roster-total-count");
  const y1CountEl = document.getElementById("roster-y1-count");
  const y2CountEl = document.getElementById("roster-y2-count");
  const y3CountEl = document.getElementById("roster-y3-count");

  const searchVal = (document.getElementById("roster-search-input")?.value || "").toLowerCase().trim();
  const yearVal = document.getElementById("roster-year-filter")?.value || "ALL";
  const branchVal = document.getElementById("roster-branch-filter")?.value || "ALL";

  const allRecords = JSON.parse(localStorage.getItem("agentblazer_registrations") || "[]");

  // Calculate live stats
  const total = allRecords.length;
  const y1 = allRecords.filter(r => r.year === "First Year").length;
  const y2 = allRecords.filter(r => r.year === "Second Year").length;
  const y3 = allRecords.filter(r => r.year === "Third Year").length;

  if (totalCountEl) totalCountEl.textContent = total;
  if (y1CountEl) y1CountEl.textContent = y1;
  if (y2CountEl) y2CountEl.textContent = y2;
  if (y3CountEl) y3CountEl.textContent = y3;

  if (!tableBody) return;

  // Filter records
  const filtered = allRecords.filter(rec => {
    // Search match
    const searchMatch = !searchVal || 
      (rec.fullName && rec.fullName.toLowerCase().includes(searchVal)) ||
      (rec.registrationId && rec.registrationId.toLowerCase().includes(searchVal)) ||
      (rec.collegeEmail && rec.collegeEmail.toLowerCase().includes(searchVal)) ||
      (rec.branch && rec.branch.toLowerCase().includes(searchVal));

    // Year match
    const yearMatch = yearVal === "ALL" || rec.year === yearVal;

    // Branch match
    const branchMatch = branchVal === "ALL" || rec.branch === branchVal;

    return searchMatch && yearMatch && branchMatch;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-roster-msg">
          ${allRecords.length === 0 ? "No registrations recorded yet. Register through the website or click '+ Add Sample Registrations'!" : "No registrations match your search / filter criteria."}
        </td>
      </tr>
    `;
    return;
  }

  // Render rows
  tableBody.innerHTML = filtered.map(item => {
    const interests = Array.isArray(item.interests) ? item.interests : (item.interests || "").split(", ");
    const interestPills = interests.map(i => `<span class="interest-tag-pill">${i.trim()}</span>`).join("");
    const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }) : "Recent";

    return `
      <tr>
        <td><span class="reg-id-badge">${item.registrationId || "N/A"}</span></td>
        <td><strong>${escapeHtml(item.fullName || "")}</strong></td>
        <td>${escapeHtml(item.year || "")}</td>
        <td><span style="font-weight: 700; color: var(--sf-blue-deep);">${escapeHtml(item.branch || "")}</span> (Sec ${escapeHtml(item.section || "N/A")})</td>
        <td><a href="mailto:${escapeHtml(item.collegeEmail)}" style="color: var(--sf-blue); text-decoration: none;">${escapeHtml(item.collegeEmail || "")}</a></td>
        <td>${escapeHtml(item.contactNumber || "")}</td>
        <td><div class="interests-pill-list">${interestPills}</div></td>
        <td style="font-size: 0.8rem; color: var(--text-dim); white-space: nowrap;">${formattedDate}</td>
      </tr>
    `;
  }).join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function seedSampleRegistrations() {
  const key = "agentblazer_registrations";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");

  const sampleStudents = [
    {
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      registrationId: "AB-AMR-1024",
      fullName: "Aarav Sharma",
      collegeEmail: "aarav.cse@am.students.amrita.edu",
      personalEmail: "aarav.dev@gmail.com",
      contactNumber: "9876543210",
      whatsappNumber: "9876543210",
      year: "Third Year",
      branch: "CSE",
      section: "A",
      interests: ["AI & AGENTIC AI", "AGENTFORCE", "CLOUD"],
      motivation: "Passionate about autonomous LLM agents and multi-agent consensus workflows.",
      aiAgentIdea: "An automated campus lab resource optimizer that allocates GPU compute."
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      registrationId: "AB-AMR-2048",
      fullName: "Ananya Iyer",
      collegeEmail: "ananya.ai@am.students.amrita.edu",
      personalEmail: "ananya.iyer99@gmail.com",
      contactNumber: "9845123456",
      whatsappNumber: "9845123456",
      year: "Second Year",
      branch: "AI",
      section: "B",
      interests: ["AI & AGENTIC AI", "DATA & ANALYTICS", "RESEARCH"],
      motivation: "Excited to explore the Agentforce Champions Journey and participate in national hackathons.",
      aiAgentIdea: "A smart syllabus query agent that answers academic schedule questions."
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      registrationId: "AB-AMR-3096",
      fullName: "Rohan Varma",
      collegeEmail: "rohan.ece@am.students.amrita.edu",
      personalEmail: "rohan.varma24@gmail.com",
      contactNumber: "9123456780",
      whatsappNumber: "9123456780",
      year: "First Year",
      branch: "ECE",
      section: "N/A",
      interests: ["SOFTWARE DEVELOPMENT", "WEB DEVELOPMENT", "CYBERSECURITY"],
      motivation: "Curious about intelligent edge computing and cross-disciplinary projects.",
      aiAgentIdea: "An IoT agent that monitors power consumption across academic blocks."
    }
  ];

  sampleStudents.forEach(sample => {
    if (!existing.some(r => r.registrationId === sample.registrationId)) {
      existing.unshift(sample);
    }
  });

  localStorage.setItem(key, JSON.stringify(existing));
}
