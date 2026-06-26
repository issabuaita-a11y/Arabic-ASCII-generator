import { useEffect } from "react";
import { initializeArabicAsciiApp } from "./lib/asciiApp.js";

const defaultFill = "01IM:;/\\.,{}[]";

function ExportIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 19h14" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 19V5" />
      <path d="m7 10 5-5 5 5" />
      <path d="M5 19h14" />
    </svg>
  );
}

function OutputPanel() {
  return (
    <section className="output-panel" aria-label="معاينة فن الأسكي">
      <div className="toolbar toolbar--export-only">
        <div className="export-menu" id="exportMenu">
          <button className="export-toggle" id="exportToggle" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="exportOptions">
            <ExportIcon />
            <span>تصدير</span>
          </button>
          <div className="export-options" id="exportOptions" role="menu" aria-label="خيارات التصدير">
            <button id="downloadPng" type="button" role="menuitem">PNG</button>
            <button id="downloadGif" type="button" role="menuitem" disabled>GIF</button>
          </div>
        </div>
      </div>

      <div className="preview-frame" id="previewFrame">
        <canvas id="artCanvas" aria-label="معاينة فن الأسكي الناتج" />
        <canvas id="drawingCanvas" className="drawing-canvas is-hidden" width="1800" height="980" aria-label="لوحة الرسم" />
        <div className="drawing-stage-actions is-hidden" id="drawingStageActions">
          <button id="drawingResultToggle" type="button">عرض النتيجة</button>
          <button id="collapseDrawing" type="button">رجوع</button>
        </div>
        <pre id="textOutput" className="is-hidden" dir="ltr" aria-label="النص القابل للنسخ" />
      </div>

      <footer className="credit-line" dir="ltr">© 2026 Issa Abu Aita · Amman, Jordan</footer>
    </section>
  );
}

function SourceSection() {
  return (
    <section className="panel-section">
      <h2>مصدر الرسم</h2>

      <div className="choice-grid source-mode-grid is-hidden" id="sourceModeButtons" aria-label="مصدر الرسم">
        <button className="source-mode-button is-active" type="button" data-source-mode="text">نص</button>
        <button className="source-mode-button" type="button" data-source-mode="image" hidden>صورة</button>
        <button className="source-mode-button" type="button" data-source-mode="drawing" hidden>رسم</button>
      </div>

      <label className="field text-source-field">
        <textarea id="sourceText" dir="rtl" rows="2" spellCheck="false" defaultValue="حب" />
      </label>

      <div className="image-source-panel is-hidden" id="imageSourcePanel">
        <button className="icon-action source-upload-action" id="imageUploadTrigger" type="button">
          <UploadIcon />
          <span>رفع صورة</span>
        </button>
        <input id="imageUpload" type="file" accept="image/*" />
        <div className="source-info" id="imageInfo">ارفع صورة وسيتم قص الخلفية تلقائياً</div>
      </div>

      <div className="drawing-source-panel is-hidden" id="drawingSourcePanel">
        <div className="drawing-actions">
          <label className="drawing-brush-field">
            <span>حجم الفرشاة</span>
            <input id="drawingBrush" type="range" min="6" max="48" step="1" defaultValue="18" />
          </label>
          <button className="icon-action drawing-clear-action" id="clearDrawing" type="button">مسح</button>
          <button className="icon-action drawing-expand-action" id="expandDrawing" type="button">تكبير اللوحة</button>
        </div>
      </div>
    </section>
  );
}

function SymbolsSection() {
  return (
    <section className="panel-section">
      <h2>الرموز</h2>

      <label className="field">
        <span>رموز التعبئة</span>
        <select id="fillPreset" defaultValue={defaultFill}>
          <option value={defaultFill}>كود / كلاسيكي</option>
          <option value="0123456789">أرقام</option>
          <option value=".-:=+*#%@">درجات كثافة</option>
          <option value={"[]{}()/\\<>"}>هندسي</option>
          <option value=".,:;">نقاط وفواصل</option>
          <option value="ABCDEFGHIJKLMNOPQRSTUVWXYZ">حروف لاتينية</option>
          <option value="custom">أخرى</option>
        </select>
      </label>

      <label className="field custom-fill-field" aria-label="رموز تعبئة مخصصة">
        <input id="fillText" dir="ltr" type="text" defaultValue={defaultFill} spellCheck="false" />
      </label>

      <div className="mode-block" aria-label="شكل التعبئة">
        <button className="mode-button is-active" type="button" data-mode="code">رموز كود</button>
        <button className="mode-button" type="button" data-mode="shade">تدرج ASCII</button>
        <button className="mode-button" type="button" data-mode="solid">كتلة</button>
      </div>
    </section>
  );
}

