import React, { useState, useEffect } from "react";
import { distance } from "fastest-levenshtein"; // ✅ fuzzy search
import featuresData from "./data/features.json";

// CodeMirror + Linter
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { Decoration, DecorationSet } from "@codemirror/view";
import { StateField, RangeSetBuilder } from "@codemirror/state";
import { hoverTooltip } from "@codemirror/view";

// Browser logos
import ChromeLogo from "./assets/chrome.svg";
import FirefoxLogo from "./assets/firefox.svg";
import SafariLogo from "./assets/safari.svg";
import EdgeLogo from "./assets/edge.svg";

// ✅ Your logo
import Logo from "./assets/logo.svg";
import BLogo from "./assets/blogo.svg";


interface BrowserSupport {
  version: number;
  year: number;
}

interface Feature {
  name: string;
  description: string;
  status: { baseline: boolean };
  keywords?: string[];
  support: {
    chrome: BrowserSupport;
    firefox: BrowserSupport;
    safari: BrowserSupport;
    edge: BrowserSupport;
  };
}

/* ---------------------- 🔴 Linter Extension ---------------------- */
function makeLinterExtension(code: string) {
  const ranges: { from: number; to: number; message: string; baseline: boolean }[] = [];

  (featuresData as Feature[]).forEach((feature) => {
    const targets = [feature.name, ...(feature.keywords || [])];
    targets.forEach((kw) => {
      let startIndex = code.toLowerCase().indexOf(kw.toLowerCase());
      while (startIndex !== -1) {
        ranges.push({
          from: startIndex,
          to: startIndex + kw.length,
          message: feature.status.baseline
            ? `✅ ${feature.name} — Baseline supported`
            : `❌ ${feature.name} — Not part of Baseline`,
          baseline: feature.status.baseline,
        });

        startIndex = code.toLowerCase().indexOf(kw.toLowerCase(), startIndex + 1);
      }
    });
  });

  // ✅ sort by position
  ranges.sort((a, b) => a.from - b.from);

  // ✅ deduplicate (remove overlapping ranges)
  const deduped: typeof ranges = [];
  let lastEnd = -1;
  for (const r of ranges) {
    if (r.from >= lastEnd) {
      deduped.push(r);
      lastEnd = r.to;
    }
  }

  const builder = new RangeSetBuilder<Decoration>();
  deduped.forEach((r) => {
    builder.add(
      r.from,
      r.to,
      Decoration.mark({
        class: r.baseline ? "cm-baseline" : "cm-nonbaseline",
      })
    );
  });

  const decorations = builder.finish();

  const field = StateField.define<DecorationSet>({
    create() {
      return decorations;
    },
    update() {
      return decorations;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  const tooltip = hoverTooltip((view, pos) => {
    for (let r of deduped) {
      if (pos >= r.from && pos <= r.to) {
        return {
          pos: r.from,
          end: r.to,
          create: () => {
            let dom = document.createElement("div");
            dom.textContent = r.message;
            dom.className =
              "px-2 py-1 text-sm rounded shadow " +
              (r.baseline ? "bg-green-600 text-white" : "bg-red-600 text-white");
            return { dom };
          },
        };
      }
    }
    return null;
  });

  return [field, tooltip];
}

function App() {
  const [mode, setMode] = useState<"single" | "compare" | "checker">("single");

  // Single search
  const [query, setQuery] = useState("");
  const [featureResult, setFeatureResult] = useState<Feature | null>(null);
  const [noResult, setNoResult] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Compare
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [featureA, setFeatureA] = useState<Feature | null>(null);
  const [featureB, setFeatureB] = useState<Feature | null>(null);

  // Checker
  const [codeInput, setCodeInput] = useState("");
  const [detectedFeatures, setDetectedFeatures] = useState<Feature[]>([]);

  const [animateBars, setAnimateBars] = useState(false);
  const [showWinnerInfo, setShowWinnerInfo] = useState(false);

  // 🔎 Single search handler
  const handleSearch = () => {
    const found = (featuresData as Feature[]).find((f) =>
      f.name.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setFeatureResult(found);
      setNoResult(false);
      setSuggestion(null);
    } else {
      // Suggest closest
      const bestMatch = (featuresData as Feature[])
        .map((f) => ({
          name: f.name,
          score:
            1 -
            distance(query.toLowerCase(), f.name.toLowerCase()) /
              Math.max(query.length, f.name.length),
        }))
        .sort((a, b) => b.score - a.score)[0];

      setFeatureResult(null);
      setNoResult(true);
      setSuggestion(bestMatch && bestMatch.score > 0.5 ? bestMatch.name : null);
    }
  };

  const handleClear = () => {
    setQuery("");
    setFeatureResult(null);
    setNoResult(false);
    setSuggestion(null);
  };

  // 🔄 Compare handler
  const handleCompare = () => {
    const foundA = (featuresData as Feature[]).find((f) =>
      f.name.toLowerCase().includes(queryA.toLowerCase())
    );
    const foundB = (featuresData as Feature[]).find((f) =>
      f.name.toLowerCase().includes(queryB.toLowerCase())
    );

    setFeatureA(foundA || null);
    setFeatureB(foundB || null);
  };

  // ✅ Checker handler
  const handleCheckCode = () => {
    const detected = (featuresData as Feature[]).filter(
      (f) =>
        codeInput.toLowerCase().includes(f.name.toLowerCase()) ||
        f.keywords?.some((kw) => codeInput.toLowerCase().includes(kw.toLowerCase()))
    );
    setDetectedFeatures(detected);
  };

  useEffect(() => {
    if (featureResult || featureA || featureB || detectedFeatures.length > 0) {
      setAnimateBars(false);
      setTimeout(() => setAnimateBars(true), 150);
    }
  }, [featureResult, featureA, featureB, detectedFeatures]);

  // 🎨 Browser colors
  const browserColors: Record<string, string> = {
    chrome: "bg-yellow-400",
    firefox: "bg-purple-600",
    safari: "bg-blue-500",
    edge: "bg-green-500",
  };

  const startYear = 2010;
  const currentYear = 2025;
  const yearRange = currentYear - startYear;

  // 🏆 Winner calculation
  const calculateScore = (feature: Feature) =>
    Object.values(feature.support).reduce(
      (sum, { year }) => sum + (currentYear - year),
      0
    );

  const winner =
    featureA && featureB
      ? calculateScore(featureA) > calculateScore(featureB)
        ? "A"
        : "B"
      : null;

  // 📦 Feature Card
  const FeatureCard = ({
    feature,
    highlight = false,
  }: {
    feature: Feature;
    highlight?: boolean;
  }) => (
    <div
      className={`relative w-full max-w-md bg-white shadow-md rounded-lg p-6 animate-fadeIn ${
        highlight ? "border-4 border-green-500" : "border border-gray-200"
      }`}
    >
      {/* Winner badge */}
      {highlight && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            🏆 Winner
          </span>
          <button
            onClick={() => setShowWinnerInfo(true)}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ℹ️
          </button>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">{feature.name}</h2>
      <p className="mb-2 text-gray-600">{feature.description}</p>
      <p className="font-semibold mb-4">
        Baseline: {feature.status.baseline ? "✅ Yes" : "❌ Not yet"}
      </p>

      <h3 className="text-md font-semibold mb-4">Adoption Timeline</h3>
      <div className="space-y-4">
        {Object.entries(feature.support).map(([browser, data], index) => {
          const { year, version } = data as BrowserSupport;
          const startPercent = ((year - startYear) / yearRange) * 100;
          const widthPercent = 100 - startPercent;

          return (
            <div key={browser}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center gap-2 capitalize">
                  {browser === "chrome" && <img src={ChromeLogo} alt="Chrome" className="w-5 h-5" />}
                  {browser === "firefox" && <img src={FirefoxLogo} alt="Firefox" className="w-5 h-5" />}
                  {browser === "safari" && <img src={SafariLogo} alt="Safari" className="w-5 h-5" />}
                  {browser === "edge" && <img src={EdgeLogo} alt="Edge" className="w-5 h-5" />}
                  {browser}
                </span>
                <span className="text-gray-600">
                  v{version} ({year})
                </span>
              </div>

              <div className="relative w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${browserColors[browser]} h-3 rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    marginLeft: `${startPercent}%`,
                    width: animateBars ? `${widthPercent}%` : "0%",
                    transitionDelay: `${index * 200}ms`,
                  }}
                ></div>
                <div className="absolute top-0 bottom-0 w-1 bg-red-500" style={{ left: "100%" }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{startYear}</span>
        <span>2015</span>
        <span>2020</span>
        <span>📍 Today ({currentYear})</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex justify-center mb-2">
        <img src={Logo} alt="BaseLineage Logo" className="w-80 md:w-96 drop-shadow-md" />
      </div>

      {/* SINGLE MODE */}
      {mode === "single" && (
        <>
          <div className="flex gap-2 mb-6 relative">
            <input
              type="text"
              placeholder="Search for a feature (e.g. CSS Grid)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg w-80 focus:ring focus:ring-blue-400 pr-10"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                ❌
              </button>
            )}
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>

          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setMode("compare")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Compare Features
            </button>
            <button
              onClick={() => setMode("checker")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Baseline Checker
            </button>
          </div>

          {featureResult && <FeatureCard feature={featureResult} />}
          {noResult && (
            <div className="w-full max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-6 rounded-lg shadow-md animate-fadeIn text-center">
              <h2 className="text-xl font-bold mb-2">❌ No Results Found</h2>
              <p>We couldn’t find any feature matching “{query}”.</p>
              {suggestion && (
                <p className="mt-2 text-gray-700">
                  Did you mean <b>{suggestion}</b>?
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* COMPARE MODE */}
      {mode === "compare" && (
        <>
          <button
            onClick={() => setMode("single")}
            className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition text-sm"
          >
            ← Back to Single Search
          </button>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Feature A (e.g. Flexbox)"
              value={queryA}
              onChange={(e) => setQueryA(e.target.value)}
              className="px-4 py-2 border rounded-lg w-64 focus:ring focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Feature B (e.g. Grid)"
              value={queryB}
              onChange={(e) => setQueryB(e.target.value)}
              className="px-4 py-2 border rounded-lg w-64 focus:ring focus:ring-blue-400"
            />
            <button
              onClick={handleCompare}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Compare
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {featureA && <FeatureCard feature={featureA} highlight={winner === "A"} />}
            {featureB && <FeatureCard feature={featureB} highlight={winner === "B"} />}
          </div>
        </>
      )}

      {/* CHECKER MODE */}
      {mode === "checker" && (
        <>
          <button
            onClick={() => setMode("single")}
            className="mb-6 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow hover:bg-gray-400 transition text-sm"
          >
            ← Back to Search
          </button>

          <div className="mb-6 w-full max-w-2xl space-y-6">
            {/* 🟢 Live Linter */}
            <CodeMirror
              value={codeInput}
              height="200px"
              extensions={[javascript(), html(), css(), ...makeLinterExtension(codeInput)]}
              onChange={(value) => {
                setCodeInput(value);

                const detected = (featuresData as Feature[]).filter(
                  (f) =>
                    value.toLowerCase().includes(f.name.toLowerCase()) ||
                    f.keywords?.some((kw) => value.toLowerCase().includes(kw.toLowerCase()))
                );
                setDetectedFeatures(detected);
              }}
              className="border rounded-lg"
            />

            <p className="text-sm text-gray-500">
              🔎 Non-baseline features will be underlined in{" "}
              <span className="text-red-500 font-bold">red</span> as you type.
            </p>

            {/* 🔵 Manual Checker (your old version) */}
            <textarea
              placeholder="Paste your CSS, HTML, or JS code here..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-32 px-4 py-2 border rounded-lg focus:ring focus:ring-green-400"
            />
            <button
              onClick={handleCheckCode}
              className="mt-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Run Baseline Checker
            </button>
          </div>

          {detectedFeatures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
              {detectedFeatures.map((feature) => (
                <FeatureCard key={feature.name} feature={feature} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No features detected yet.</p>
          )}
        </>
      )}

      {/* Winner Info Popup */}
      {showWinnerInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center">
            <h3 className="text-lg font-bold mb-2">Why is this the Winner?</h3>
            <p className="text-gray-700 text-sm mb-4">
              The winner is chosen based on earlier adoption across browsers.
              This means it reached baseline support faster and is more broadly available.
            </p>
            <button
              onClick={() => setShowWinnerInfo(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🔗 Baseline Logo */}
      <a
        href="https://web.dev/baseline"
        target="_blank"
        rel="noopener noreferrer"
        className="baseline-logo"
      >
        <img src={BLogo} alt="Baseline Logo" />
      </a>
    </div>

  );
}

export default App;
