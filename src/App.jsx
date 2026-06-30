import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  Braces,
  CaseSensitive,
  ChevronUp,
  Dice5,
  Download,
  FileCode2,
  FileImage,
  FileText,
  Film,
  Grid3X3,
  Minus,
  Palette,
  PanelRight,
  Plus,
  Ruler,
  Type,
  Upload,
  Wand2,
} from "lucide-react";
import { initializeArabicAsciiApp } from "./lib/asciiApp.js";

const defaultFill = "01IM:;/\\.,{}[]";

function UploadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 19V5" />
      <path d="m7 10 5-5 5 5" />
      <path d="M5 19h14" />
    </svg>
  );
}

function DiceIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8.5 8.5h.01" />
      <path d="M15.5 8.5h.01" />
      <path d="M12 12h.01" />
      <path d="M8.5 15.5h.01" />
      <path d="M15.5 15.5h.01" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

function PngIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="3" />
      <path d="m7 16 4-4 3 3 2-2 2 3" />
      <path d="M8 9h.01" />
    </svg>
  );
}

function SvgIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M4 12h3M17 12h3M12 4v3M12 17v3" />
      <path d="M6 6 4 4M18 18l2 2M18 6l2-2M6 18l-2 2" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </svg>
  );
}

function HtmlIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m8 9-4 3 4 3" />
      <path d="m16 9 4 3-4 3" />
      <path d="m13 7-2 10" />
    </svg>
  );
}

function GifIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9v6M8 9h3M8 12h2" />
      <path d="M13 9v6" />
      <path d="M16 15V9h3M16 12h2" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 12h12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 6v12" />
      <path d="M6 12h12" />
    </svg>
  );
}

function ArtboardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 7h.01M12 7h.01M17 7h.01" />
      <path d="M7 12h.01M12 12h.01M17 12h.01" />
      <path d="M7 17h.01M12 17h.01M17 17h.01" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 7h12" />
      <path d="M9 12h9" />
      <path d="M12 17h6" />
    </svg>
  );
}

function SymbolIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8 8h.01M12 8h.01M16 8h.01" />
      <path d="M7 13h10" />
      <path d="M9 17h6" />
    </svg>
  );
}

function FontIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 7V5h14v2" />
      <path d="M12 5v14" />
      <path d="M9 19h6" />
    </svg>
  );
}

function ColorIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 4v16" />
      <path d="M7 8h10" />
      <path d="M6 16h12" />
    </svg>
  );
}

function SizeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 7h10v10H7z" />
      <path d="M4 4h3v3M17 4h3v3M4 17v3h3M20 17v3h-3" />
    </svg>
  );
}

function MotionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h5" />
      <path d="m8 9 3 3-3 3" />
      <path d="M14 7h5M14 12h5M14 17h5" />
    </svg>
  );
}

