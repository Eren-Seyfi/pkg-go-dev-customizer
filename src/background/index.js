// ==========================================================================
// BACKGROUND (SERVICE WORKER) BAŞLATMA
// ==========================================================================
export function initBackground() {
  // 1. SAĞ TIK (CONTEXT MENU) OLUŞTURMA VE DİNLENMESİ
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "ask-gemini-selected",
      title: "AI'ya Sor (Gemini): '%s'",
      contexts: ["selection"],
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (
      info.menuItemId === "ask-gemini-selected" &&
      info.selectionText &&
      tab?.id
    ) {
      chrome.tabs
        .sendMessage(tab.id, {
          action: "SHOW_LOADING_MODAL",
          prompt: info.selectionText,
        })
        .catch(() => {});

      processGeminiQueryWithRetry(info.selectionText, 3, (response) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "SHOW_RESULT_MODAL",
            prompt: info.selectionText,
            answer: response.answer || response.error,
          })
          .catch((err) => {
            console.error("Sonuç modalı gönderilemedi:", err);
          });
      });
    }
  });

  // 2. CONTENT SCRIPT MESAJ DİNLENMESİ
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ASK_GEMINI") {
      // 3 Defa Yeniden Deneme (Retry) Parametresi ile Çalıştır
      processGeminiQueryWithRetry(request.prompt, 3, sendResponse);
      return true; // Asenkron yanıt
    }
  });
}

// ==========================================================================
// 3. RETRY (YENİDEN DENEME) DESTEKLİ GEMINI İŞLEM AKIŞI
// ==========================================================================

function processGeminiQueryWithRetry(
  promptText,
  maxRetries = 3,
  finalCallback,
) {
  let attempt = 0;

  function attemptQuery() {
    attempt++;

    executeSingleGeminiQuery(promptText, (response) => {
      // Eğer başarılı bir yanıt alındıysa direkt tamamla
      if (response && response.answer) {
        finalCallback(response);
      } else {
        // Hata alındıysa ve deneme hakkı kaldıysa tekrar dene
        if (attempt < maxRetries) {
          console.warn(
            `Gemini sorgusu başarısız oldu (${attempt}/${maxRetries}). 2 saniye sonra tekrar deneniyor...`,
          );
          setTimeout(() => {
            attemptQuery();
          }, 2000); // Denemeler arası 2 saniye bekleme süresi
        } else {
          // Tüm denemeler tükendiğinde hatayı dön
          finalCallback({
            error: `${maxRetries} deneme sonrasında da Gemini'den yanıt alınamadı. Lütfen oturumunuzu ve internet bağlantınızı kontrol edin.`,
          });
        }
      }
    });
  }

  attemptQuery();
}

// Tekil Sorgu Mantığı
function executeSingleGeminiQuery(promptText, callback) {
  let isHandled = false;

  chrome.tabs.create(
    { url: "https://gemini.google.com/app", active: false },
    (tab) => {
      if (!tab || !tab.id) {
        callback({ error: "Gemini sekmesi oluşturulamadı." });
        return;
      }

      // Güvenlik zaman aşımı (20 saniye)
      const timeoutId = setTimeout(() => {
        if (!isHandled) {
          isHandled = true;
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.remove(tab.id).catch(() => {});
          callback({ error: "Zaman aşımı." });
        }
      }, 20000);

      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          setTimeout(() => {
            chrome.tabs.sendMessage(
              tab.id,
              {
                action: "EXECUTE_PROMPT",
                prompt: promptText,
              },
              (geminiResponse) => {
                clearTimeout(timeoutId);
                if (isHandled) return;
                isHandled = true;

                const lastError = chrome.runtime.lastError;

                chrome.tabs.remove(tab.id).catch(() => {});

                if (lastError) {
                  callback({ error: "İletişim hatası." });
                } else {
                  callback(geminiResponse || { error: "Cevap alınamadı." });
                }
              },
            );
          }, 2000);
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    },
  );
}
