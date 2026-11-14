import { KitBoot } from "@/components/marketing/kit-boot";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";

const HOME_BY_ROLE = { driver: "/dashboard", employer: "/employer", admin: "/admin" } as const;

const PALETTE = `
@font-face {
  font-family: "Schibsted Grotesk";
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url("/assets/fonts/schibsted-grotesk.woff2") format("woff2");
}
@font-face {
  font-family: "JetBrains Mono";
  font-style: normal;
  font-weight: 400 500;
  font-display: swap;
  src: url("/assets/fonts/jetbrains-mono.woff2") format("woff2");
}
:root {
  --p-bg: #f6f5f1; --p-surface: #e8e9e6; --p-ink: #0a1a2a; --p-muted: #5a6570;
  --p-accent: #e8a33d; --p-accent-ink: #111111; --p-action: #0a1a2a; --p-action-ink: #f6f5f1;
  --p-inv-bg: #0a1a2a; --p-inv-surface: #182736; --p-inv-ink: #f6f5f1; --p-inv-muted: #939aa0;
  --p-inv-accent: #e8a33d; --p-inv-accent-ink: #111111; --p-inv-action: #e8a33d; --p-inv-action-ink: #111111;
  --font-display: "Schibsted Grotesk", system-ui, sans-serif;
  --font-text: "Schibsted Grotesk", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --display-weight: 400;
  --display-tracking: -0.035em;
  --display-tracking-xl: -0.042em;
  --ly-scale: 0.98;
}
`;