function OutputPanel() {
  return (
    <section className="output-panel" aria-label="معاينة فن الأسكي" data-i18n-attr="aria-label:outputPanel">
      <div className="canvas-shell" id="canvasShell">
        <div className="canvas-toolbar" aria-label="أدوات اللوحة" data-i18n-attr="aria-label:canvasTools">
          <div className="language-toggle" id="languageToggle" aria-label="اختيار اللغة" data-i18n-attr="aria-label:language">
            <button className="is-active" type="button" data-lang="ar">AR</button>
            <button type="button" data-lang="en">EN</button>
          </div>
        </div>

        <div className="canvas-stage" id="canvasStage">
          <div className="canvas-corner-tools" aria-label="أدوات اللوحة" data-i18n-attr="aria-label:canvasTools">
            <div className="canvas-floating-controls canvas-floating-controls--zoom">
              <button className="canvas-icon-button" id="zoomOut" type="button" aria-label="تصغير" data-i18n-attr="aria-label:zoomOut">
                <Minus aria-hidden="true" />
              </button>
              <output className="zoom-readout" id="zoomReadout">100%</output>
              <button className="canvas-icon-button" id="zoomIn" type="button" aria-label="تكبير" data-i18n-attr="aria-label:zoomIn">
                <Plus aria-hidden="true" />
              </button>
            </div>
            <div className="canvas-floating-controls canvas-floating-controls--size">
              <div className="artboard-menu" id="artboardMenu">
                <button className="artboard-size-button" id="artboardMenuToggle" type="button" aria-expanded="false" aria-haspopup="menu" aria-label="مقاسات اللوحة" data-i18n-attr="aria-label:artboardSizes">
                  <Grid3X3 aria-hidden="true" />
                  <output id="artboardPresetReadout" dir="ltr">16:9</output>
                </button>
                <div className="artboard-options" id="artboardOptions" role="menu" aria-label="مقاسات اللوحة" data-i18n-attr="aria-label:artboardSizes">
                  <button type="button" role="menuitem" data-artboard-preset="square" data-i18n="artboardSquare">مربع 1:1</button>
                  <button type="button" role="menuitem" data-artboard-preset="story" data-i18n="artboardStory">ستوري 9:16</button>
                  <button type="button" role="menuitem" data-artboard-preset="post" data-i18n="artboardPost">بوست 4:5</button>
                  <button type="button" role="menuitem" data-artboard-preset="wide" data-i18n="artboardWide">عرضي 16:9</button>
                  <button type="button" role="menuitem" data-artboard-preset="a4" data-i18n="artboardA4">A4 عمودي</button>
                  <button type="button" role="menuitem" data-artboard-preset="a4Landscape" data-i18n="artboardA4Landscape">A4 عرضي</button>
                </div>
              </div>
            </div>
          </div>
          <div className="canvas-content" id="canvasContent">
            <div className="artboard-stack" id="artboardStack">
              <div className="artboard-slot is-active" data-artboard-id="artboard-1" aria-label="لوحة العمل 1" data-i18n-attr="aria-label:artboardItem">
                <div className="artboard" id="artboard" data-artboard="wide">
                  <div className="preview-frame" id="previewFrame">
                    <canvas id="artCanvas" aria-label="معاينة فن الأسكي الناتج" data-i18n-attr="aria-label:artCanvas" />
                    <canvas id="drawingCanvas" className="drawing-canvas is-hidden" width="1800" height="980" aria-label="لوحة الرسم" data-i18n-attr="aria-label:drawingCanvas" />
                    <div className="drawing-stage-actions is-hidden" id="drawingStageActions">
                      <button id="drawingResultToggle" type="button" data-i18n="showResult">عرض النتيجة</button>
                      <button id="collapseDrawing" type="button" data-i18n="back">رجوع</button>
                    </div>
                    <pre id="textOutput" className="is-hidden" dir="ltr" aria-label="النص القابل للنسخ" data-i18n-attr="aria-label:textOutput" />
                  </div>
                </div>
              </div>
              <button className="add-artboard-button" id="addArtboard" type="button" aria-label="إضافة لوحة عمل" data-i18n-attr="aria-label:addArtboard">
                <Plus aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <footer className="canvas-footer">
          <output className="canvas-readout" id="charReadout" dir="ltr">104 × 58 chars</output>
          <span className="credit-line" dir="ltr">© 2026 Issa Abu Aita · Amman, Jordan</span>
        </footer>
      </div>
    </section>
  );
}

