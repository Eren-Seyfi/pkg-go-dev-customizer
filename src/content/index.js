import Prism from "prismjs";
import "prismjs/components/prism-go.js";
import "prismjs/themes/prism-tomorrow.css";
import "./style.css";

// ==========================================================================
// 1. KOD BLOKLARINA VE EDITÖRLERE KOPYALAMA BUTONU
// ==========================================================================
function addCopyButton(containerElement, targetElement) {
  if (containerElement.querySelector(".copy-code-btn")) return;

  const button = document.createElement("button");
  button.className = "copy-code-btn";
  button.type = "button";
  button.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    <span>Kopyala</span>
  `;

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const elementToRead = targetElement || containerElement;

    let codeText = "";
    if (elementToRead.value !== undefined) {
      codeText = elementToRead.value;
    } else {
      // Düğümün bir kopyasını alıp buton elemanlarını temizleyerek kopyalıyoruz
      const clone = elementToRead.cloneNode(true);
      const btns = clone.querySelectorAll(".copy-code-btn");
      btns.forEach((b) => b.remove());
      codeText = clone.textContent;
    }

    // Metin sonundaki kopyalama yazı artıklarını temizle
    codeText = codeText
      ? codeText.replace(/Kopyala|Kopyalandı!/g, "").trim()
      : "";

    if (!codeText) return;

    try {
      await navigator.clipboard.writeText(codeText);
      const span = button.querySelector("span");
      button.classList.add("copied");
      span.textContent = "Kopyalandı!";

      setTimeout(() => {
        button.classList.remove("copied");
        span.textContent = "Kopyala";
      }, 2000);
    } catch (err) {
      console.error("Kopyalama başarısız oldu:", err);
    }
  });

  containerElement.appendChild(button);
}

// Saf kod metnini ayıklayan yardımcı fonksiyon
function getCleanCodeText(element) {
  const clone = element.cloneNode(true);
  const copyBtns = clone.querySelectorAll(".copy-code-btn");
  copyBtns.forEach((btn) => btn.remove());

  let text = clone.textContent || "";
  return text.replace(/Kopyala|Kopyalandı!/g, "").trim();
}

// ==========================================================================
// 2. PRE BLOKLARI VE EXAMPLE TEXTAREA EDITÖR RENKLENDİRMESİ
// ==========================================================================
function highlightGoCode() {
  // A) Normal Pre Blokları
  const preElements = document.querySelectorAll(
    "pre:not(.Documentation-exampleOutputContainer):not(.custom-editable-pre)",
  );

  preElements.forEach((pre) => {
    let codeElement = pre.querySelector("code");

    if (!pre.classList.contains("language-go")) {
      pre.classList.add("language-go");

      if (!codeElement) {
        codeElement = document.createElement("code");
        codeElement.className = "language-go";
        codeElement.innerHTML = pre.innerHTML;
        pre.innerHTML = "";
        pre.appendChild(codeElement);
      } else {
        codeElement.classList.add("language-go");
      }

      if (window.Prism) {
        Prism.highlightElement(codeElement);
      }
    }

    if (codeElement) {
      addCopyButton(pre, codeElement);
    }
  });

  // B) Example Kutularındaki Textarea'ları Canlı Düzenlenebilir Renkli Editör Yapma
  const exampleTextareas = document.querySelectorAll(
    ".Documentation-exampleCode.code",
  );

  exampleTextareas.forEach((textarea) => {
    if (textarea.dataset.enhanced === "true") return;
    textarea.dataset.enhanced = "true";

    const parent = textarea.parentElement;
    if (!parent) return;

    // 1. Canlı Editör Dış Kapsayıcısı
    const editorWrapper = document.createElement("div");
    editorWrapper.className = "custom-live-editor-wrapper";

    // 2. Düzenlenebilir Pre & Code Yapısı
    const editablePre = document.createElement("pre");
    editablePre.className = "custom-editable-pre language-go";

    const editableCode = document.createElement("code");
    editableCode.className = "language-go";
    editableCode.contentEditable = "true";
    editableCode.spellcheck = false;

    // Textarea ilk içeriğini al ve "Kopyala" yazısı kalıntılarını temizle
    const initialText = textarea.value
      .replace(/Kopyala|Kopyalandı!/g, "")
      .trim();
    editableCode.textContent = initialText;

    editablePre.appendChild(editableCode);
    editorWrapper.appendChild(editablePre);

    // Orijinal textarea'yı gizle ama DOM'da tut (Run/Format butonları için)
    textarea.style.display = "none";
    parent.insertBefore(editorWrapper, textarea);

    // İlk Renklendirme
    if (window.Prism) {
      Prism.highlightElement(editableCode);
    }

    // Kopyalama Butonunu editorWrapper seviyesine ekle
    addCopyButton(editorWrapper, editableCode);

    // Canlı Yazma & Senkronizasyon
    const syncTextarea = () => {
      const cleanText = getCleanCodeText(editableCode);
      textarea.value = cleanText;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    };

    editableCode.addEventListener("input", syncTextarea);
    editableCode.addEventListener("blur", syncTextarea);

    // Tab Tuşu İle Girinti (Indent) Desteği
    editableCode.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        document.execCommand("insertText", false, "\t");
      }
    });
  });
}

function enhanceIndexTree() {
  const indexList = document.querySelector(".Documentation-indexList");
  if (!indexList || indexList.classList.contains("tree-enhanced")) return;

  indexList.classList.add("tree-enhanced");

  const links = indexList.querySelectorAll("a");
  links.forEach((link) => {
    link.textContent = link.textContent.trim();
  });
}

// ==========================================================================
// 3. İÇİNDEKİLER (INDEX) AKORDİYON SİSTEMİ
// ==========================================================================
function initIndexAccordion() {
  const indexContainer = document.querySelector(".Documentation-indexList");
  if (!indexContainer) return;

  function getSubLists(typeItem) {
    const subLists = [];
    let curr = typeItem.nextElementSibling;

    while (
      curr &&
      !curr.classList.contains("Documentation-indexType") &&
      !curr.classList.contains("Documentation-indexFunction") &&
      !curr.classList.contains("Documentation-indexVariables")
    ) {
      const subList = curr.querySelector(
        ".Documentation-indexTypeMethods, .Documentation-indexTypeFunctions",
      );
      if (subList) {
        let wrapper = curr.querySelector(".index-sublist-wrapper");
        if (!wrapper) {
          wrapper = document.createElement("div");
          wrapper.className = "index-sublist-wrapper";
          subList.parentNode.insertBefore(wrapper, subList);
          wrapper.appendChild(subList);
        }
        subLists.push(wrapper);
      }
      curr = curr.nextElementSibling;
    }
    return subLists;
  }

  const indexHeader =
    document.querySelector("#pkg-index") ||
    document.querySelector(".Documentation-indexHeader");

  if (indexHeader && !document.querySelector(".toggle-all-index-btn")) {
    const toggleAllBtn = document.createElement("button");
    toggleAllBtn.className = "toggle-all-index-btn";
    toggleAllBtn.innerHTML = '<span class="btn-icon">▸</span> Tümünü Daralt';
    toggleAllBtn.dataset.state = "expanded";

    toggleAllBtn.addEventListener("click", () => {
      const isExpanded = toggleAllBtn.dataset.state === "expanded";
      const allTypeItems = indexContainer.querySelectorAll(
        ".Documentation-indexType",
      );

      allTypeItems.forEach((item) => {
        const wrappers = getSubLists(item);
        if (wrappers.length > 0) {
          if (isExpanded) {
            item.classList.add("collapsed");
            wrappers.forEach((w) => w.classList.add("collapsed-wrapper"));
          } else {
            item.classList.remove("collapsed");
            wrappers.forEach((w) => w.classList.remove("collapsed-wrapper"));
          }
        }
      });

      toggleAllBtn.dataset.state = isExpanded ? "collapsed" : "expanded";
      toggleAllBtn.innerHTML = isExpanded
        ? '<span class="btn-icon">▾</span> Tümünü Genişlet'
        : '<span class="btn-icon">▸</span> Tümünü Daralt';
    });

    indexHeader.appendChild(toggleAllBtn);
  }

  const typeItems = indexContainer.querySelectorAll(".Documentation-indexType");

  typeItems.forEach((item) => {
    const wrappers = getSubLists(item);

    if (wrappers.length > 0 && !item.querySelector(".tree-toggle-btn")) {
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "tree-toggle-btn";
      toggleBtn.setAttribute("type", "button");
      toggleBtn.setAttribute("aria-label", "Toggle subsection");
      toggleBtn.innerHTML = `
        <svg class="chevron-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
          <path d="M12.78 6.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L8 9.94l3.72-3.72a.75.75 0 0 1 1.06 0Z"></path>
        </svg>
      `;

      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isCurrentlyCollapsed = item.classList.contains("collapsed");

        if (isCurrentlyCollapsed) {
          item.classList.remove("collapsed");
          wrappers.forEach((w) => w.classList.remove("collapsed-wrapper"));
        } else {
          item.classList.add("collapsed");
          wrappers.forEach((w) => w.classList.add("collapsed-wrapper"));
        }
      });

      item.insertBefore(toggleBtn, item.firstChild);
    }
  });
}

// ==========================================================================
// 4. EKLENTİ BAŞLATMA VE OBSERVER
// ==========================================================================
export function initContentScript() {
  function initEklenti() {
    highlightGoCode();
    enhanceIndexTree();
    initIndexAccordion();
    initBottomSearchBar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEklenti);
  } else {
    initEklenti();
  }

  let observerTimeout = null;
  const observer = new MutationObserver(() => {
    if (observerTimeout) clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      initEklenti();
    }, 100);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "SHOW_LOADING_MODAL") {
      showModal(request.prompt, "Gemini yanıtı bekleniyor... ⏳");
    } else if (request.action === "SHOW_RESULT_MODAL") {
      showModal(request.prompt, request.answer);
    }
  });
}

// ==========================================================================
// 5. SAYFA ALTI SABİT AI ARAMA ÇUBUĞU VE MODAL
// ==========================================================================
function initBottomSearchBar() {
  if (document.getElementById("gemini-bottom-search-container")) return;

  const container = document.createElement("div");
  container.id = "gemini-bottom-search-container";
  container.innerHTML = `
    <div class="gemini-search-bar-wrapper">
      <span class="gemini-search-icon">✨</span>
      <input type="text" id="gemini-search-input" placeholder="Gemini AI'ya bir soru sor..." autocomplete="off" />
      <button type="button" id="gemini-search-submit-btn" title="Gönder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  `;

  document.body.appendChild(container);

  const input = container.querySelector("#gemini-search-input");
  const submitBtn = container.querySelector("#gemini-search-submit-btn");

  const handleSearch = () => {
    const query = input.value.trim();
    if (query.length > 0) {
      startGeminiAsk(query);
      input.value = "";
    }
  };

  submitBtn.addEventListener("click", handleSearch);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  });

  document.addEventListener("mouseup", () => {
    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText.length > 2) {
        input.value = selectedText;
        input.focus();
      }
    }, 10);
  });
}