const PAGE_CSS = `
/* The hero's stage: the dealt mesh sits under the window, with the page
   surface as its ground so the UI never waits for the canvas. */
.hero--collage .hero__art { left: 0 !important; right: auto; }
.hero__art { background: var(--p-surface); }
.hero__art > .ly-piece--note { left: var(--s-6); bottom: var(--s-6); width: 300px; z-index: 2; }
.ly-piece--main .d-row { grid-template-columns: 36px minmax(0, 1fr) 96px; }
.ly-piece--main .d-main { padding-right: var(--ly-cut-room); }
@media (max-width: 639px) { .ly-piece--main .d-row { grid-template-columns: 36px minmax(0, 1fr) 84px; } }

/* compact product panels on the three condition cards */
.mini { margin: 20px; padding: 18px; background: #fff; border: 1px solid rgb(10 26 42 / .1); border-radius: 12px; box-shadow: 0 14px 30px -24px rgb(10 26 42 / .5); font: 400 13px/1.4 var(--font-text); color: #14202c; }
.mini__head { display: flex; justify-content: space-between; gap: 8px; margin: 0 0 10px; font: 500 13px/1.3 var(--font-text); }
.mini__head span { font-weight: 400; font-size: 11px; color: #5c6874; text-transform: uppercase; letter-spacing: .06em; }
.mini__rows { list-style: none; margin: 0; padding: 0; }
.mini__rows li { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-top: 1px solid rgb(10 26 42 / .08); }
.mini__rows li:first-child { border-top: 0; }
.mini__rows span { color: #5c6874; }
.mini__rows b { font-weight: 500; text-align: right; }
.mini__rows .is-missing b { color: #8a5300; }
.mini__rows .is-checked b { color: #17673f; }
.mini__foot { margin: 10px 0 0; padding-top: 8px; border-top: 1px solid rgb(10 26 42 / .08); font-size: 11px; color: #5c6874; }
.level-chip.level-chip--live { background: #eef1ef; color: #3d4a56; }
.d-win__rows .d-win__row:first-child { background: rgb(10 26 42 / .04); box-shadow: inset 3px 0 0 var(--p-accent); }
.demo-tag { font-size: 11px; padding: 5px 8px; }

.d-side .d-side__label { color: #5c6874; }

/* the honest label on every illustrative dataset */
.demo-tag {
  position: absolute; top: 10px; left: 10px; z-index: 6; margin: 0;
  padding: 4px 7px; border-radius: 3px; background: var(--p-accent); color: #111111;
  font: 600 10px/1.2 var(--font-text); letter-spacing: .08em; text-transform: uppercase;
}
.demo-frame { position: relative; }
.record-shell { position: relative; margin-top: var(--s-5); }
.record-counts { display: flex; flex-wrap: wrap; gap: 8px 28px; margin: 0 0 16px; font-size: var(--t-small); color: var(--muted); }
.record-counts b { color: var(--ink); font-weight: 500; }
.record-shell .app.ui { margin-top: 0; }
@media (min-width: 1024px) { .record-shell .app.ui { max-height: 460px; } }
.record-shell .demo-tag { position: static; display: inline-block; margin: 0 0 12px; }

/* hero window internals, built from the product's own list */
.d-win { --u-bg: #ffffff; }
.d-win__row { display: grid; grid-template-columns: minmax(0, 1fr) 96px; gap: 12px; align-items: center; padding: 11px 0; border-top: 1px solid rgb(10 26 42 / .07); }
.d-win__row:first-child { border-top: 0; }
.d-win__row b { display: block; font-weight: 500; font-size: 13px; color: #14202c; }
.d-win__row small { display: block; font-size: 12px; color: #5c6874; }
.d-chip { justify-self: end; font-size: 12px; padding: 3px 8px; border-radius: 999px; background: #eef1ef; color: #3d4a56; white-space: nowrap; }
.d-chip--ok { background: #e5f1ea; color: #17673f; }
.d-chip--warn { background: #fdf0dc; color: #8a5300; }
.d-note__line { display: flex; align-items: center; gap: 10px; padding: 7px 0; font-size: 13px; color: #3d4247; border-top: 1px solid rgb(0 0 0 / .06); }
.d-note__line:first-of-type { border-top: 0; }
.d-note__line i { width: 18px; height: 18px; border-radius: 50%; flex: none; display: grid; place-items: center; background: #e7f4ec; color: #17673f; font-style: normal; font-size: 13px; font-weight: 700; }
.d-note__line i.warn { background: #fdf0dc; color: #8a5300; }
.d-note__line b { font-weight: 500; color: #16181a; }

/* the product window, the app-frame recipe of sections-library.md */
.app.ui { display: grid; overflow: hidden; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); margin-top: var(--s-7); background: var(--u-bg); border: 1px solid var(--u-border); border-radius: var(--u-r); box-shadow: var(--u-shadow); }
.app > .app__pane { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
.app > .app__pane + .app__pane { border-left: 1px solid var(--u-line); }
.app > .app__pane > .ui-panel { width: 100%; border: 0; border-radius: 0; box-shadow: none; }
.app > .app__pane::after { content: ""; position: absolute; inset: auto 0 0 0; height: 64px; background: linear-gradient(transparent, var(--u-bg)); pointer-events: none; }
.app > .app__pane--list .d-win__rows { padding-bottom: 24px; }
@media (min-width: 1024px) and (max-width: 1279px) { .app.ui { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); } }
@media (max-width: 1023px) {
  .app.ui { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
  .app > .app__pane--list { max-height: 252px; }
  .app > .app__pane--list::after { display: none; }
  .app .ui-win__side { display: none; }
  .app .ui-win__body { grid-template-columns: minmax(0, 1fr); }
  .app > .app__pane + .app__pane { border-left: 0; border-top: 1px solid var(--u-line); }
}
@media (max-width: 639px) {
  .app.ui { grid-template-rows: minmax(0, 1fr); }
  .app > .app__pane--list { display: none; }
  .app > .app__pane + .app__pane { border-top: 0; }
}

/* the record pane: the client's own screen, in the kit's UI tokens */
.rec { padding: 24px 28px; }
.rec__head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.rec__head h4 { font: 500 16px/1.3 var(--font-text); margin: 0; color: var(--u-ink); }
.rec__meta { font-size: 12px; color: var(--u-muted); }
.rec__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 32px; margin-top: 16px; }
.rec__row { display: flex; justify-content: space-between; gap: 16px; padding: 9px 0; border-top: 1px solid var(--u-line); font-size: 13px; }
.rec__row dt { color: var(--u-muted); }
.rec__row dd { margin: 0; font-weight: 500; color: var(--u-ink); text-align: right; }
.rec__row--missing dd { color: #8a5300; }
.rec__note { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--u-line); font-size: 12px; line-height: 1.5; color: var(--u-muted); }
@media (max-width: 639px) { .rec { padding: 20px; } .rec__grid { grid-template-columns: minmax(0, 1fr); } }

/* feature cards */
#know .panel { --p-h: 300px; }
#know .stage > .at-rise { --ax: 24px; --ay: 40px; }
#know .demo-tag { top: 8px; left: 8px; }
@media (max-width: 639px) { #know .panel { --p-h: 190px; } #know .stage > .at-rise { --ay-sm: 24px; } }

/* skills passport */
.passport-grid, .direct-grid, .voices-grid { row-gap: var(--s-7); }
.levels { list-style: none; margin: var(--s-5) 0 var(--s-4); padding: 0; display: grid; gap: var(--s-4); }
.levels li { display: grid; grid-template-columns: 32px minmax(0, 1fr); gap: 12px; align-items: start; }
.levels__num { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--line-strong); display: grid; place-items: center; font: 500 13px/1 var(--font-mono); color: var(--muted); }
.levels h3 { font-size: var(--t-card); margin: 0 0 4px; font-weight: 500; }
.levels p { margin: 0; font-size: var(--t-body); color: var(--ink); }
.passport, .privacy-card { position: relative; background: #fff; border: 1px solid rgb(10 26 42 / .12); border-radius: var(--r-lg); padding: 28px; box-shadow: 0 18px 40px -30px rgb(10 26 42 / .5); }
.passport__head, .privacy-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.passport__title { margin: 0; font: 500 18px/1.3 var(--font-text); color: var(--ink); }
.passport__meta { margin: 4px 0 18px; font-size: 13px; color: var(--muted); }
.passport__rows { margin: 0; }
.passport__rows > div { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-top: 1px solid rgb(10 26 42 / .09); font-size: var(--t-body); }
.passport__rows dt { color: var(--muted); }
.passport__rows dd { margin: 0; font-weight: 500; color: var(--ink); text-align: right; }
.passport__levels { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; padding-top: 16px; border-top: 1px solid rgb(10 26 42 / .09); }
.level-chip { font-size: 12px; padding: 4px 9px; border-radius: 999px; background: #e5f1ea; color: #17673f; }
.level-chip--planned { background: #eef1ef; color: #5c6874; }

/* direct contact */
.direct-points { list-style: none; margin: var(--s-5) 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-4); }
.direct-points h3 { font-size: var(--t-card); margin: 0 0 6px; font-weight: 500; }
.direct-points p { margin: 0; font-size: var(--t-body); }
.privacy-rows { list-style: none; margin: 16px 0 18px; padding: 0; }
.privacy-rows li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-top: 1px solid rgb(10 26 42 / .09); font-size: var(--t-body); color: var(--muted); }
.privacy-rows b { color: var(--ink); font-weight: 500; }

/* verification */
.verify { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-6); margin-top: var(--s-7); }
.verify__step { border-top: 1px solid var(--line); padding-top: var(--s-4); }
.verify__num { font: 500 var(--t-label)/1 var(--font-mono); color: var(--muted); }
.verify__step h3 { margin: var(--s-3) 0 var(--s-2); }
.verify__step p { margin: 0; }
.verify__log { margin: var(--s-7) 0 0; border-top: 1px solid var(--line); }
.verify__log > div { display: flex; justify-content: space-between; gap: var(--s-4); padding: 14px 0; border-bottom: 1px solid var(--line); }
.verify__log dt { color: var(--ink); font-size: var(--t-body); }
.verify__log dd { margin: 0; color: var(--muted); font-size: var(--t-small); font-variant-numeric: tabular-nums; }

/* driver voices */
.voices-rules { list-style: none; margin: var(--s-5) 0 0; padding: 0; display: grid; gap: 8px; }
.voices-rules li { position: relative; padding-left: 18px; font-size: var(--t-body); }
.voices-rules li::before { content: ""; position: absolute; left: 0; top: .55em; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
.voice-card { background: #fff; border: 1px solid rgb(10 26 42 / .12); border-radius: var(--r-lg); padding: 24px; }
.voice-card + .voice-card { margin-top: 16px; }
.voice-card--planned { background: transparent; border-style: dashed; }
.voice-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.voice-card__head h3 { margin: 0; font-size: var(--t-card); font-weight: 500; }
.voice-card__head .d-chip { justify-self: auto; }
.voice-card__empty { margin: 18px 0 8px; font-size: 22px; font-weight: 500; color: var(--ink); }
.voice-card__copy { margin: 0 0 10px; font-size: var(--t-body); color: var(--ink); }

/* employers */
.employer-grid { margin-top: var(--s-6); row-gap: var(--s-5); }
.employer-grid h3 { font-size: var(--t-card); margin: 0 0 6px; font-weight: 500; }
.employer-grid p { margin: 0; font-size: var(--t-body); }
.employer-promise { margin-top: var(--s-6); padding: 24px 28px; background: var(--p-surface); border-radius: var(--r-lg); }
.employer-promise p { margin: 0 0 8px; font-size: var(--t-body); }
.employer-promise .btn-row { margin-top: 16px; }

/* close */
footer.footer--dark .btn--primary { background: var(--p-action); color: var(--p-action-ink); border-color: transparent; }
footer.footer--dark .btn--primary:hover { background: color-mix(in oklab, var(--p-action) 88%, white); }

/* short desktops (1366x768 and similar): two screens where the content needs it,
   and a compact pass on the sections that only just overflow */
@media (min-width: 1024px) and (max-height: 860px) {
  #record { --h: 2 !important; }
  #questions { --h: 2 !important; }
  .record-shell .app.ui { max-height: 700px; }
  #know .panel { --p-h: 220px; }
  #know .section-head { margin-bottom: var(--s-5); }
  .verify { margin-top: var(--s-5); }
  #verification .section-head p { display: none; }
  .verify__log { margin-top: var(--s-5); }
  .verify__log > div { padding: 10px 0; }
}
@media (min-width: 1024px) and (max-width: 1180px) and (max-height: 860px) {
  #know { --h: 2 !important; }
}
@media (max-width: 1023px) {
  .direct-points { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 767px) {
  .verify { grid-template-columns: minmax(0, 1fr); gap: var(--s-5); }
  .verify__log > div { flex-direction: column; gap: 2px; }
}
.focus\\:outline-none:focus, .focus\\:outline-none:focus-visible { outline: 2px solid var(--action); outline-offset: 3px; }
:where(a, button, summary, input, textarea, select, [tabindex]):focus-visible { outline: 2px solid var(--action); outline-offset: 3px; }
`;