function SourceSection() {
  return (
    <section className="panel-section" data-mobile-panel="source">
      <div className="section-heading-row">
        <h2 data-i18n="source">النص</h2>
        <button className="random-button" id="randomizeText" type="button">
          <Dice5 aria-hidden="true" />
          <span data-i18n="random">عشوائي</span>
        </button>
      </div>

      <div className="choice-grid source-mode-grid is-hidden" id="sourceModeButtons" aria-label="مصدر الرسم" data-i18n-attr="aria-label:source">
        <button className="source-mode-button is-active" type="button" data-source-mode="text" data-i18n="text">نص</button>
        <button className="source-mode-button" type="button" data-source-mode="image" data-i18n="image" hidden>صورة</button>
        <button className="source-mode-button" type="button" data-source-mode="drawing" data-i18n="drawing" hidden>رسم</button>
      </div>

      <label className="field text-source-field">
        <textarea id="sourceText" dir="rtl" rows="2" spellCheck="false" defaultValue="حب" />
      </label>

      <div className="image-source-panel is-hidden" id="imageSourcePanel">
        <button className="icon-action source-upload-action" id="imageUploadTrigger" type="button">
          <Upload aria-hidden="true" />
          <span data-i18n="uploadImage">رفع صورة</span>
        </button>
        <input id="imageUpload" type="file" accept="image/*" />
        <div className="source-info" id="imageInfo" data-i18n="imageInfo">ارفع صورة وسيتم قص الخلفية تلقائياً</div>
      </div>

      <div className="drawing-source-panel is-hidden" id="drawingSourcePanel">
        <div className="drawing-actions">
          <label className="drawing-brush-field">
            <span data-i18n="brushSize">حجم الفرشاة</span>
            <input id="drawingBrush" type="range" min="6" max="48" step="1" defaultValue="18" />
          </label>
          <button className="icon-action drawing-clear-action" id="clearDrawing" type="button" data-i18n="clear">مسح</button>
          <button className="icon-action drawing-expand-action" id="expandDrawing" type="button" data-i18n="expandCanvas">تكبير اللوحة</button>
        </div>
      </div>
    </section>
  );
}

function SymbolsSection() {
  return (
    <section className="panel-section" data-mobile-panel="symbols">
      <h2 data-i18n="symbols">الأسلوب</h2>

      <label className="field hidden-control">
        <span data-i18n="fillSymbols">رموز التعبئة</span>
        <select id="fillPreset" defaultValue={defaultFill}>
          <option value={defaultFill} data-i18n="presetCode">كود / كلاسيكي</option>
          <option value="0123456789" data-i18n="presetNumbers">أرقام</option>
          <option value=".-:=+*#%@" data-i18n="presetDensity">درجات كثافة</option>
          <option value={"[]{}()/\\<>"} data-i18n="presetGeometric">هندسي</option>
          <option value=".,:;" data-i18n="presetPunctuation">نقاط وفواصل</option>
          <option value="ABCDEFGHIJKLMNOPQRSTUVWXYZ" data-i18n="presetLatin">حروف لاتينية</option>
          <option value="custom" data-i18n="presetCustom">أخرى</option>
        </select>
      </label>

      <div className="style-grid" aria-label="شكل التعبئة" data-i18n-attr="aria-label:fillStyle">
        <button className="mode-button style-card is-active" type="button" data-mode="code" data-style="code" data-fill-value={defaultFill}>
          <span className="style-preview" dir="ltr">01IM:;/\.</span>
          <span data-i18n="modeCode">رموز كود</span>
        </button>
        <button className="mode-button style-card" type="button" data-mode="solid" data-style="solid">
          <span className="style-preview" dir="ltr">▓▒░█</span>
          <span data-i18n="modeSolid">كتلة</span>
        </button>
        <button className="mode-button style-card" type="button" data-mode="shade" data-style="shade">
          <span className="style-preview" dir="ltr">.:=+*#@</span>
          <span data-i18n="modeShade">تدرج ASCII</span>
        </button>
        <button className="mode-button style-card" type="button" data-mode="code" data-style="ornament" data-fill-value="◆◇✦✧">
          <span className="style-preview" dir="ltr">◆✦◇</span>
          <span data-i18n="modeOrnament">زخرفة</span>
        </button>
      </div>

      <label className="custom-symbol-row" aria-label="رموز تعبئة مخصصة" data-i18n-attr="aria-label:customFill">
        <span data-i18n="customSymbols">رموز مخصصة</span>
        <input id="fillText" dir="ltr" type="text" defaultValue={defaultFill} spellCheck="false" />
      </label>
    </section>
  );
}