function startGeminiAsk(promptText) {
  showModal(promptText, "Gemini yanıt üretiyor, lütfen bekleyin... ⏳");

  chrome.runtime.sendMessage(
    {
      action: "ASK_GEMINI",
      prompt: promptText,
    },
    (response) => {
      if (response && response.answer) {
        showModal(promptText, response.answer);
      } else {
        showModal(
          promptText,
          "Bir hata oluştu: " + (response?.error || "Cevap alınamadı."),
        );
      }
    },
  );
}

function showModal(prompt, content) {
  let modal = document.getElementById("gemini-ai-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "gemini-ai-modal";
    modal.innerHTML = `
      <div class="gemini-modal-content">
        <div class="gemini-modal-header">
          <span>✨ Gemini AI Yanıtı</span>
          <button class="gemini-modal-close">&times;</button>
        </div>
        <div class="gemini-modal-prompt"><strong>Soru:</strong> <span id="gemini-prompt-text"></span></div>
        <div class="gemini-modal-body" id="gemini-body-text"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".gemini-modal-close").onclick = () => {
      modal.style.display = "none";
    };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
      }
    });
  }

  document.getElementById("gemini-prompt-text").innerText = prompt;
  document.getElementById("gemini-body-text").innerText = content;
  modal.style.display = "flex";
}