const SITE_CSS = `
/* the public site follows the homepage's palette in both themes */
html { color-scheme: light; }
html.dark { color-scheme: dark; }

html.dark {
  --p-bg: #0a1420; --p-surface: #101d2b; --p-ink: #e9f0f7; --p-muted: #93a6ba;
  --p-action: #e8a33d; --p-action-ink: #0a1420;
  --p-inv-bg: #050c14; --p-inv-surface: #0d1a26; --p-inv-ink: #eef3f8; --p-inv-muted: #8ea0b3;
}

.site-page { width: min(100% - 2 * var(--gut), var(--container)); margin-inline: auto; padding-inline: 0; }

/* every public page inherits the marketing type and ground */
.site-main { background: var(--p-bg); color: var(--p-ink); font-family: var(--font-text); padding-bottom: var(--bar, 0px); }
.site-main h1 {
  font-family: var(--font-display); font-weight: var(--display-weight);
  letter-spacing: var(--display-tracking-xl); line-height: 1.02;
  font-size: clamp(2.3rem, 4.4vw, 3.6rem);
}
.site-main h2 { letter-spacing: var(--display-tracking); }
.site-main .text-3xl, .site-main .sm\:text-4xl { font-size: clamp(2.3rem, 4.4vw, 3.6rem); line-height: 1.02; }

@media (max-width: 1023px) {
  :root:has(> body > nav.actionbar) header.nav:not(.is-open) .nav__actions { display: flex; }
  :root:has(> body > nav.actionbar) header.nav:not(.is-open) .nav__actions > :not(.nav__theme) { display: none; }
  :root:has(> body > nav.actionbar) header.nav:not(.is-open) .nav__actions > .nav__theme { display: inline-flex; }
}
/* the theme control sits in the marketing bar */
.nav__theme { color: var(--p-ink); height: 36px; width: 36px; }
.nav__theme:hover { background: color-mix(in oklab, var(--p-ink) 8%, transparent); }
@media (max-width: 1023px) { .nav__theme { width: 44px; height: 44px; } }

/* dark surfaces for the pieces that are drawn white */
html.dark .mini { background: #141c24; color: #e8edf2; border-color: rgb(255 255 255 / .1); box-shadow: none; }
html.dark .mini__head span, html.dark .mini__rows span, html.dark .mini__foot { color: #9aa7b4; }
html.dark .mini__rows li, html.dark .mini__foot { border-color: rgb(255 255 255 / .09); }
html.dark .mini__rows .is-missing b { color: #f0b256; }
html.dark .mini__rows .is-checked b { color: #63d3ab; }
html.dark .level-chip.level-chip--live { background: #1d2833; color: #c3ced8; }
html.dark .level-chip--planned { background: #1a242e; color: #9aa7b4; }
html.dark .passport, html.dark .privacy-card, html.dark .voice-card { background: #141c24; border-color: rgb(255 255 255 / .12); box-shadow: none; }
html.dark .passport__rows > div, html.dark .privacy-rows li, html.dark .passport__levels { border-color: rgb(255 255 255 / .09); }
html.dark .passport__rows dd, html.dark .privacy-rows b { color: #e9f0f7; }
html.dark .d-win { --u-bg: #141c24; }
html.dark .d-win__row { border-color: rgb(255 255 255 / .08); }
html.dark .d-win__row b { color: #e8edf2; }
html.dark .d-win__row small { color: #9aa7b4; }
html.dark .d-chip { background: #1d2833; color: #c3ced8; }
html.dark .d-chip--ok { background: #12352b; color: #5fd0a8; }
html.dark .d-chip--warn { background: #3a2a10; color: #f0c27a; }
html.dark .d-win__rows .d-win__row:first-child { background: rgb(255 255 255 / .05); }
html.dark .d-win, html.dark .ui, html.dark .app.ui, html.dark .ui-panel {
  --u-bg: #141c24; --u-ink: #e9f0f7; --u-muted: #9aa7b4; --u-soft: #8b98a5;
  --u-line: rgb(255 255 255 / .09); --u-line-2: rgb(255 255 255 / .16);
  --u-fill: #1a242e; --u-fill-2: #202b37; --u-border: rgb(255 255 255 / .12);
  --u-shadow: 0 24px 60px -30px rgb(0 0 0 / .7);
}
html.dark .d-win, html.dark .ly-piece--main { background: #141c24; }
html.dark .d-win__bar, html.dark .ui-win__bar { background: #1a242e; border-color: rgb(255 255 255 / .09); }
html.dark .d-card { background: #141c24; color: #e8edf2; border: 1px solid rgb(255 255 255 / .1); box-shadow: none; }
html.dark .d-card h5 { color: #e9f0f7; }
html.dark .d-card p { color: #9aa7b4; }
html.dark .d-side .d-side__label { color: #b8c2cc; }
html.dark .d-side span { color: #b8c2cc; }
[data-ly-steps] [data-step].is-off { visibility: hidden; }
html.dark .d-note__line { color: #c3ced8; border-color: rgb(255 255 255 / .08); }
html.dark .d-note__line b { color: #e9f0f7; }
html.dark .d-note__line i { background: #12352b; color: #5fd0a8; }
html.dark .d-note__line i.warn { background: #3a2a10; color: #f0c27a; }
html.dark .menu-card__panel { background: #141c24; }
`;