function FontSection() {
  return (
    <section className="panel-section accordion-section" data-mobile-panel="fonts">
      <button className="accordion-header" type="button" aria-expanded="false">
        <h2 data-i18n="fonts">الخطوط</h2>
        <ChevronUp aria-hidden="true" />
      </button>

      <div className="accordion-content">
        <div className="font-source-list" id="fontSourceButtons" aria-label="مصدر الخطوط" data-i18n-attr="aria-label:fontSource">
          <button className="switch-row is-active" type="button" data-font-source="basic" role="switch" aria-checked="true">
            <span className="switch-label" data-i18n="basicFonts">خطوط أساسية</span>
            <span className="switch-control" aria-hidden="true" />
          </button>
          <button className="switch-row" type="button" data-font-source="local" role="switch" aria-checked="false">
            <span className="switch-label">
              <span data-i18n="deviceFonts">خطوط الجهاز</span>
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
      </div>
    </section>
  );
}

function ColorSection() {
  const artSwatches = ["#050505", "#333333", "#666666", "#999999", "#ffffff"];
  const bgSwatches = ["#ffffff", "#f5f5f3", "#e7e7e3", "#cfcfca", "#050505"];

  return (
    <section className="panel-section accordion-section" data-mobile-panel="color">
      <button className="accordion-header" type="button" aria-expanded="false">
        <h2 data-i18n="color">اللون</h2>
        <ChevronUp aria-hidden="true" />
      </button>

      <div className="accordion-content">
        <div className="color-mode-tabs" id="colorModeButtons" aria-label="نمط لون الرموز" data-i18n-attr="aria-label:colorMode">
          <button className="is-active" type="button" data-color-mode="solid" data-i18n="solidColor">لون واحد</button>
          <button type="button" data-color-mode="gradient" data-i18n="gradientColor">تدرج</button>
        </div>

        <div className="color-panel color-panel--solid" id="solidColorPanel">
          <div className="color-swatch-group">
            <span data-i18n="symbolColor">لون الرموز</span>
            <div className="swatch-row">
              {artSwatches.map((color) => (
                <button
                  className={color === "#050505" ? "color-swatch is-active" : "color-swatch"}
                  key={color}
                  type="button"
                  style={{ "--swatch": color }}
                  data-color-target="art"
                  data-color-value={color}
                  aria-label={color}
                />
              ))}
              <label className="color-picker-swatch">
                <input id="artColor" type="color" defaultValue="#050505" aria-label="لون الرموز" data-i18n-attr="aria-label:symbolColor" />
              </label>
            </div>
          </div>
        </div>

        <div className="color-panel color-panel--gradient is-hidden" id="gradientColorPanel">
          <div className="gradient-stop-editor">
            <span data-i18n="symbolColor">لون الرموز</span>
            <div className="gradient-preview" id="gradientPreview">
              <button className="gradient-stop-handle gradient-stop-handle--from" type="button" data-gradient-stop="from" aria-label="نقطة بداية التدرج" data-i18n-attr="aria-label:gradientFromStop" />
              <button className="gradient-stop-handle gradient-stop-handle--to" type="button" data-gradient-stop="to" aria-label="نقطة نهاية التدرج" data-i18n-attr="aria-label:gradientToStop" />
            </div>
            <div className="gradient-stop-controls">
              <label>
                <span data-i18n="gradientFrom">من</span>
                <input id="gradientFrom" type="color" defaultValue="#050505" />
              </label>
              <label>
                <span data-i18n="gradientTo">إلى</span>
                <input id="gradientTo" type="color" defaultValue="#7a7a7a" />
              </label>
            </div>
          </div>

          <div className="gradient-direction-row">
            <span data-i18n="gradientDirection">اتجاه التدرج</span>
            <div id="gradientDirectionButtons" className="gradient-direction-buttons">
              <button className="is-active" type="button" data-gradient-direction="down" aria-label="من الأعلى للأسفل" data-i18n-attr="aria-label:gradientDown">↓</button>
              <button type="button" data-gradient-direction="right" aria-label="من اليمين لليسار" data-i18n-attr="aria-label:gradientRight">→</button>
              <button type="button" data-gradient-direction="diagonal" aria-label="قطري" data-i18n-attr="aria-label:gradientDiagonal">↘</button>
              <button type="button" data-gradient-direction="radial" aria-label="دائري" data-i18n-attr="aria-label:gradientRadial">○</button>
            </div>
          </div>
        </div>

        <div className="color-swatch-group">
          <span data-i18n="backgroundColor">لون الخلفية</span>
          <div className="swatch-row">
            {bgSwatches.map((color) => (
              <button
                className={color === "#ffffff" ? "color-swatch is-active" : "color-swatch"}
                key={color}
                type="button"
                style={{ "--swatch": color }}
                data-color-target="background"
                data-color-value={color}
                aria-label={color}
              />
            ))}
            <label className="color-picker-swatch">
              <input id="backgroundColor" type="color" defaultValue="#ffffff" aria-label="لون الخلفية" data-i18n-attr="aria-label:backgroundColor" />
            </label>
          </div>
        </div>

        <label className="range-field ink-range-field">
          <span><span data-i18n="inkDensity">كثافة الحبر</span> <b id="inkValue">3</b></span>
          <input id="inkRange" type="range" min="1" max="5" defaultValue="3" step="1" />
        </label>
      </div>
    </section>
  );
}

