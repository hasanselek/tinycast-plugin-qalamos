"use strict";
// "Qalamos'ta Ara": aramayı tarayıcıda açar; Qalamos'un güvenlik kontrolünü tarayıcı geçer ve
// "Yazma Eser Arama Yardımcısı" eklentisi (sürüm 1.7.0+) paneli açıp aramayı kendiliğinden başlatır.
const React = require("react");
const { List, ActionPanel, Action, Icon, open, closeMainWindow, getPreferenceValues, showToast, Toast } = require("@raycast/api");

const recent = require("./assets/recent.js");

const h = React.createElement;
const BASE = "https://qalamos.net/";

/** #qka=<JSON> eklentinin okuduğu biçim; condQuery eklenti yoksa Qalamos'un kendi araması içindir. */
function searchUrl(fields) {
  const plain = Object.values(fields).filter(Boolean).join(" ");
  return `${BASE}servlets/solr/find?condQuery=${encodeURIComponent(plain)}#qka=${encodeURIComponent(JSON.stringify(fields))}`;
}

function choices(text) {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return [];
  const out = [];
  // "Müellif / Eser" ya da "Müellif, Eser" gibi iki parçalı yazım
  const pair = t.split(/\s+\/\s+/);
  if (pair.length === 2 && pair[0] && pair[1]) {
    out.push({ id: "pair", title: `${pair[1]}`, subtitle: `Müellif: ${pair[0]} · Eser: ${pair[1]}`, icon: Icon.Book, fields: { author: pair[0], title: pair[1] } });
  }
  out.push(
    { id: "title", title: t, subtitle: "Eser adı olarak ara", icon: Icon.Book, fields: { title: t } },
    { id: "author", title: t, subtitle: "Müellif olarak ara", icon: Icon.Person, fields: { author: t } },
    { id: "free", title: t, subtitle: "Tüm alanlarda ara", icon: Icon.MagnifyingGlass, fields: { free: t } },
    { id: "shelf", title: t, subtitle: "Raf no. (shelfmark) olarak ara", icon: Icon.Tag, fields: { shelfmark: t } },
    { id: "inst", title: t, subtitle: "Kurumda ara (ör. Bayerische Staatsbibliothek)", icon: Icon.Building, fields: { institution: t } },
  );
  return out;
}

async function go(url) {
  const { browser } = getPreferenceValues() || {};
  try {
    await open(url, browser || undefined);
    await closeMainWindow();
  } catch (e) {
    await showToast({ style: Toast.Style.Failure, title: "Tarayıcı açılamadı", message: String((e && e.message) || e) });
  }
}


// Arama çubuğu boşken önceki aramalar.
function historyItems(entries, pick, clear, describe) {
  return entries.map((e) =>
    h(List.Item, {
      key: "__h" + e.q,
      id: "__h" + e.q,
      title: e.q,
      subtitle: describe ? describe(e) : undefined,
      icon: Icon.Clock,
      detail: h(List.Item.Detail, { markdown: `**${e.q}**\n\n↵ ile bu aramayı yeniden göster.` }),
      actions: h(
        ActionPanel,
        null,
        h(Action, { title: "Bu Aramayı Göster", icon: Icon.MagnifyingGlass, onAction: () => pick(e) }),
        h(Action, { title: "Arama Geçmişini Temizle", icon: Icon.Trash, style: Action.Style.Destructive, onAction: clear }),
      ),
    }),
  );
}

// Son arama: çubuk boşken en son aramaya döner; yazılan arama sonuç verince kaydedilir.
function useRecall(text, restore) {
  const [recall, setRecall] = React.useState(() => recent.list()[0] || null);
  const [, setTick] = React.useState(0);
  const typed = text.trim();
  React.useEffect(() => {
    if (recall && restore) restore(recall);
  }, []);
  React.useEffect(() => {
    if (!typed) setRecall(recent.list()[0] || null);
  }, [typed]);
  const pick = (e) => {
    recent.remember(e);
    setRecall(e);
    if (restore) restore(e);
  };
  const clear = () => {
    recent.clear();
    setRecall(null);
    setTick((t) => t + 1);
    showToast({ style: Toast.Style.Success, title: "Arama geçmişi temizlendi" });
  };
  const others = typed ? [] : recent.list().filter((e) => !recall || e.q !== recall.q);
  return { typed, recall: typed ? null : recall, shown: typed || (recall ? recall.q : ""), pick, clear, others };
}

function Command() {
  const [text, setText] = React.useState("");
  const r = useRecall(text);
  const items = choices(r.shown);
  const rows = items.map((c) => {
      const url = searchUrl(c.fields);
      const run = () => {
        recent.remember({ q: r.shown });
        go(url);
      };
      return h(List.Item, {
        key: c.id,
        id: c.id,
        title: c.title,
        subtitle: c.subtitle,
        icon: c.icon,
        actions: h(
          ActionPanel,
          null,
          h(Action, { title: "Qalamos'ta Ara", icon: Icon.Globe, onAction: run }),
          h(Action.CopyToClipboard, { title: "Arama Bağlantısını Kopyala", content: url, shortcut: { modifiers: ["cmd", "shift"], key: "c" } }),
          h(Action.OpenInBrowser, { title: "Qalamos Ana Sayfası", url: BASE, shortcut: { modifiers: ["cmd", "shift"], key: "o" } }),
        ),
      });
    });
  return h(
    List,
    { filtering: false, searchBarPlaceholder: "Eser, müellif ya da raf no. — iki alan için: Müellif / Eser", onSearchTextChange: setText },
    h(List.EmptyView, {
      icon: Icon.Globe,
      title: "Qalamos'ta arayın",
      description: "Arama tarayıcınızda açılır; Yazma Eser Arama Yardımcısı eklentisi varyantlarla aramayı orada başlatır. Örn. Gazzâlî / Mişkâtü'l-envâr",
    }),
    h(List.Section, { title: r.recall ? `Son arama: ${r.recall.q}` : undefined }, ...rows),
    r.others.length ? h(List.Section, { title: "Önceki aramalar" }, ...historyItems(r.others, r.pick, r.clear)) : null,
  );
}

module.exports = { default: Command };
