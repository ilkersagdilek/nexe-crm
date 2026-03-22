# NEXE CRM — Kurulum Talimatları

## 1. Google Service Account Oluşturma (5 dakika)

1. https://console.cloud.google.com adresine gidin
2. **New Project** → Proje adı: `nexe-crm`
3. Sol menü → **APIs & Services** → **Enable APIs & Services**
4. **Google Sheets API** arayın → **Enable**
5. Sol menü → **Credentials** → **Create Credentials** → **Service Account**
   - Service account name: `nexe-sheets`
   - **Create and Continue** → **Done**
6. Oluşturulan service account'a tıklayın → **Keys** sekmesi
   - **Add Key** → **Create new key** → **JSON** → **Create**
   - İndirilen `.json` dosyasını saklayın

## 2. Google Sheets'e İzin Verme

1. `nexe-crm` Google Sheet'ini açın
2. Sağ üst **Paylaş** butonuna tıklayın
3. Service account e-postasını ekleyin (json dosyasındaki `client_email` değeri)
   - Örnek: `nexe-sheets@nexe-crm.iam.gserviceaccount.com`
4. Yetki: **Düzenleyici** → **Gönder**

## 3. Sheet'e Durum ve Atanan Sütunlarını Ekleyin

Google Sheets'te:
- `H1` hücresine: `Durum`
- `I1` hücresine: `Atanan`

## 4. Vercel'e Deploy

### A) GitHub'a yükleyin
```bash
git init
git add .
git commit -m "ilk commit"
git remote add origin https://github.com/KULLANICI/nexe-crm.git
git push -u origin main
```

### B) Vercel'e bağlayın
1. https://vercel.com → **New Project** → GitHub reponuzu seçin
2. **Environment Variables** bölümüne şunları ekleyin:

| Key | Value |
|-----|-------|
| `SHEET_ID` | `1__VliHV8h6soc9Gckt_sw72va1C7n_aJ` |
| `SHEET_NAME` | `Aday Listesi` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON dosyasının içeriğini TEK SATIR olarak yapıştırın |
| `ACCESS_PASSWORD` | `nexe2025` (veya istediğiniz şifre) |

> **JSON'u tek satıra çevirmek için:** json dosyasını bir text editörde açın, tüm satır sonlarını kaldırın. Ya da: `cat service-account.json | tr -d '\n'`

3. **Deploy** butonuna tıklayın — bitti!

## 5. Kullanım

- Giriş ekranında adınızı ve şifreyi girin
- 📞 butonu: Arama yapar + not modalı açılır
- ✏️ butonu: Not ekler, durum günceller
- Her not otomatik olarak kimin ne zaman yazdığını içerir
- Filtreler: Meslek, Durum, Atanan kişi
- Arama: İsim, e-posta, telefon üzerinde çalışır

## Yerel Geliştirme

```bash
npm install
cp .env.local.example .env.local
# .env.local dosyasını doldurun
npm run dev
```
