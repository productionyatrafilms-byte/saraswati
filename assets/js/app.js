// Hide page instantly to prevent English flash before JSON language applies
(() => {
  const savedLang =
    localStorage.getItem("selectedLanguage") ||
    JSON.parse(localStorage.getItem("saraswatiPageState") || "{}")?.currentLang ||
    "English";

  document.documentElement.setAttribute("data-current-lang", savedLang);
  document.documentElement.classList.add("lang-loading");

  const style = document.createElement("style");
  style.innerHTML = `
    html.lang-loading body {
      opacity: 0;
      visibility: hidden;
    }

    html.lang-ready body {
      opacity: 1;
      visibility: visible;
      transition: opacity 0.15s ease;
    }
  `;
  document.head.appendChild(style);
})();

document.addEventListener("DOMContentLoaded", async () => {
  const DEFAULT_LANG = "English";
  const STORAGE_KEY = "saraswatiPageState";
  const LANG_KEY = "selectedLanguage";

  const html = document.documentElement;
  const pageContent = document.querySelector(".page-content");
  const videoPlayBtn = document.getElementById("videoPlayBtn");
  const videoOverlay = document.getElementById("videoOverlay");
  const popupVideo = document.getElementById("popupVideo");
  const closeVideo = document.getElementById("closeVideo");

  const center = document.querySelector(".center");
  const flower = document.querySelector(".flower");
  const centerSpan = document.querySelector(".center span");
  const homeBtns = document.querySelectorAll(".home-btn, .home-btn-1");
  const backToIndexBtn = document.querySelector(".back-to-index");
  const maskImage = document.querySelector(".left-container .mask-image");
  const pageTitle = document.querySelector(".page-title span");
  const swiperContent = document.querySelector(".swiper-content");
  const prevBtn1 = document.querySelector(".prev-btn-1");
  const nextBtn1 = document.querySelector(".next-btn-1");
  const pagination = document.querySelector(".custom-pagination");
  const backBtn = document.querySelector(".back-btn");

  const buttons = {
    English: document.querySelector(".english-button"),
    Hindi: document.querySelector(".hindi-button"),
    Gujarati: document.querySelector(".gujrati-button"),
  };

  let translations = {};
  let firstAnimationDone = false;
  let secondAnimationDone = false;
  let firstStageRunning = false;

  let currentLang =
    localStorage.getItem(LANG_KEY) ||
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")?.currentLang ||
    DEFAULT_LANG;

  let currentSection = 1;
  let currentSlide = 1;
  let totalSlides = 1;

  const sectionMap = {
    1: {
      titleKey: "topic-1",
      slides: ["slide-1.1"],
    },
    2: {
      titleKey: "topic-2",
      slides: ["slide-2.1", "slide-2.2", "slide-2.3", "slide-2.4", "slide-2.5"],
    },
    3: {
      titleKey: "topic-3",
      slides: ["slide-3.1"],
    },
  };

  function revealPage() {
    html.classList.remove("lang-loading");
    html.classList.add("lang-ready");
  }

  async function loadTranslations() {
    try {
      const response = await fetch("./assets/json/data.json", {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("JSON file not found");

      translations = await response.json();
    } catch (error) {
      console.error("Error loading translations:", error);
      translations = {};
    }
  }

  function saveState() {
    const state = {
      firstAnimationDone,
      secondAnimationDone,
      firstStageRunning,
      currentLang,
      currentSection,
      currentSlide,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(LANG_KEY, currentLang);
  }

  function getSavedState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error reading saved state:", error);
      return null;
    }
  }

  function clearSavedState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getSectionFromURL() {
    const params = new URLSearchParams(window.location.search);
    const section = Number(params.get("section"));

    if (section >= 1 && section <= 3) return section;

    return null;
  }

  function setBodyLang(lang) {
    document.documentElement.lang =
      lang === "Hindi" ? "hi" : lang === "Gujarati" ? "gu" : "en";

    document.body.setAttribute(
      "data-lang",
      lang === "Hindi" ? "hi" : lang === "Gujarati" ? "gu" : "en",
    );

    html.setAttribute("data-current-lang", lang);
  }

  function setActiveButton(lang) {
    Object.values(buttons).forEach((btn) => {
      if (btn) btn.classList.remove("active");
    });

    if (buttons[lang]) {
      buttons[lang].classList.add("active");
    }
  }

  function getTranslation(lang, key) {
    return translations?.[lang]?.[key] ?? translations?.English?.[key] ?? "";
  }

  function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    setBodyLang(lang);
    setActiveButton(lang);

    const selectedLang = translations[lang];
    if (!selectedLang) {
      saveState();
      return;
    }

    document.querySelectorAll("[data-lang-key]").forEach((element) => {
      const key = element.getAttribute("data-lang-key");

      if (selectedLang[key] !== undefined) {
        element.innerHTML = selectedLang[key];
      }
    });

    renderSectionContent();
    saveState();
  }

  function updateMaskImageFocus() {
    if (!maskImage) return;

    const defaultMaskImage = "./assets/images/devi_ 1.png";
    const section3MaskImage = "./assets/images/gif-box-1.png";

    const zoomScale = 1.9;
    const zoomScale22 = 1.2;

    if (currentSection === 3) {
      maskImage.src = section3MaskImage;
      maskImage.style.opacity = "";
      maskImage.style.display = "";
      maskImage.style.transition = "";
      maskImage.style.transform = "";
      maskImage.style.transformOrigin = "";
      return;
    }

    maskImage.src = defaultMaskImage;

    if (currentSection === 1) {
      maskImage.style.opacity = "";
      maskImage.style.display = "";
      maskImage.style.transition = "";
      maskImage.style.transform = "";
      maskImage.style.transformOrigin = "";
      return;
    }

    if (currentSection === 2 && currentSlide === 1) {
      maskImage.style.opacity = "";
      maskImage.style.display = "";
      maskImage.style.transition = "";
      maskImage.style.transform = "";
      maskImage.style.transformOrigin = "";
      return;
    }

    let scale = 1;
    let originX = "50%";
    let originY = "50%";

    maskImage.style.opacity = "1";
    maskImage.style.display = "block";
    maskImage.style.transition =
      "transform 0.7s ease, transform-origin 0.7s ease, opacity 0.3s ease";

    if (currentSection === 2) {
      if (currentSlide === 2) {
        scale = zoomScale22;
        originX = "50%";
        originY = "50%";
      } else if (currentSlide === 3) {
        scale = zoomScale;
        originX = "1%";
        originY = "20%";
      } else if (currentSlide === 4) {
        scale = zoomScale;
        originX = "100%";
        originY = "60%";
      } else if (currentSlide === 5) {
        scale = zoomScale22;
        originX = "70%";
        originY = "100%";
      }
    }

    maskImage.style.transformOrigin = `${originX} ${originY}`;
    maskImage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function openVideo() {
    if (pageContent) pageContent.classList.add("blur");
    if (videoOverlay) videoOverlay.classList.add("show");

    if (popupVideo) {
      popupVideo.currentTime = 0;
      popupVideo.play().catch((error) => {
        console.log("Video play blocked:", error);
      });
    }
  }

  function closeVideoPopup() {
    if (pageContent) pageContent.classList.remove("blur");
    if (videoOverlay) videoOverlay.classList.remove("show");

    if (popupVideo) {
      popupVideo.pause();
      popupVideo.currentTime = 0;
    }
  }

  function disableFirstClickTargets() {
    if (flower) flower.style.pointerEvents = "none";
    if (centerSpan) centerSpan.style.pointerEvents = "none";
  }

  function enableFirstClickTargets() {
    if (flower) flower.style.pointerEvents = "auto";
    if (centerSpan) centerSpan.style.pointerEvents = "auto";
  }

  function animateFirstStage() {
    if (!center || !pageContent) return;
    if (firstAnimationDone || firstStageRunning) return;

    firstStageRunning = true;
    saveState();

    center.classList.add("animate", "restored-stage-1");
    pageContent.classList.add("design-animate", "restored-stage-1");

    setTimeout(() => {
      firstAnimationDone = true;
      firstStageRunning = false;
      disableFirstClickTargets();
      saveState();
    }, 1200);
  }

  function animateSecondStage() {
    if (!pageContent) return;
    if (!firstAnimationDone || secondAnimationDone || firstStageRunning) return;

    pageContent.classList.add("topic-show", "restored-stage-2");
    secondAnimationDone = true;
    saveState();
  }

  function applySavedVisualState(state) {
    const sectionFromURL = getSectionFromURL();

    firstAnimationDone = !!state?.firstAnimationDone;
    secondAnimationDone = !!state?.secondAnimationDone;
    firstStageRunning = false;

    currentLang =
      localStorage.getItem(LANG_KEY) ||
      state?.currentLang ||
      DEFAULT_LANG;

    currentSection = sectionFromURL || state?.currentSection || 1;
    currentSlide = sectionFromURL ? 1 : state?.currentSlide || 1;

    if (!pageContent || !center) return;

    html.classList.add("restoring-state");

    if (firstAnimationDone || state?.firstStageRunning) {
      center.classList.add("animate", "restored-stage-1");
      pageContent.classList.add("design-animate", "restored-stage-1");
      disableFirstClickTargets();
    } else {
      center.classList.remove("animate", "restored-stage-1");
      pageContent.classList.remove("design-animate", "restored-stage-1");
      enableFirstClickTargets();
    }

    if (secondAnimationDone) {
      pageContent.classList.add("topic-show", "restored-stage-2");
    } else {
      pageContent.classList.remove("topic-show", "restored-stage-2");
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        html.classList.remove("restoring-state");
      });
    });
  }

  function resetTransitions() {
    closeVideoPopup();

    firstAnimationDone = false;
    secondAnimationDone = false;
    firstStageRunning = false;

    // Important: do NOT reset language to English
    currentLang = localStorage.getItem(LANG_KEY) || currentLang || DEFAULT_LANG;

    currentSection = 1;
    currentSlide = 1;

    if (center) {
      center.classList.remove("animate", "restored-stage-1");
    }

    if (pageContent) {
      pageContent.classList.remove(
        "design-animate",
        "topic-show",
        "blur",
        "restored-stage-1",
        "restored-stage-2",
      );
    }

    enableFirstClickTargets();
    clearSavedState();
    saveState();
  }

  function saveCurrentVisualStateBeforeLeaving() {
    if (center?.classList.contains("animate")) {
      firstAnimationDone = true;
      firstStageRunning = false;
    }

    if (pageContent?.classList.contains("topic-show")) {
      secondAnimationDone = true;
    }

    currentLang = localStorage.getItem(LANG_KEY) || currentLang || DEFAULT_LANG;

    const state = {
      firstAnimationDone,
      secondAnimationDone,
      firstStageRunning: false,
      currentLang,
      currentSection,
      currentSlide,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(LANG_KEY, currentLang);
  }

  function createPagination() {
    if (!pagination) return;

    pagination.innerHTML = "";

    if (totalSlides <= 1) return;

    for (let i = 1; i <= totalSlides; i++) {
      const bullet = document.createElement("span");
      bullet.className = "pagination-bullet";

      if (i === currentSlide) {
        bullet.classList.add("active");
      }

      bullet.addEventListener("click", () => {
        currentSlide = i;
        renderSectionContent();
        saveState();
      });

      pagination.appendChild(bullet);
    }
  }

  function updateNavButtons() {
    const section = sectionMap[currentSection];
    if (!section) return;

    const isTopic3LastSlide =
      currentSection === 3 && currentSlide === section.slides.length;

    if (prevBtn1) {
      if (currentSection === 1 && currentSlide === 1) {
        prevBtn1.classList.remove("show");
      } else {
        prevBtn1.classList.add("show");
      }
    }

    if (nextBtn1) {
      if (
        currentSlide < section.slides.length ||
        isTopic3LastSlide ||
        currentSection < 3
      ) {
        nextBtn1.classList.add("show");
      } else {
        nextBtn1.classList.remove("show");
      }
    }
  }

  function renderSectionContent() {
    const section = sectionMap[currentSection];
    if (!section) return;

    totalSlides = section.slides.length;

    if (currentSlide > totalSlides) currentSlide = totalSlides;
    if (currentSlide < 1) currentSlide = 1;

    if (pageTitle) {
      const titleText = getTranslation(currentLang, section.titleKey);
      pageTitle.setAttribute("data-lang-key", section.titleKey);
      pageTitle.innerHTML = titleText;
    }

    if (swiperContent) {
      const slideKey = section.slides[currentSlide - 1];
      swiperContent.setAttribute("data-lang-key", slideKey);
      swiperContent.innerHTML = getTranslation(currentLang, slideKey);
    }

    createPagination();
    updateNavButtons();
    updateMaskImageFocus();
  }

  function goNext() {
    const section = sectionMap[currentSection];
    if (!section) return;

    if (currentSection === 3 && currentSlide === section.slides.length) {
      saveCurrentVisualStateBeforeLeaving();
      document.body.classList.add("page-exit");

      setTimeout(() => {
        window.location.href = "pranam.html";
      }, 350);

      return;
    }

    if (currentSlide < section.slides.length) {
      currentSlide++;
    } else if (currentSection < 3) {
      currentSection++;
      currentSlide = 1;
    }

    renderSectionContent();
    saveState();
  }

  function goPrev() {
    if (currentSection === 1 && currentSlide === 1) return;

    if (currentSlide > 1) {
      currentSlide--;
    } else if (currentSection > 1) {
      currentSection--;
      currentSlide = sectionMap[currentSection].slides.length;
    }

    renderSectionContent();
    saveState();
  }

  function goToPage(href) {
    if (!href || href.startsWith("#")) return;

    saveCurrentVisualStateBeforeLeaving();

    document.body.classList.add("page-exit");

    setTimeout(() => {
      window.location.href = href;
    }, 350);
  }

  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();

      saveCurrentVisualStateBeforeLeaving();

      currentSection = 3;
      currentSlide = 1;
      saveState();

      goToPage("who-is-devi-saraswati.html?section=3");
    });
  }

  if (videoPlayBtn) videoPlayBtn.addEventListener("click", openVideo);
  if (closeVideo) closeVideo.addEventListener("click", closeVideoPopup);

  if (videoOverlay) {
    videoOverlay.addEventListener("click", (e) => {
      if (e.target === videoOverlay) closeVideoPopup();
    });
  }

  if (flower) {
    flower.addEventListener("click", (e) => {
      if (!firstAnimationDone) {
        e.stopPropagation();
        animateFirstStage();
      }
    });
  }

  if (centerSpan) {
    centerSpan.addEventListener("click", (e) => {
      if (!firstAnimationDone) {
        e.stopPropagation();
        animateFirstStage();
      }
    });
  }

  if (center) {
    center.addEventListener("click", () => {
      if (!firstAnimationDone) return;
      if (secondAnimationDone) return;
      animateSecondStage();
    });
  }

  homeBtns.forEach((homeBtn) => {
    homeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetTransitions();

      const homeHref = homeBtn.getAttribute("href");
      if (homeHref) goToPage(homeHref);
    });
  });

  if (backToIndexBtn) {
    backToIndexBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const href = backToIndexBtn.getAttribute("href");
      if (href) goToPage(href);
    });
  }

  if (prevBtn1) prevBtn1.addEventListener("click", goPrev);
  if (nextBtn1) nextBtn1.addEventListener("click", goNext);

  if (buttons.English) {
    buttons.English.addEventListener("click", () => updateLanguage("English"));
  }

  if (buttons.Hindi) {
    buttons.Hindi.addEventListener("click", () => updateLanguage("Hindi"));
  }

  if (buttons.Gujarati) {
    buttons.Gujarati.addEventListener("click", () => updateLanguage("Gujarati"));
  }

  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#")) return;

      e.preventDefault();

      if (
        link.classList.contains("home-btn") ||
        link.classList.contains("home-btn-1")
      ) {
        resetTransitions();
      } else {
        saveCurrentVisualStateBeforeLeaving();
      }

      goToPage(href);
    });
  });

  window.addEventListener("beforeunload", saveCurrentVisualStateBeforeLeaving);
  window.addEventListener("pagehide", saveCurrentVisualStateBeforeLeaving);

  await loadTranslations();

  const savedState = getSavedState();
  const sectionFromURL = getSectionFromURL();

  applySavedVisualState(savedState);

  if (sectionFromURL) {
    currentSection = sectionFromURL;
    currentSlide = 1;
  }

  const savedLang =
    localStorage.getItem(LANG_KEY) ||
    savedState?.currentLang ||
    DEFAULT_LANG;

  updateLanguage(savedLang);
  renderSectionContent();
  saveState();

  requestAnimationFrame(() => {
    revealPage();
  });
});