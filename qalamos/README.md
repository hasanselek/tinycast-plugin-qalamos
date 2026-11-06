# Yazma Eser Arama (Qalamos) — Tinycast eklentisi

Qalamos aramasını tarayıcıda açar. Qalamos, tarayıcı dışı erişimi bir güvenlik kontrolüyle (proof-of-work) engellediği için arama Tinycast'in içinde değil, tarayıcıda yapılır: kontrolü tarayıcı geçer, **Yazma Eser Arama Yardımcısı** Chrome eklentisi (sürüm 1.7.0 ve sonrası) paneli açıp varyantlı aramayı kendiliğinden başlatır. Künye, Zotero ve RIS aktarımı eklentinin panelindedir.

## Kurulum

1. Tinycast → Ayarlar → Extensions → Install New → **Add from folder** → bu klasörü seçin (ya da üst klasörde `zsh kur.sh`).
2. Chrome'da `chrome://extensions` → Yazma Eser Arama Yardımcısı → **Yeniden yükle** (1.7.0 ile gelen otomatik arama için).

## Kullanım

Komut: **Qalamos'ta Ara**. Yazdığınız ifade için seçenekler çıkar: eser adı, müellif, tüm alanlar, raf no., kurum. İki alan birlikte için `Müellif / Eser` yazın (ör. `Gazzâlî / Mişkâtü'l-envâr`).

| Kısayol | İşlem |
|---|---|
| ↵ / tıklama | Aramayı tarayıcıda aç |
| ⇧⌘C | Arama bağlantısını kopyala |
| ⇧⌘O | Qalamos ana sayfası |

Ayarlardan tarayıcı seçilebilir (varsayılan: Google Chrome).

## Bağlantı biçimi

`https://qalamos.net/servlets/solr/find?condQuery=…#qka={"author":"…","title":"…"}` — `#qka=` kısmını eklenti okur (alanlar: author, title, shelfmark, free, institution). Eklenti yoksa Qalamos'un kendi araması açılır.