export async function MarketingShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <>
      <link rel="stylesheet" href="/assets/system.css" />
      <link rel="stylesheet" href="/assets/ui/cards.css" />
      <link rel="stylesheet" href="/assets/motion/motion.css" />
      <link rel="stylesheet" href="/assets/backgrounds/backgrounds.css" />
      <link rel="stylesheet" href="/assets/layout/layout.css" />
      <link rel="stylesheet" href="/assets/layout/demo.css" />
      <link rel="stylesheet" href="/assets/icons/icon.css" />
      <link rel="stylesheet" href="/assets/ui/base.css" />
      <link rel="stylesheet" href="/assets/ui/window/fragment.css" />
      <link rel="stylesheet" href="/assets/moments/iris-opens/moment.css" />
      <style dangerouslySetInnerHTML={{ __html: PALETTE + PAGE_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: SITE_CSS }} />
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700);" +
            "document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500);",
        }}
      />

      <header className="nav">
        <div className="wrap nav__bar">
          <a className="skip-link" href="/">
            Skip to content
          </a>
          <a className="nav__logo" href="/">
            <span className="mark" data-mark="ring" aria-hidden="true" />
            DriverCompass
          </a>
          <nav className="nav__links" aria-label="Main">
            <div className="nav__item">
              <a className="nav__link" href="/jobs">
                Find work
                <svg className="chev" viewBox="0 0 12 12" aria-hidden="true">
                  <path
                    d="M3 4.5l3 3 3-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <div className="nav__menu">
                <div className="wrap grid">
                  <div className="menu-col span-3">
                    <p className="t-label">The vacancy</p>
                    <a href="/#record">
                      The template<span>One fixed order</span>
                    </a>
                    <a href="/#know">
                      Promise versus reality<span>What the advert leaves out</span>
                    </a>
                    <a href="/#verification">
                      Verification<span>Three separate records</span>
                    </a>
                  </div>
                  <div className="menu-col span-3">
                    <p className="t-label">The driver</p>
                    <a href="/#passport">
                      Driver profile<span>Licences, ADR, experience</span>
                    </a>
                    <a href="/#direct">
                      Privacy and contact<span>Private by default</span>
                    </a>
                    <a href="/#voices">
                      Driver reviews<span>Planned, not open</span>
                    </a>
                  </div>
                  <a className="menu-card span-3 start-10" href="/#record">
                    <div className="panel menu-card__panel">
                      <div className="menu-mini" aria-hidden="true">
                        <span>
                          <b>Template</b>
                          <em>fixed</em>
                        </span>
                        <span>
                          <b>Missing answers</b>
                          <em>marked</em>
                        </span>
                        <span>
                          <b>Conditions</b>
                          <em>dated</em>
                        </span>
                      </div>
                    </div>
                    <span className="t-card">One template, every vacancy</span>
                    <span className="t-small muted">Missing information stays visible</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="nav__item">
              <a className="nav__link" href="/companies">
                Employers
              </a>
            </div>
            <div className="nav__item">
              <a className="nav__link" href="/#voices">
                Reviews
              </a>
            </div>
            <div className="nav__item">
              <a className="nav__link" href="/how-verification-works">
                Verification
              </a>
            </div>
            <div className="nav__item">
              <a className="nav__link" href="/for-employers">
                For employers
              </a>
            </div>
          </nav>
          <div className="nav__actions">
            <ThemeToggle className="nav__theme" />
            {user ? (
              <a className="btn btn--primary" href={HOME_BY_ROLE[user.role]}>
                {user.role === "driver" ? "My dashboard" : user.role === "employer" ? "Employer workspace" : "Admin"}
              </a>
            ) : (
              <>
                <a className="nav__link" href="/login">
                  Log in
                </a>
                <a className="btn btn--primary" href="/register?role=driver">
                  Create a profile
                </a>
              </>
            )}
          </div>
          <button className="nav__toggle" type="button" aria-expanded="false" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M2 5h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {children}

      <footer className="footer closing footer--dark ground-inverse" id="contact" aria-labelledby="close-h">
        <div className="wrap">
          <div className="closing__cta close--type">
            <div className="section-head">
              <h2 id="close-h">Create a profile</h2>
              <p>Free for drivers. Private by default, no documents required, and no employer can browse the profile.</p>
            </div>
            <a className="btn btn--primary btn--xl btn--wide" href="/register?role=driver">
              Create a profile
              <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
                <path className="m-arrow__stem" d="M1 6h8" />
                <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
              </svg>
            </a>
          </div>
          <div className="closing__links">
            <div className="grid">
              <div className="span-4 stack-4">
                <a className="nav__logo" href="/">
                  <span className="mark" data-mark="ring" aria-hidden="true" />
                  DriverCompass
                </a>
                <p className="footer__lede">Truck driving jobs with the conditions written down.</p>
              </div>
              <div className="span-2 footer__col">
                <h3>Drivers</h3>
                <ul>
                  <li>
                    <a href="/jobs">Find work</a>
                  </li>
                  <li>
                    <a href="/#record">The record</a>
                  </li>
                  <li>
                    <a href="/register?role=driver">Create a profile</a>
                  </li>
                </ul>
              </div>
              <div className="span-2 footer__col">
                <h3>Employers</h3>
                <ul>
                  <li>
                    <a href="/companies">Company profiles</a>
                  </li>
                  <li>
                    <a href="/for-employers">Post a vacancy</a>
                  </li>
                  <li>
                    <a href="/#verification">Verification</a>
                  </li>
                </ul>
              </div>
              <div className="span-2 footer__col">
                <h3>Product</h3>
                <ul>
                  <li>
                    <a href="/how-verification-works">How verification works</a>
                  </li>
                  <li>
                    <a href="/review-policy">Review policy</a>
                  </li>
                  <li>
                    <a href="/#questions">Questions</a>
                  </li>
                </ul>
              </div>
              <div className="span-2 footer__col">
                <h3>Legal</h3>
                <ul>
                  <li>
                    <a href="/privacy">Privacy</a>
                  </li>
                  <li>
                    <a href="/terms">Terms</a>
                  </li>
                  <li>
                    <a href="/contact">Contact</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer__legal">
              <span>&copy; 2026 DriverCompass</span>
            </div>
          </div>
        </div>
      </footer>

      <nav className="actionbar" aria-label="Quick actions">
        <a className="btn btn--primary" href="/register?role=driver">
          Create a profile
        </a>
      </nav>

      <KitBoot />
    </>
  );
}
