// ==========================================================================
// GEMINI BRIDGE (gemini.google.com/app Sekmesinde Çalışan Köprü)
// ==========================================================================
export function initGeminiBridge() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "EXECUTE_PROMPT") {
      runGeminiQuery(request.prompt).then((answer) => {
        sendResponse({ answer });
      });
      return true; // Asenkron yanıt döneceğimizi belirtir
    }
  });
}

async function runGeminiQuery(promptText) {
  // 1. Girdi kutusunu bul
  const inputArea = await waitForElement(
    'rich-textarea p, div[contenteditable="true"], p[data-placeholder]',
  );
  if (!inputArea) return "Hata: Gemini girdi alanı bulunamadı.";

  // Mevcut yanıt sayısını kaydet (Yeni yanıtı doğru ayırt edebilmek için)
  const initialResponseCount = document.querySelectorAll(
    "message-content, .model-response-text, .markdown",
  ).length;

  // Metni alana yerleştir ve event'leri tetikle
  inputArea.focus();
  document.execCommand("insertText", false, promptText);

  // Framework'lerin değişimi algılaması için Input Event fırlat
  inputArea.dispatchEvent(new Event("input", { bubbles: true }));
  inputArea.dispatchEvent(new Event("change", { bubbles: true }));

  // 2. Gönder butonunun aktifleşmesini bekle ve tıkla
  const sendButton = await waitForActiveSendButton();
  if (sendButton) {
    sendButton.click();
  } else {
    return "Hata: Gönder butonu bulunamadı veya aktifleşmedi.";
  }

  // 3. Yanıtın tamamlanmasını bekle
  return await waitForResponse(initialResponseCount);
}

// Eleman yüklenene kadar MutationObserver ile bekleyen yardımcı fonksiyon
function waitForElement(selector, timeout = 12000) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

// Gönder butonunun aktif (enabled) olmasını bekleyen fonksiyon
function waitForActiveSendButton(timeout = 5000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkBtn = setInterval(() => {
      const btn = document.querySelector(
        'button[aria-label*="Send"], button[aria-label*="Gönder"], .send-button',
      );

      if (
        btn &&
        !btn.hasAttribute("disabled") &&
        btn.getAttribute("aria-disabled") !== "true"
      ) {
        clearInterval(checkBtn);
        resolve(btn);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkBtn);
        resolve(null);
      }
    }, 200);
  });
}

// Yanıtın üretilip bitmesini bekleyen fonksiyon
function waitForResponse(initialCount) {
  return new Promise((resolve) => {
    let hasStartedGenerating = false;
    let attempts = 0;

    const checkInterval = setInterval(() => {
      attempts++;

      // Stop/Durdur butonunu kontrol et
      const stopButton = document.querySelector(
        'button[aria-label*="Stop"], button[aria-label*="Durdur"], .stop-generating-button',
      );

      if (stopButton) {
        hasStartedGenerating = true; // Üretim başladı
      }

      // Üretim başladıktan sonra Stop butonu kaybolduysa veya yanıt sayısı arttıysa işlem bitmiştir
      const currentResponses = document.querySelectorAll(
        "message-content, .model-response-text, .markdown",
      );

      if (
        (hasStartedGenerating && !stopButton) ||
        (attempts > 5 && currentResponses.length > initialCount && !stopButton)
      ) {
        clearInterval(checkInterval);
        extractLastResponse(resolve);
      }

      // 35 saniye güvenlik zaman aşımı
      if (attempts > 35) {
        clearInterval(checkInterval);
        extractLastResponse(resolve);
      }
    }, 1000);
  });
}

// En son üretilen yanıt metnini çeken fonksiyon
function extractLastResponse(resolve) {
  const responseElements = document.querySelectorAll(
    "message-content, .model-response-text, .markdown",
  );

  if (responseElements.length > 0) {
    const lastResponse = responseElements[responseElements.length - 1];
    resolve(lastResponse.innerText.trim());
  } else {
    resolve("Yanıt metni ayıklanamadı.");
  }
}