function SizeSection() {
  return (
    <section className="panel-section accordion-section" data-mobile-panel="size">
      <button className="accordion-header" type="button" aria-expanded="false">
        <h2 data-i18n="size">المقاسات</h2>
        <ChevronUp aria-hidden="true" />
      </button>

      <div className="accordion-content">
        <label className="range-field split-range">
          <span><span data-i18n="shapeSize">حجم الشكل</span><b id="sizeValue">360</b></span>
          <input id="sizeRange" type="range" min="160" max="620" defaultValue="360" step="10" />
        </label>

        <label className="range-field split-range">
          <span><span data-i18n="symbolDetail">دقة الرموز</span><b id="detailValue">104</b></span>
          <input id="detailRange" type="range" min="48" max="170" defaultValue="104" step="2" />
        </label>

        <label className="range-field split-range">
          <span><span data-i18n="edgeSensitivity">حساسية الحواف</span><b id="thresholdValue">18</b></span>
          <input id="thresholdRange" type="range" min="4" max="54" defaultValue="18" step="1" />
        </label>
      </div>
    </section>
  );
}

function MotionSection() {
  return (
    <section className="panel-section accordion-section" data-mobile-panel="motion">
      <button className="accordion-header" type="button" aria-expanded="false">
        <h2 data-i18n="motionShape">الحركة والشكل</h2>
        <ChevronUp aria-hidden="true" />
      </button>

      <div className="accordion-content">
        <label className="field">
          <span data-i18n="animation">الحركة</span>
          <select id="animationSelect" defaultValue="none">
            <option value="none" data-i18n="animNone">ثابت</option>
            <option value="scan" data-i18n="animScan">مسح ضوئي</option>
            <option value="flicker" data-i18n="animFlicker">وميض رموز</option>
            <option value="wave" data-i18n="animWave">موجة</option>
            <option value="reveal" data-i18n="animReveal">ظهور تدريجي</option>
            <option value="orbit" data-i18n="animOrbit">مدار خفيف</option>
            <option value="glitch" data-i18n="animGlitch">خلل رقمي</option>
            <option value="rain" data-i18n="animRain">مطر رموز</option>
            <option value="type" data-i18n="animType">كتابة سريعة</option>
            <option value="breathe" data-i18n="animBreathe">نبض هادئ</option>
            <option value="jitter" data-i18n="animJitter">اهتزاز خفيف</option>
          </select>
        </label>

        <label className="field">
          <span data-i18n="composition">تكوين الرسم</span>
          <select id="compositionSelect" defaultValue="normal">
            <option value="normal" data-i18n="compositionNormal">عادي</option>
            <option value="arc" data-i18n="compositionArc">قوس</option>
            <option value="circle" data-i18n="compositionCircle">دائري</option>
          </select>
        </label>
      </div>
    </section>
  );
}

