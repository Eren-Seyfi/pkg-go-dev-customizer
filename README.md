# pkg.go.dev Customizer & AI Assistant

`pkg.go.dev` üzerindeki Go dokümantasyon deneyimini iyileştiren, kod bloklarını modern temalarla renklendiren, canlı düzenlenebilir kod editörü sunan ve Gemini AI entegrasyonu ile dokümantasyonu etkileşimli hale getiren Vite tabanlı Chrome eklentisi.

---

## 🚀 Öne Çıkan Güncellemeler (Sürüm 1.1.0)

- **Vite 8.3.1 & ES Module Mimarisi:** Proje tamamen Vite altyapısına taşındı, modüler dosya yapısına geçildi (`src/`).
- **Kod Optimize Etme & Minification:** `terser` ile kod boyutu sıkıştırıldı ve üretim ortamı (production build) için performans optimize edildi.
- **NPM Bağımlılık Yönetimi:** `prismjs` gibi kütüphaneler manuel dosya yerine doğrudan NPM paketleri üzerinden import edilerek paket boyutları küçültüldü.

---

## ✅ Eklenen / Tamamlanan Özellikler

- [x] **Vite Build & Bundling Altyapısı:** `manifest.json` otomasyonu (`vite-plugin-static-copy`), Tree-shaking ve hızlı dev-server / watch desteği eklendi.
- [x] **Canlı Düzenlenebilir & Renkli Example Editörü:** `pkg.go.dev` üzerindeki ham `textarea` örnek kod alanları PrismJS ile renklendirildi ve canlı düzenlenebilir (`contenteditable`) yapıya dönüştürüldü.
- [x] **Kod Blokları Renklendirme:** Sayfadaki tüm Go kod blokları (`pre` / `code`) koyu tema (Prism Tomorrow) ile modern biçimde renklendirildi.
- [x] **Tek Tıkla Kopyalama Butonu:** Kod bloklarına ve canlı editör alanlarına otomatik "Kopyala" butonu eklendi (Kopyalama sonrasında koda buton metninin sızması engellendi).
- [x] **İçindekiler (Index) Ağaç Modeli:** Paket içindekiler tablosundaki fonksiyon (`fn`), tür (`type`) ve metot (`m`) yapıları görsel rozetler ve ağaç çizgileriyle kategorize edildi.
- [x] **Akordiyon Sistem & Toplu Daraltma:** İçindekiler alanına alt başlıkları tek tıkla açıp kapatma ve "Tümünü Daralt / Tümünü Genişlet" butonları entegre edildi.
- [x] **Sayfa Altı Sabit AI Arama Çubuğu:** Ekranın sağ altına sabitlenen arama çubuğu üzerinden hızlıca Gemini AI'ya soru sorma imkanı sağlandı.
- [x] **Seçili Metin Entegrasyonu:** Sayfa üzerinde herhangi bir metin seçildiğinde otomatik olarak AI arama çubuğuna aktarılması sağlandı.
- [x] **Sağ Tık (Context Menu) AI Sorgusu:** Seçilen bir kelime veya kod bloğuna sağ tıklayarak direkt Gemini üzerinden açıklama alma özelliği eklendi.
- [x] **Otomatik Retry (Yeniden Deneme) Mekanizması:** Arka planda Gemini ile iletişimde aksama olduğunda 3 defaya kadar otomatik yeniden sorgulama mantığı kuruldu.
- [x] **Modüler Yanıt Penceresi (Modal):** Gemini yanıtlarının sayfa içi estetik bir popup/modal içinde görüntülenmesi sağlandı.
- [x] **Sticky Navbar Z-Index Düzeltmesi:** Sayfa aşağı kaydırıldığında kopyalama butonlarının sabit üst navbar'ın arkasında kalacak şekilde katman düzenlemesi (`z-index: 2`) yapıldı.

---

## 🛠️ Kurulum ve Geliştirme

### 1. Bağımlılıkları Yükleme
```bash
npm install
```

### 2. Geliştirme Modu (Watch)
```bash
npm run dev
```

### 3. Production Build (Dağıtım İçin Sıkıştırılmış Kod)
```bash
npm run build
```

### 4. Chrome'a Ekleme
1. Chrome'da `chrome://extensions/` adresini açın.
2. Sağ üst köşedeki **Geliştirici modu (Developer mode)** anahtarını aktif edin.
3. **Paketlenmemiş öge yükle (Load unpacked)** butonuna tıklayın.
4. Proje dizinindeki **`dist/`** klasörünü seçin.

---

## 📌 Yapılacak Özellikler (Roadmap)

- [ ] **1) Yapay Zeka Sohbet Geçmişi:** Yapılan soru-cevapların geçmişini tutma ve daha sonra tekrar inceleyebilme özelliği.
- [ ] **2) Kalem / Alan Seçim Özelliği:** Sayfa üzerinde istenen alanın seçilerek ("element picker") o kısmın yapay zekaya doğrudan sorulabilmesi.
- [ ] **3) Markdown Formatında Sayfa Bağlamı (Context):** Sayfa kaynak bilgilerinin Markdown formatında AI'ya iletilerek verilen yanıtların doğruluk oranının artırılması.
- [ ] **4) Parçalı Çeviri Desteği:** Sayfa içerisindeki belirli paragraf veya teknik terimlerin doğrudan yapay zeka ile Türkçe / hedef dile çevrilmesi.
- [ ] **5) Yer İmleri (Bookmarks):** Dokümantasyonun önemli kısımlarının işaretlenip daha sonra kolayca erişilebilmesi.
- [ ] **6) Sayfa İçi Not Alma & İndirme:** Sayfa üzerine özel notlar ekleme, işaretleme ve bu notları `.md` / `.txt` olarak indirebilme.
- [ ] **7) Favori Kütüphaneler Menüsü:** Sık kullanılan Go paketlerini navbar üzerindeki dropdown menüye ekleyerek açıklama ve hızlı erişim bağlantısı sağlama.
- [ ] **8) Kod Bloklarında "AI'ya Sor" Butonu:** `pre` etiketlerindeki Kopyala butonunun yanına koddaki mantığı direkt açıklayan özel "AI'ya Sor" butonu yerleştirme.
- [ ] **9) Example Örneklerinde "AI'ya Sor":** Örnek kod bloklarına özel AI analiz butonlarının entegre edilmesi.
