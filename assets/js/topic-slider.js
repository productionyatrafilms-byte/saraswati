// Prevent English content from flashing before
// the saved language is applied.
(() => {
  const STORAGE_KEY = "saraswatiTopicLang";

  const savedLang =
    localStorage.getItem(STORAGE_KEY) || "English";

  document.documentElement.classList.add(
    "lang-loading",
  );

  document.documentElement.setAttribute(
    "data-selected-lang",
    savedLang,
  );

  const loadingStyle =
    document.createElement("style");

  loadingStyle.innerHTML = `
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

  document.head.appendChild(loadingStyle);
})();

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    const DEFAULT_LANG = "English";
    const STORAGE_KEY = "saraswatiTopicLang";

    const html = document.documentElement;

    const pageTitle = document.querySelector(
      ".page-title span",
    );

    const swiperContent = document.querySelector(
      ".swiper-content",
    );

    // Left-side image
    const maskImage = document.querySelector(
      ".left-container .mask-image",
    );

    const prevBtn = document.querySelector(
      ".prev-btn-1",
    );

    const nextBtn = document.querySelector(
      ".next-btn-1",
    );

    const pagination = document.querySelector(
      ".custom-pagination",
    );

    const pranamLink = document.querySelector(
      ".pranam-link",
    );

    const pranamText = document.querySelector(
      ".pranam-link span",
    );

    const buttons = {
      English: document.querySelector(
        ".english-button",
      ),

      Hindi: document.querySelector(
        ".hindi-button",
      ),

      Gujarati: document.querySelector(
        ".gujrati-button",
      ),
    };

    let translations = {};

    let currentLang =
      localStorage.getItem(STORAGE_KEY) ||
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
        slides: ["slide-2.1"],
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
        const response = await fetch(
          "./assets/json/data.json",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Translation JSON file was not found.",
          );
        }

        translations = await response.json();
      } catch (error) {
        console.error(
          "Error loading translations:",
          error,
        );

        translations = {};
      }
    }

    function getSectionFromURL() {
      const params = new URLSearchParams(
        window.location.search,
      );

      const section = Number(
        params.get("section"),
      );

      return section >= 1 && section <= 3
        ? section
        : 1;
    }

    function setPageLang(lang) {
      if (lang === "Hindi") {
        html.lang = "hi";

        document.body.setAttribute(
          "data-lang",
          "hi",
        );
      } else if (lang === "Gujarati") {
        html.lang = "gu";

        document.body.setAttribute(
          "data-lang",
          "gu",
        );
      } else {
        html.lang = "en";

        document.body.setAttribute(
          "data-lang",
          "en",
        );
      }

      html.setAttribute(
        "data-selected-lang",
        lang,
      );
    }

    function setActiveButton(lang) {
      Object.values(buttons).forEach(
        (button) => {
          if (button) {
            button.classList.remove("active");
          }
        },
      );

      if (buttons[lang]) {
        buttons[lang].classList.add("active");
      }
    }

    function getTranslation(lang, key) {
      return (
        translations?.[lang]?.[key] ??
        translations?.English?.[key] ??
        ""
      );
    }

    function isFinalSlide() {
      const section = sectionMap[currentSection];

      if (!section) return false;

      return (
        currentSection === 3 &&
        currentSlide === section.slides.length
      );
    }

    function showPranamLink() {
      if (!pranamLink) return;

      // Restart the Pranam animation whenever
      // the final slide is reached.
      pranamLink.classList.remove("show");

      void pranamLink.offsetWidth;

      pranamLink.classList.add("show");

      pranamLink.setAttribute(
        "aria-hidden",
        "false",
      );

      pranamLink.setAttribute(
        "tabindex",
        "0",
      );
    }

    function hidePranamLink() {
      if (!pranamLink) return;

      pranamLink.classList.remove("show");

      pranamLink.setAttribute(
        "aria-hidden",
        "true",
      );

      pranamLink.setAttribute(
        "tabindex",
        "-1",
      );
    }

    function createPagination() {
      if (!pagination) return;

      pagination.innerHTML = "";

      if (totalSlides <= 1) return;

      for (
        let slideNumber = 1;
        slideNumber <= totalSlides;
        slideNumber++
      ) {
        const bullet =
          document.createElement("span");

        bullet.className =
          "pagination-bullet";

        bullet.setAttribute(
          "role",
          "button",
        );

        bullet.setAttribute(
          "aria-label",
          `Go to slide ${slideNumber}`,
        );

        if (slideNumber === currentSlide) {
          bullet.classList.add("active");
        }

        bullet.addEventListener(
          "click",
          () => {
            currentSlide = slideNumber;
            renderSectionContent();
          },
        );

        pagination.appendChild(bullet);
      }
    }

    function updateNavButtons() {
      const section =
        sectionMap[currentSection];

      if (!section) return;

      const firstSlide =
        currentSection === 1 &&
        currentSlide === 1;

      const finalSlide = isFinalSlide();

      // Previous button
      if (prevBtn) {
        prevBtn.classList.toggle(
          "show",
          !firstSlide,
        );

        prevBtn.setAttribute(
          "aria-hidden",
          String(firstSlide),
        );
      }

      // Next button
      if (nextBtn) {
        nextBtn.classList.toggle(
          "hide",
          finalSlide,
        );

        nextBtn.setAttribute(
          "aria-hidden",
          String(finalSlide),
        );
      }

      // Pranam button
      if (finalSlide) {
        showPranamLink();
      } else {
        hidePranamLink();
      }
    }

    // Change the left-side image according
    // to the active section.
    function updateSectionImage() {
      if (!maskImage) return;

      if (currentSection === 3) {
        maskImage.src =
          "./assets/images/gif-box-1.png";

        maskImage.alt = "Section 3";
      } else {
        maskImage.src =
          "./assets/images/devi_ 1.png";

        maskImage.alt = "Devi Saraswati";
      }
    }

    function renderSectionContent() {
      const section =
        sectionMap[currentSection];

      if (!section) return;

      totalSlides = section.slides.length;

      if (currentSlide < 1) {
        currentSlide = 1;
      }

      if (currentSlide > totalSlides) {
        currentSlide = totalSlides;
      }

      setPageLang(currentLang);

      if (pageTitle) {
        pageTitle.setAttribute(
          "data-lang-key",
          section.titleKey,
        );

        pageTitle.innerHTML =
          getTranslation(
            currentLang,
            section.titleKey,
          );
      }

      if (swiperContent) {
        const slideKey =
          section.slides[currentSlide - 1];

        swiperContent.setAttribute(
          "data-lang-key",
          slideKey,
        );

        swiperContent.innerHTML =
          getTranslation(
            currentLang,
            slideKey,
          );

        // Restart the content animation
        swiperContent.classList.remove(
          "content-animate",
        );

        void swiperContent.offsetWidth;

        swiperContent.classList.add(
          "content-animate",
        );
      }

      if (pranamText) {
        pranamText.innerHTML =
          getTranslation(
            currentLang,
            "pranam",
          ) || "Pranam";
      }

      // Update the section image
      updateSectionImage();

      createPagination();
      updateNavButtons();
    }

    function updateLanguage(lang) {
      currentLang = lang;

      localStorage.setItem(
        STORAGE_KEY,
        currentLang,
      );

      setPageLang(currentLang);
      setActiveButton(currentLang);
      renderSectionContent();
    }

    function goNext() {
      const section =
        sectionMap[currentSection];

      if (!section || isFinalSlide()) {
        return;
      }

      if (
        currentSlide <
        section.slides.length
      ) {
        currentSlide++;
      } else if (currentSection < 3) {
        currentSection++;
        currentSlide = 1;
      }

      renderSectionContent();
    }

    function goPrev() {
      const firstSlide =
        currentSection === 1 &&
        currentSlide === 1;

      if (firstSlide) return;

      if (currentSlide > 1) {
        currentSlide--;
      } else if (currentSection > 1) {
        currentSection--;

        currentSlide =
          sectionMap[currentSection]
            .slides.length;
      }

      renderSectionContent();
    }

    if (prevBtn) {
      prevBtn.addEventListener(
        "click",
        goPrev,
      );
    }

    if (nextBtn) {
      nextBtn.addEventListener(
        "click",
        goNext,
      );
    }

    if (buttons.English) {
      buttons.English.addEventListener(
        "click",
        () => {
          updateLanguage("English");
        },
      );
    }

    if (buttons.Hindi) {
      buttons.Hindi.addEventListener(
        "click",
        () => {
          updateLanguage("Hindi");
        },
      );
    }

    if (buttons.Gujarati) {
      buttons.Gujarati.addEventListener(
        "click",
        () => {
          updateLanguage("Gujarati");
        },
      );
    }

    document
      .querySelectorAll("a")
      .forEach((link) => {
        link.addEventListener(
          "click",
          () => {
            localStorage.setItem(
              STORAGE_KEY,
              currentLang,
            );
          },
        );
      });

    window.addEventListener(
      "beforeunload",
      () => {
        localStorage.setItem(
          STORAGE_KEY,
          currentLang,
        );
      },
    );

    await loadTranslations();

    currentLang =
      localStorage.getItem(STORAGE_KEY) ||
      DEFAULT_LANG;

    currentSection = getSectionFromURL();
    currentSlide = 1;

    setPageLang(currentLang);
    setActiveButton(currentLang);
    renderSectionContent();

    requestAnimationFrame(() => {
      revealPage();
    });
  },
);