const toolTabs = [
  { panel: "source", label: "source", fallback: "النص", Icon: Type },
  { panel: "symbols", label: "symbols", fallback: "الأسلوب", Icon: Braces },
  { panel: "fonts", label: "fonts", fallback: "الخطوط", Icon: CaseSensitive },
  { panel: "color", label: "color", fallback: "اللون", Icon: Palette },
  { panel: "size", label: "size", fallback: "المقاسات", Icon: Ruler },
  { panel: "motion", label: "animation", fallback: "الحركة", Icon: Wand2 },
  { panel: "export", label: "export", fallback: "تصدير", Icon: Download },
];

function ToolTab({ tab }) {
  const { panel, label, fallback, Icon } = tab;

  return (
    <button
      className={panel === "source" ? "mobile-tab is-active" : "mobile-tab"}
      type="button"
      data-mobile-tab={panel}
      aria-selected={panel === "source" ? "true" : "false"}
      title={fallback}
    >
      <Icon aria-hidden="true" />
      <span data-i18n={label}>{fallback}</span>
    </button>
  );
}

function MobileTabbar() {
  return (
    <nav className="mobile-tabbar" aria-label="أقسام الإعدادات" data-i18n-attr="aria-label:settings">
      {toolTabs.map((tab) => <ToolTab key={tab.panel} tab={tab} />)}
    </nav>
  );
}

function ControlPanel() {
  return (
    <aside className="control-panel" aria-label="إعدادات التوليد" data-i18n-attr="aria-label:settings">
      <div className="panel-title">
        <div>
          <h1 data-i18n="appTitle">استوديو الأسكي العربي</h1>
        </div>
        <button className="canvas-icon-button sidebar-toggle" id="sidebarToggle" type="button" aria-expanded="true" aria-label="طي الشريط الجانبي" data-i18n-attr="aria-label:sidebarToggle">
          <PanelRight aria-hidden="true" />
          <span data-i18n="sidebar">الشريط</span>
        </button>
      </div>

      <SourceSection />
      <SymbolsSection />
      <FontSection />
      <ColorSection />
      <SizeSection />
      <MotionSection />

      <div className="export-dock" data-mobile-panel="export" aria-label="خيارات التصدير" data-i18n-attr="aria-label:exportOptions">
        <button className="export-tile" id="downloadPng" type="button">
          <FileImage aria-hidden="true" />
          <span>PNG</span>
        </button>
        <button className="export-tile" id="downloadSvg" type="button">
          <FileCode2 aria-hidden="true" />
          <span>SVG</span>
        </button>
        <button className="export-tile" id="copyText" type="button">
          <FileText aria-hidden="true" />
          <span data-i18n="exportText">نص</span>
        </button>
        <button className="export-tile" id="downloadGif" type="button" disabled>
          <Film aria-hidden="true" />
          <span>GIF</span>
        </button>
      </div>

      <MobileTabbar />

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
    <>
      <main className="app-shell">
        <OutputPanel />
        <ControlPanel />
        <canvas id="maskCanvas" hidden />
      </main>
      <Analytics />
    </>
  );
}