function FontSection() {
  return (
    <section className="panel-section">
      <h2>الخطوط</h2>

      <div className="font-source-list" id="fontSourceButtons" aria-label="مصدر الخطوط">
        <button className="switch-row is-active" type="button" data-font-source="basic" role="switch" aria-checked="true">
          <span className="switch-label">خطوط أساسية</span>
          <span className="switch-control" aria-hidden="true" />
        </button>
        <button className="switch-row" type="button" data-font-source="local" role="switch" aria-checked="false">
          <span className="switch-label">
            خطوط الجهاز
            <span className="help-dot" aria-hidden="true">؟</span>
          </span>
          <span className="switch-control" aria-hidden="true" />
        </button>
      </div>

      <label className="field">
        <span className="select-shell">
          <select id="fontSelect" defaultValue="Geeza Pro">
            <option value="Geeza Pro">Geeza Pro</option>
            <option value="Aref Ruqaa">Aref Ruqaa</option>
            <option value="Noto Sans Arabic">Noto Sans Arabic</option>
            <option value="Noto Naskh Arabic">Noto Naskh Arabic</option>
            <option value="Amiri">Amiri</option>
            <option value="Scheherazade New">Scheherazade New</option>
            <option value="Dubai">Dubai</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Arial">Arial</option>
          </select>
        </span>
      </label>

      <label className="field">
        <span className="select-shell">
          <select id="fontWeight" defaultValue="400">
            <option value="400">Regular</option>
            <option value="600">Semi Bold</option>
            <option value="800">Bold</option>
          </select>
        </span>
      </label>
    </section>
  );
}

function ColorSection() {
  return (
    <section className="panel-section">
      <h2>اللون والسماكة</h2>

      <div className="color-ink-row">
        <label className="color-field">
          <span>لون الرسم</span>
          <input id="artColor" type="color" defaultValue="#111111" />
        </label>

        <label className="range-field ink-range-field">
          <span>قوة الحبر <b id="inkValue">3</b></span>
          <input id="inkRange" type="range" min="1" max="5" defaultValue="3" step="1" />
        </label>
      </div>
    </section>
  );
}

function SizeSection() {
  return (
    <section className="panel-section">
      <h2>المقاسات</h2>

      <label className="range-field">
        <span>حجم الشكل <b id="sizeValue">360</b></span>
        <input id="sizeRange" type="range" min="160" max="620" defaultValue="360" step="10" />
      </label>

      <label className="range-field">
        <span>دقة الرموز <b id="detailValue">104</b></span>
        <input id="detailRange" type="range" min="48" max="170" defaultValue="104" step="2" />
      </label>

      <label className="range-field">
        <span>حساسية الحواف <b id="thresholdValue">18</b></span>
        <input id="thresholdRange" type="range" min="4" max="54" defaultValue="18" step="1" />
      </label>
    </section>
  );
}

function MotionSection() {
  return (
    <section className="panel-section">
      <h2>الحركة والشكل</h2>

      <label className="field">
        <span>الحركة</span>
        <select id="animationSelect" defaultValue="none">
          <option value="none">ثابت</option>
          <option value="scan">مسح ضوئي</option>
          <option value="flicker">وميض رموز</option>
          <option value="wave">موجة</option>
          <option value="reveal">ظهور تدريجي</option>
          <option value="orbit">مدار خفيف</option>
          <option value="glitch">خلل رقمي</option>
          <option value="rain">مطر رموز</option>
          <option value="type">كتابة سريعة</option>
          <option value="breathe">نبض هادئ</option>
          <option value="jitter">اهتزاز خفيف</option>
        </select>
      </label>

      <label className="field">
        <span>تكوين الرسم</span>
        <select id="compositionSelect" defaultValue="normal">
          <option value="normal">عادي</option>
          <option value="arc">قوس</option>
          <option value="circle">دائري</option>
        </select>
      </label>

      <label className="toggle-field">
        <input id="gridToggle" type="checkbox" />
        <span>إظهار الشبكة في المعاينة</span>
      </label>
    </section>
  );
}

function ControlPanel() {
  return (
    <aside className="control-panel" aria-label="إعدادات التوليد">
      <div className="panel-title">
        <h1>مولد الأسكي العربي</h1>
        <span>فن ASCII</span>
      </div>

      <SourceSection />
      <SymbolsSection />
      <FontSection />
      <ColorSection />
      <SizeSection />
      <MotionSection />

      <input id="exportBackground" type="checkbox" hidden />
      <select id="exportScale" hidden defaultValue="4">
        <option value="2">2×</option>
        <option value="4">4× للطباعة</option>
        <option value="6">6× كبير</option>
      </select>
    </aside>
  );
}

export default function App() {
  useEffect(() => {
    const app = initializeArabicAsciiApp();
    return () => app.destroy();
  }, []);

  return (
    <main className="app-shell">
      <OutputPanel />
      <ControlPanel />
      <canvas id="maskCanvas" hidden />
    </main>
  );
}
