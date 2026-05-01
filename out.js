import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Solar } from "lunar-javascript";
import html2canvas from "html2canvas";
import { isDateCustomHoliday, isDateCustomWorkday, getCustomHolidayName } from "./holidays";
const playAlertSound = (type) => {
  if (!type || type === "none") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    if (type === "beep") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === "bell") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 1.5);
      gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.5);
    } else if (type === "chime") {
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1);
    } else if (type === "digital") {
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};
import {
  Settings,
  RefreshCw,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Home,
  PieChart,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Timer,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Play,
  Pause,
  Square,
  Plane,
  Globe
} from "lucide-react";
const MILK_TEA_PRICE = 20;
const COFFEE_PRICE = 30;
const GAS_PRICE = 8;
const IPHONE_PRICE = 7999;
const formatMoney = (amount) => {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const pad0 = (num) => num.toString().padStart(2, "0");
const TIMEZONES = [
  { label: "\u{1F1E8}\u{1F1F3} \u5317\u4EAC", value: "Asia/Shanghai", short: "\u5317\u4EAC" },
  { label: "\u{1F1F9}\u{1F1ED} \u66FC\u8C37", value: "Asia/Bangkok", short: "\u66FC\u8C37" },
  { label: "\u{1F1FB}\u{1F1F3} \u80E1\u5FD7\u660E", value: "Asia/Ho_Chi_Minh", short: "\u80E1\u5FD7\u660E" },
  { label: "\u{1F1E8}\u{1F1F3} \u9999\u6E2F", value: "Asia/Hong_Kong", short: "\u9999\u6E2F" },
  { label: "\u{1F1EF}\u{1F1F5} \u4E1C\u4EAC", value: "Asia/Tokyo", short: "\u4E1C\u4EAC" },
  { label: "\u{1F1FA}\u{1F1F8} \u7EBD\u7EA6", value: "America/New_York", short: "\u7EBD\u7EA6" },
  { label: "\u{1F1EC}\u{1F1E7} \u4F26\u6566", value: "Europe/London", short: "\u4F26\u6566" },
  { label: "\u{1F1E6}\u{1F1FA} \u6089\u5C3C", value: "Australia/Sydney", short: "\u6089\u5C3C" },
  { label: "\u{1F1EB}\u{1F1F7} \u5DF4\u9ECE", value: "Europe/Paris", short: "\u5DF4\u9ECE" }
];
const getLocalTzInfo = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai";
    const match = TIMEZONES.find((t) => t.value === tz);
    return { value: tz, label: match ? match.short : tz.split("/").pop() || "\u672C\u5730" };
  } catch (e) {
    return { value: "Asia/Shanghai", label: "\u5317\u4EAC" };
  }
};
const initialTz = getLocalTzInfo();
const getWorkDaysInMonth = (year, month, region, restDays, upToDate) => {
  let workdays = 0;
  const maxDays = new Date(year, month + 1, 0).getDate();
  const days = upToDate !== void 0 ? Math.min(upToDate, maxDays) : maxDays;
  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    const day = d.getDay();
    const isStandardWeekend = restDays === 2 ? day === 0 || day === 6 : day === 0;
    const isCustomHoliday = isDateCustomHoliday(d, region);
    const isCustomWorkday = isDateCustomWorkday(d, region);
    if (isCustomHoliday) {
    } else if (isCustomWorkday) {
      workdays++;
    } else if (!isStandardWeekend) {
      workdays++;
    }
  }
  return workdays || 21.75;
};
const FORTUNES = [
  { level: "\u5927\u5409", text: "\u4ECA\u65E5\u5927\u5409\uFF1A\u6478\u9C7C\u6307\u6570100%", detail: "\u4ECA\u5929\u8001\u677F\u51FA\u5DEE\uFF0C\u655E\u5F00\u6478\u5427\uFF01", emoji: "\u{1F389}", color: "text-green-500" },
  { level: "\u5927\u5409", text: "\u4ECA\u65E5\u5927\u5409\uFF1A\u7CFB\u7EDF\u5D29\u6E83", detail: "\u8D81\u73B0\u5728\uFF0C\u5FEB\u53BB\u559D\u676F\u5496\u5561\uFF01", emoji: "\u2615", color: "text-green-500" },
  { level: "\u5927\u5409", text: "\u4ECA\u65E5\u5927\u5409\uFF1A\u51C6\u70B9\u4E0B\u73ED", detail: "\u6CA1\u6709\u4EFB\u4F55\u963B\u788D\uFF0C\u7535\u68AF\u90FD\u521A\u521A\u597D\u3002", emoji: "\u{1F3C3}", color: "text-green-500" },
  { level: "\u5927\u5409", text: "\u4ECA\u65E5\u5927\u5409\uFF1A\u5E26\u85AA\u62C9\u5C4E", detail: "\u9A6C\u6876\u72B9\u5982\u9F99\u6905\uFF0C\u8212\u9002\u5EA6\u6EE1\u5206\u3002", emoji: "\u{1F6BD}", color: "text-green-500" },
  { level: "\u5927\u5409", text: "\u4ECA\u65E5\u5927\u5409\uFF1A\u7075\u611F\u7206\u68DA", detail: "10\u5206\u949F\u5199\u5B8C\u4EE3\u7801\uFF0C\u5269\u4E0B7\u5C0F\u65F650\u5206\u6478\u9C7C\u3002", emoji: "\u{1F4A1}", color: "text-green-500" },
  { level: "\u5927\u5409", text: "\u4ECA\u65E5\u5927\u5409\uFF1A\u5956\u91D1\u7FFB\u500D", detail: "\u867D\u7136\u662F\u505A\u68A6\uFF0C\u4F46\u68A6\u91CC\u771F\u7684\u5F88\u723D\u3002", emoji: "\u{1F4B0}", color: "text-green-500" },
  { level: "\u5927\u5409", text: "\u4ECA\u65E5\u5927\u5409\uFF1A\u795E\u4ED9\u4E59\u65B9", detail: "\u4ECA\u5929\u5BF9\u63A5\u7684\u4EBA\u610F\u5916\u5730\u597D\u8BF4\u8BDD\u3002", emoji: "\u2728", color: "text-green-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1A\u65E0\u4E8B\u53D1\u751F", detail: "\u6CA1\u6709\u9700\u6C42\u5C31\u662F\u6700\u597D\u7684\u9700\u6C42\u3002", emoji: "\u{1F60C}", color: "text-yellow-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1A\u4F1A\u8BAE\u6570\u91CF-2", detail: "\u4E0D\u7528\u53BB\u542C\u5E9F\u8BDD\u4E86\uFF0C\u4F46\u4E5F\u53EF\u80FD\u6709\u4E2A\u7532\u65B9\u627E\u9EBB\u70E6\u3002", emoji: "\u{1F4C5}", color: "text-yellow-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1A\u4E0B\u5348\u8336+1", detail: "\u9694\u58C1\u90E8\u95E8\u8BF7\u5BA2\uFF0C\u767D\u5AD6\u5FEB\u4E50\u3002", emoji: "\u{1F370}", color: "text-yellow-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1ABug\u79D2\u89E3", detail: "\u968F\u4FBF\u6539\u4E86\u4E00\u884C\uFF0C\u5C45\u7136\u8DD1\u901A\u4E86\u3002", emoji: "\u{1F41B}", color: "text-yellow-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1A\u7F51\u901F\u8D77\u98DE", detail: "\u5237B\u7AD9\u4E00\u70B9\u90FD\u4E0D\u5361\u3002", emoji: "\u{1F680}", color: "text-yellow-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1A\u8001\u677F\u7B11\u8138", detail: "\u867D\u7136\u4E0D\u77E5\u4E3A\u4F55\uFF0C\u4F46\u603B\u6BD4\u677F\u7740\u8138\u597D\u3002", emoji: "\u{1F60F}", color: "text-yellow-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1A\u98DF\u5802\u52A0\u8089", detail: "\u963F\u59E8\u4ECA\u5929\u624B\u6CA1\u6296\u3002", emoji: "\u{1F357}", color: "text-yellow-500" },
  { level: "\u5C0F\u5409", text: "\u4ECA\u65E5\u5C0F\u5409\uFF1A\u4E0D\u7528\u6392\u961F", detail: "\u5395\u6240\u7A7A\u65F7\uFF0C\u7A7A\u6C14\u6E05\u65B0\u3002", emoji: "\u2728", color: "text-yellow-500" },
  { level: "\u5E73\u5E73", text: "\u4ECA\u65E5\u5E73\u5E73\uFF1A\u4E00\u5207\u7167\u65E7", detail: "\u4E0D\u597D\u4E0D\u574F\uFF0C\u53C8\u6DF7\u8FC7\u4E00\u5929\u3002", emoji: "\u{1F610}", color: "text-blue-500" },
  { level: "\u5E73\u5E73", text: "\u4ECA\u65E5\u5E73\u5E73\uFF1A\u5047\u88C5\u5FD9\u788C", detail: "\u6572\u51FB\u952E\u76D8\u7684\u901F\u5EA6\u4E0E\u5B9E\u9645\u4EA7\u51FA\u6210\u53CD\u6BD4\u3002", emoji: "\u2328\uFE0F", color: "text-blue-500" },
  { level: "\u5E73\u5E73", text: "\u4ECA\u65E5\u5E73\u5E73\uFF1A\u51C6\u65F6\u6253\u5361", detail: "\u665A\u4E00\u5206\u949F\u7B97\u8FDF\u5230\uFF0C\u65E9\u4E00\u5206\u949F\u7B97\u65E9\u9000\u3002", emoji: "\u23F0", color: "text-blue-500" },
  { level: "\u5E73\u5E73", text: "\u4ECA\u65E5\u5E73\u5E73\uFF1A5\u70B9\u51C6\u65F6\u4E0B\u73ED", detail: "\u4F46\u6709\u4EBA\u60F3\u53EB\u4F60\u52A0\u73ED\u3002", emoji: "\u{1F440}", color: "text-blue-500" },
  { level: "\u5E73\u5E73", text: "\u4ECA\u65E5\u5E73\u5E73\uFF1A\u559D\u6C34\u592A\u591A", detail: "\u4E00\u5929\u53BB\u4E868\u6B21\u6D17\u624B\u95F4\uFF0C\u95F4\u63A5\u6478\u9C7C\u3002", emoji: "\u{1F4A7}", color: "text-blue-500" },
  { level: "\u5E73\u5E73", text: "\u4ECA\u65E5\u5E73\u5E73\uFF1A\u5FD8\u5E26\u8033\u673A", detail: "\u88AB\u8FEB\u542C\u4E86\u4E00\u5929\u540C\u4E8B\u7684\u516B\u5366\u3002", emoji: "\u{1F3A7}", color: "text-blue-500" },
  { level: "\u5E73\u5E73", text: "\u4ECA\u65E5\u5E73\u5E73\uFF1A\u4E2D\u5348\u5403\u6491", detail: "\u4E0B\u5348\u72AF\u56F0\uFF0C\u751F\u4EA7\u529B-50%\u3002", emoji: "\u{1F634}", color: "text-blue-500" },
  { level: "\u51F6", text: "\u4ECA\u65E5\u51F6\uFF1A\u5929\u964D\u5927\u9505", detail: "\u4E0D\u662F\u4F60\u7684Bug\uFF0C\u4F46\u8981\u4F60\u80CC\u9505\u3002", emoji: "\u{1F958}", color: "text-red-400" },
  { level: "\u51F6", text: "\u4ECA\u65E5\u51F6\uFF1A\u4EA7\u54C1\u6539\u9700\u6C42", detail: "\u521A\u5199\u5B8C\u7684\u4EE3\u7801\uFF0C\u53C8\u8981\u63A8\u7FFB\u91CD\u6765\u3002", emoji: "\u{1F4DD}", color: "text-red-400" },
  { level: "\u51F6", text: "\u4ECA\u65E5\u51F6\uFF1A\u9489\u9489\u72C2\u54CD", detail: "\u54CD\u4E8623\u6B21\uFF0C\u5EFA\u8BAE\u63D0\u524D\u5173\u673A\u3002", emoji: "\u{1F514}", color: "text-red-400" },
  { level: "\u51F6", text: "\u4ECA\u65E5\u51F6\uFF1A\u4EE3\u7801\u51B2\u7A81", detail: "\u89E3Git\u51B2\u7A81\u89E3\u5230\u6000\u7591\u4EBA\u751F\u3002", emoji: "\u{1F4A5}", color: "text-red-400" },
  { level: "\u51F6", text: "\u4ECA\u65E5\u51F6\uFF1A\u5468\u4E94\u53D1\u7248", detail: "\u53D1\u7248\u5FC5\u5D29\uFF0C\u5468\u672B\u522B\u60F3\u8FC7\u4E86\u3002", emoji: "\u{1F525}", color: "text-red-400" },
  { level: "\u51F6", text: "\u4ECA\u65E5\u51F6\uFF1A\u8001\u677F\u67E5\u5C97", detail: "\u521A\u597D\u5728\u5207\u540E\u53F0\uFF0C\u88AB\u6293\u4E2A\u6B63\u7740\u3002", emoji: "\u{1F631}", color: "text-red-400" },
  { level: "\u5927\u51F6", text: "\u4ECA\u65E5\u5927\u51F6\uFF1A\u5168\u76D8\u5D29\u6E83", detail: "\u6CA1\u63D0\u4EA4\u4EE3\u7801\uFF1F\u8282\u54C0\u987A\u53D8\u3002", emoji: "\u{1F480}", color: "text-red-600" },
  { level: "\u5927\u51F6", text: "\u4ECA\u65E5\u5927\u51F6\uFF1A\u8FDE\u73AF\u593A\u547DCall", detail: "\u5468\u62A5+\u6708\u62A5+\u5B63\u62A5\u540C\u65F6\u50AC\uFF0C\u5EFA\u8BAE\u8BF7\u75C5\u5047\u3002", emoji: "\u{1F4F1}", color: "text-red-600" },
  { level: "\u5927\u51F6", text: "\u4ECA\u65E5\u5927\u51F6\uFF1A\u53F3\u773C\u72C2\u8DF3", detail: "\u7834\u8D22\u514D\u707E\uFF0C\u4ECA\u5929\u522B\u70B9\u8D35\u7684\u5976\u8336\u3002", emoji: "\u{1F4B8}", color: "text-red-600" }
];
function NiumaAvatar({
  activeTheme,
  workSeconds,
  slackSeconds,
  overtimeSeconds,
  nowSecs,
  endSecs
}) {
  const isSlackingTooMuch = slackSeconds > 2 * 3600;
  const isWorkingTooMuch = workSeconds > 8 * 3600;
  const isOvertime = overtimeSeconds > 0;
  const isNearOffwork = nowSecs > endSecs - 3600 && nowSecs < endSecs;
  const baseEmojis = {
    default: "\u{1F42E}",
    cyberpunk: "\u{1F916}",
    retro: "\u{1F47E}",
    classic: "\u{1F434}"
  };
  let emoji = baseEmojis[activeTheme] || "\u{1F42E}";
  if (isSlackingTooMuch) emoji = "\u{1F41F}";
  return /* @__PURE__ */ jsxs("div", { className: "relative inline-flex items-center justify-center text-[42px] z-10 w-16 h-16 pointer-events-none", children: [
    /* @__PURE__ */ jsx("span", { className: "relative z-10 filter drop-shadow-md transform hover:scale-110 transition-transform duration-300", children: emoji }),
    isWorkingTooMuch && !isSlackingTooMuch && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex justify-center items-center gap-2 mt-2 z-20 opacity-80 mix-blend-multiply dark:mix-blend-normal", children: [
      /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-black/60 blur-[1.5px] dark:bg-black/90" }),
      /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-black/60 blur-[1.5px] dark:bg-black/90" })
    ] }),
    isOvertime && /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-[#e8c39e] rounded-b-[100%] rounded-t-[50%] z-20 border border-black/10 overflow-hidden shadow-inner", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gradient-to-b from-white/30 to-transparent" }) }),
    isNearOffwork && /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 text-3xl z-20 drop-shadow-lg scale-125", children: "\u{1F4FF}" }),
    /* @__PURE__ */ jsx("div", { className: "text-xl absolute bottom-0 -right-2 z-30 drop-shadow-xl filter", children: "\u{1F4BB}" })
  ] });
}
const FOCUS_CONTAINERS = [
  { id: "incense", name: "\u7EBF\u9999(25m)", emoji: "\u{1F962}", defaultTime: 25 },
  { id: "candle", name: "\u8721\u70DB(30m)", emoji: "\u{1F56F}\uFE0F", defaultTime: 30 },
  { id: "hourglass", name: "\u6C99\u6F0F(45m)", emoji: "\u23F3", defaultTime: 45 },
  { id: "coffee", name: "\u5496\u5561(20m)", emoji: "\u2615", defaultTime: 20 },
  { id: "cigarette", name: "\u9999\u70DF(10m)", emoji: "\u{1F6AC}", defaultTime: 10 },
  { id: "ice", name: "\u51B0\u5757(15m)", emoji: "\u{1F9CA}", defaultTime: 15 },
  { id: "sakura", name: "\u6A31\u82B1(50m)", emoji: "\u{1F338}", defaultTime: 50 },
  { id: "moon", name: "\u6708\u4EAE(90m)", emoji: "\u{1F319}", defaultTime: 90 },
  { id: "campfire", name: "\u7BDD\u706B(60m)", emoji: "\u{1F525}", defaultTime: 60 },
  { id: "ramen", name: "\u6CE1\u9762(5m)", emoji: "\u{1F35C}", defaultTime: 5 }
];
const noiseNodes = {};
const playNoise = (type) => {
  if (!noiseNodes[type]) {
    const urls = {
      rain: "https://assets.mixkit.co/active_storage/sfx/2443/2443-prev.m4a",
      fire: "https://assets.mixkit.co/active_storage/sfx/3037/3037-prev.m4a",
      train: "https://assets.mixkit.co/active_storage/sfx/2387/2387-prev.m4a",
      ocean: "https://assets.mixkit.co/active_storage/sfx/1196/1196-prev.m4a",
      birds: "https://assets.mixkit.co/active_storage/sfx/1210/1210-prev.m4a",
      wind: "https://assets.mixkit.co/active_storage/sfx/1158/1158-prev.m4a",
      stream: "https://assets.mixkit.co/active_storage/sfx/2438/2438-prev.m4a",
      keyboard: "https://assets.mixkit.co/active_storage/sfx/611/611-prev.m4a",
      clock: "https://assets.mixkit.co/active_storage/sfx/1066/1066-prev.m4a"
    };
    if (urls[type]) {
      const a = new Audio(urls[type]);
      a.loop = true;
      a.volume = 0;
      noiseNodes[type] = { audio: a };
    }
  }
  const node = noiseNodes[type];
  if (node && node.audio.paused) {
    if (node.interval) clearInterval(node.interval);
    node.audio.play().catch(() => {
    });
    let vol = node.audio.volume;
    node.interval = setInterval(() => {
      vol = Math.min(0.4, vol + 0.02);
      node.audio.volume = vol;
      if (vol >= 0.4) {
        clearInterval(node.interval);
        node.interval = null;
      }
    }, 100);
  }
};
const stopNoise = (type) => {
  const node = noiseNodes[type];
  if (node && !node.audio.paused) {
    if (node.interval) clearInterval(node.interval);
    let vol = node.audio.volume;
    node.interval = setInterval(() => {
      vol = Math.max(0, vol - 0.05);
      node.audio.volume = vol;
      if (vol <= 0) {
        clearInterval(node.interval);
        node.interval = null;
        node.audio.pause();
      }
    }, 100);
  }
};
const stopAllNoise = () => {
  Object.keys(noiseNodes).forEach(stopNoise);
};
const MemoItems = React.memo(({
  memos,
  onToggle,
  onDelete
}) => {
  if (memos.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 bg-brand/5 rounded-3xl flex items-center justify-center text-brand/20 border border-brand/10 border-dashed animate-pulse", children: /* @__PURE__ */ jsx(Plus, { size: 40 }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-primary font-bold text-lg tracking-tight", children: "\u4ECA\u65E5\u65E0\u4E8B" }),
        /* @__PURE__ */ jsx("p", { className: "text-secondary text-sm mt-1 max-w-[200px] mx-auto opacity-70", children: "\u52FE\u52D2\u4F60\u7684\u4ECA\u65E5\u725B\u9A6C\u8BA1\u5212\uFF0C\u8BA9\u65F6\u95F4\u66F4\u6709\u5206\u91CF\u3002" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-3", children: memos.map((memo, idx) => /* @__PURE__ */ jsxs(
    motion.div,
    {
      layout: true,
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      className: `group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${memo.completed ? "bg-card-inner/30 border-app opacity-40 grayscale" : "bg-card border-app shadow-sm hover:border-brand/40 hover:shadow-md"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1 overflow-hidden", onClick: () => onToggle(idx), children: [
          /* @__PURE__ */ jsx("div", { className: `shrink-0 transition-transform duration-300 transform ${memo.completed ? "scale-110 text-brand" : "text-tertiary group-hover:scale-110"}`, children: /* @__PURE__ */ jsx(CheckCircle, { size: 22, fill: memo.completed ? "currentColor" : "none", strokeWidth: 1.5 }) }),
          /* @__PURE__ */ jsx("span", { className: `text-[15px] font-medium truncate py-0.5 select-none ${memo.completed ? "line-through text-secondary" : "text-primary"}`, children: memo.text })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              onDelete(idx);
            },
            className: "text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all",
            children: /* @__PURE__ */ jsx(Trash2, { size: 18 })
          }
        )
      ]
    },
    memo.id
  )) });
});
const MemoModal = React.memo(({
  date,
  memos,
  onClose,
  onSave
}) => {
  const [localMemos, setLocalMemos] = useState(memos);
  const [text, setText] = useState("");
  useEffect(() => {
    setLocalMemos(memos);
  }, [memos]);
  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newMemo = { id: Math.random().toString(), text: text.trim(), completed: false };
    const updated = [...localMemos, newMemo];
    setLocalMemos(updated);
    onSave(date, updated);
    setText("");
  };
  const toggleMemo = useCallback((idx) => {
    setLocalMemos((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], completed: !updated[idx].completed };
      onSave(date, updated);
      return updated;
    });
  }, [date, onSave]);
  const deleteMemo = useCallback((idx) => {
    setLocalMemos((prev) => {
      const updated = [...prev];
      updated.splice(idx, 1);
      onSave(date, updated);
      return updated;
    });
  }, [date, onSave]);
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-md px-0 md:px-4", children: /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: { y: "100%", opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: "100%", opacity: 0 },
      className: "bg-card w-full max-w-lg rounded-t-[32px] md:rounded-[32px] shadow-2xl border-t md:border border-app overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh] relative",
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-3xl rounded-full pointer-events-none" }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-app flex items-center justify-between bg-card-inner relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-xl font-bold text-primary tracking-tight flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-2 h-6 bg-brand rounded-full" }),
              "\u5907\u5FD8\u6E05\u5355"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary font-mono mt-0.5 opacity-70", children: date })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-3 bg-card border border-app rounded-2xl text-secondary hover:bg-app hover:text-primary transition-all active:scale-90 shadow-sm border-dashed", children: /* @__PURE__ */ jsx(X, { size: 20 }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-6 pt-3 flex-1 overflow-y-auto space-y-4 no-scrollbar relative z-10 min-h-[300px]", children: /* @__PURE__ */ jsx(
          MemoItems,
          {
            memos: localMemos.filter((m) => !(m.type && m.type.includes("leave"))),
            onToggle: (idx) => {
              const realIdx = localMemos.findIndex((m) => m.id === localMemos.filter((x) => !(x.type && x.type.includes("leave")))[idx].id);
              if (realIdx >= 0) toggleMemo(realIdx);
            },
            onDelete: (idx) => {
              const realIdx = localMemos.findIndex((m) => m.id === localMemos.filter((x) => !(x.type && x.type.includes("leave")))[idx].id);
              if (realIdx >= 0) deleteMemo(realIdx);
            }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 bg-card-inner border-t border-app relative z-10", children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: handleAdd, className: "flex gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex-1 relative", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                autoFocus: true,
                value: text,
                onChange: (e) => setText(e.target.value),
                placeholder: "\u952E\u5165\u5F85\u529E\u4E8B\u9879...",
                className: "w-full bg-card border border-app rounded-2xl px-5 py-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-inner text-primary placeholder:text-tertiary transition-all"
              }
            ) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: !text.trim(),
                className: "bg-brand text-card w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-brand-hover active:scale-90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:grayscale",
                children: /* @__PURE__ */ jsx(Plus, { size: 24, strokeWidth: 3 })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mt-4 opacity-40", children: [
            /* @__PURE__ */ jsx("div", { className: "h-[1px] w-8 bg-tertiary" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary font-medium uppercase tracking-[0.1em]", children: "Local Storage Only" }),
            /* @__PURE__ */ jsx("div", { className: "h-[1px] w-8 bg-tertiary" })
          ] })
        ] })
      ]
    }
  ) });
});
const CalendarGrid = React.memo(({
  calendarDate,
  localTime,
  config,
  memos,
  onDateClick
}) => {
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(/* @__PURE__ */ jsx("div", { className: "h-16 md:h-20 border border-transparent" }, `empty-${i}`));
  }
  for (let date = 1; date <= daysInMonth; date++) {
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), date);
    const dayOfWeek = d.getDay();
    const isStandardWeekend = config.restDays === 2 ? dayOfWeek === 0 || dayOfWeek === 6 : dayOfWeek === 0;
    const isCustomHoliday = isDateCustomHoliday(d, config.holidayRegion);
    const isCustomWorkday = isDateCustomWorkday(d, config.holidayRegion);
    const holidayName = getCustomHolidayName(d, config.holidayRegion);
    const memoKey = `${calendarDate.getFullYear()}-${(calendarDate.getMonth() + 1).toString().padStart(2, "0")}-${date.toString().padStart(2, "0")}`;
    const dayMemos = (memos || {})[memoKey] || [];
    const completedCount = dayMemos.filter((m) => m.completed).length;
    const isPaidLeave = dayMemos.some((m) => m.type === "paid_leave");
    const isUnpaidLeave = dayMemos.some((m) => m.type === "unpaid_leave");
    let isRest = (isStandardWeekend || isCustomHoliday) && !isCustomWorkday || isPaidLeave || isUnpaidLeave;
    let label = "\u4E0A\u73ED";
    if (isPaidLeave) {
      label = "\u5E26\u85AA\u4F11\u5047";
    } else if (isUnpaidLeave) {
      label = "\u65E0\u85AA\u4F11\u5047";
    } else if (isRest) {
      label = isStandardWeekend && !isCustomHoliday ? "\u4F11\u606F" : "\u5047\u671F";
    } else if (isCustomWorkday) {
      label = "\u8865\u73ED";
    }
    const isToday = date === localTime.getDate() && calendarDate.getMonth() === localTime.getMonth() && calendarDate.getFullYear() === localTime.getFullYear();
    cells.push(
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          whileTap: { scale: 0.95 },
          onClick: () => onDateClick(memoKey),
          className: `h-16 md:h-20 flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${isToday ? "bg-brand/10 border-brand shadow-[0_0_15px_rgba(0,255,65,0.2)] z-10" : isRest ? "bg-card border-transparent text-secondary/60" : "bg-card-inner border-app shadow-sm hover:border-brand/30"}`,
          children: [
            isToday && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2 w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,65,0.8)]" }),
            dayMemos.length > 0 && /* @__PURE__ */ jsxs("div", { className: "absolute top-2 left-2 flex gap-0.5", children: [
              dayMemos.slice(0, 3).map((m, idx) => {
                if (m.type === "paid_leave" || m.type === "unpaid_leave") return null;
                return /* @__PURE__ */ jsx("div", { className: `w-1.5 h-1.5 rounded-full transition-colors ${m.completed ? "bg-brand/30" : "bg-brand shadow-[0_0_4px_rgba(0,255,65,0.5)]"}` }, idx);
              }),
              dayMemos.filter((m) => m.type !== "paid_leave" && m.type !== "unpaid_leave").length > 3 && /* @__PURE__ */ jsx("div", { className: "w-1 h-1 rounded-full bg-brand/20" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: `text-base md:text-xl font-bold mb-0.5 transition-colors group-hover:text-brand ${isToday ? "text-primary" : "text-primary"}`, children: date }),
            isPaidLeave || isUnpaidLeave ? /* @__PURE__ */ jsx("span", { className: `text-[8px] md:text-[10px] font-bold leading-tight text-center truncate px-1 rounded-md border shadow-sm ${isPaidLeave ? "text-blue-500 bg-blue-500/10 border-blue-500/20" : "text-orange-500 bg-orange-500/10 border-orange-500/20"}`, children: label }) : holidayName ? /* @__PURE__ */ jsx("span", { className: "text-[8px] md:text-[10px] text-orange-500 font-bold leading-tight text-center truncate px-1 w-full max-w-[90%] bg-orange-500/10 rounded-md border border-orange-500/20", children: holidayName }) : isCustomWorkday ? /* @__PURE__ */ jsx("span", { className: "text-[8px] md:text-[10px] text-red-500 font-bold leading-tight text-center truncate px-1 bg-red-500/10 rounded-md border border-red-500/20 shadow-sm", children: label }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: `text-[9px] md:text-[11px] font-medium ${isToday ? "text-brand" : isRest ? "text-secondary/50" : "text-tertiary"}`, children: label }),
              dayMemos.length > 0 && completedCount === dayMemos.length && !isPaidLeave && !isUnpaidLeave && /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u2705" })
            ] })
          ]
        },
        date
      )
    );
  }
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-2 text-center", children: cells });
});
function FocusVisualizer({
  containerId,
  timeLeft,
  lengthMins,
  isActive
}) {
  const totalSecs = lengthMins * 60;
  const progress = 1 - timeLeft / totalSecs;
  const ratio = timeLeft / totalSecs;
  const isLast5Mins = timeLeft <= 300 && timeLeft > 0;
  const isDone = timeLeft === 0;
  let visual = null;
  const container = FOCUS_CONTAINERS.find((c) => c.id === containerId);
  if (containerId === "incense") {
    visual = /* @__PURE__ */ jsxs("div", { className: "relative w-6 h-40 flex flex-col justify-end items-center mx-auto", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "w-1.5 bg-gradient-to-t from-[#8E614A] to-[#D3A98F] rounded-t-full relative transition-[height] duration-1000 ease-linear shadow-[inset_0_0_2px_rgba(0,0,0,0.5)] overflow-visible",
          style: { height: `${Math.max(2, ratio * 100)}%` },
          children: (isActive || timeLeft !== totalSecs) && timeLeft > 0 && /* @__PURE__ */ jsx("div", { className: `absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse transition-colors duration-1000 ${isLast5Mins ? "bg-red-500 shadow-[0_0_12px_rgba(255,0,0,1)]" : "bg-gradient-to-r from-red-500 to-orange-400 shadow-[0_0_8px_rgba(255,165,0,0.8)]"}`, children: isActive && /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 0, scale: 0.8 },
              animate: { opacity: [0, isLast5Mins ? 0.8 : 0.5, 0], y: -50, scale: isLast5Mins ? 2 : 1.5, x: [0, -15, 20, -10] },
              transition: { duration: isLast5Mins ? 2 : 3, repeat: Infinity, ease: "linear" },
              className: `absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-12 blur-md rounded-full pointer-events-none ${isLast5Mins ? "bg-orange-500/30" : "bg-gray-300/40"}`
            },
            "smoke"
          ) })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: `w-1.5 absolute bottom-3 bg-[#A0A0A0] transition-[height] duration-1000 rounded-b opacity-80`, style: { height: `${progress * 100}%` } }),
      /* @__PURE__ */ jsx("div", { className: "w-16 h-3 bg-gradient-to-b from-[#555] to-[#333] rounded-b-xl border-t-2 border-[#fff]/10 shadow-[0_4px_10px_rgba(0,0,0,0.5)] shrink-0 z-10" }),
      /* @__PURE__ */ jsx("div", { className: "w-20 h-1 bg-black/20 blur-sm rounded-full mt-1" })
    ] });
  } else if (containerId === "candle") {
    visual = /* @__PURE__ */ jsxs("div", { className: "relative w-16 h-32 flex flex-col justify-end items-center mb-4", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "w-12 bg-gradient-to-b from-yellow-50 to-orange-100 rounded-t-xl transition-all duration-1000 ease-linear shadow-[inset_-2px_0_5px_rgba(0,0,0,0.1)] relative",
          style: { height: `${Math.max(20, ratio * 100)}%` },
          children: [
            isActive && timeLeft > 0 && /* @__PURE__ */ jsx(
              motion.div,
              {
                animate: { opacity: [0.8, 1, 0.8], scale: [0.9, 1.1, 0.9], y: [-2, 2, -2] },
                transition: { duration: 1, repeat: Infinity },
                className: "absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-full blur-[2px] opacity-80"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-gray-700/80 rounded-t-sm" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "w-16 h-2 bg-amber-800 rounded-b border-t border-amber-900 z-10 shrink-0" })
    ] });
  } else if (containerId === "coffee" || containerId === "ramen") {
    const isRamen = containerId === "ramen";
    visual = /* @__PURE__ */ jsxs("div", { className: "relative w-24 h-24 flex justify-center items-center mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: `text-6xl filter drop-shadow-xl ${progress === 0 ? "grayscale opacity-50" : ""}`, children: isRamen ? "\u{1F35C}" : "\u2615" }),
      (isActive || progress < 1) && progress > 0 && /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 0 },
          animate: { opacity: [0, progress * 0.6, 0], y: -30 - progress * 20, x: [0, 10, -5] },
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          className: "absolute top-0 left-1/2 -translate-x-1/2 w-4 h-12 bg-white/30 blur-md rounded-full pointer-events-none"
        }
      )
    ] });
  } else if (containerId === "cigarette") {
    visual = /* @__PURE__ */ jsxs("div", { className: "relative w-40 h-8 flex justify-end items-center mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute right-0 w-8 h-6 bg-orange-600/80 rounded-r-md border border-orange-800/20 shadow-inner" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-6 bg-[#f8f9fa] border-y border-gray-100 rounded-l-sm flex justify-start items-center transition-[width] duration-1000 ease-linear shadow-sm",
          style: { width: `${Math.max(10, progress * 100)}%` },
          children: (isActive || progress < 1) && progress > 0 && /* @__PURE__ */ jsx("div", { className: "w-1.5 h-6 bg-red-500 rounded-l-full shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-pulse relative", children: isActive && /* @__PURE__ */ jsx(
            motion.div,
            {
              initial: { opacity: 0, y: 0, x: 0, scale: 0.8 },
              animate: { opacity: [0, 0.4, 0], y: -40, x: -20, scale: 2 },
              transition: { duration: 3, repeat: Infinity, ease: "linear" },
              className: "absolute -top-2 -left-2 w-4 h-10 bg-gray-300/30 blur-md rounded-full pointer-events-none"
            }
          ) })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 h-2 mx-1 flex items-center justify-start opacity-30", children: [
        progress < 0.8 && /* @__PURE__ */ jsx("div", { className: "w-4 h-1.5 bg-gray-600 rounded blur-[1px]" }),
        progress < 0.5 && /* @__PURE__ */ jsx("div", { className: "w-6 h-1 bg-gray-700 rounded blur-[1px] ml-1" }),
        progress < 0.2 && /* @__PURE__ */ jsx("div", { className: "w-4 h-2 bg-gray-500 rounded blur-[1.5px] ml-1" })
      ] })
    ] });
  } else if (containerId === "ice") {
    visual = /* @__PURE__ */ jsxs("div", { className: "relative w-32 h-32 flex justify-center items-center mb-4", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-blue-100/40 backdrop-blur-md border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)] flex justify-center items-center transition-all duration-1000 ease-linear",
          style: {
            width: `${Math.max(20, progress * 100)}%`,
            height: `${Math.max(20, progress * 100)}%`,
            borderRadius: `${10 + (1 - progress) * 40}%`
          },
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-1/2 h-1/2 bg-white/30 rounded-full blur-sm absolute top-2 left-2" }),
            isActive && progress > 0 && /* @__PURE__ */ jsx(
              motion.div,
              {
                animate: { y: [0, 40], opacity: [1, 0] },
                transition: { duration: 2, repeat: Infinity, ease: "easeIn" },
                className: "absolute bottom-[-10px] w-2 h-2 bg-blue-200/60 rounded-full blur-[0.5px]"
              }
            )
          ]
        }
      ),
      progress < 1 && /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute -bottom-4 bg-blue-200/20 backdrop-blur-sm rounded-[100%] transition-all duration-1000",
          style: { width: `${60 + (1 - progress) * 40}%`, height: "20px" }
        }
      )
    ] });
  } else if (containerId === "sakura") {
    visual = /* @__PURE__ */ jsxs("div", { className: "relative w-32 h-40 flex justify-center items-end mb-4 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: `text-6xl absolute z-10 transition-opacity duration-1000 ${progress === 0 ? "opacity-20 grayscale" : "opacity-100"}`, children: "\u{1F338}" }),
      isActive && progress > 0 && Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: -40, x: (Math.random() - 0.5) * 40, rotate: 0 },
          animate: { opacity: [0, 1, 0], y: 60, x: (Math.random() - 0.5) * 60, rotate: 360 },
          transition: { duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 1.5 },
          className: "absolute z-20 text-sm text-pink-300 drop-shadow-sm pointer-events-none",
          children: "\u273F"
        },
        i
      )),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 w-full h-8 flex justify-center items-end gap-1 opacity-60", children: [
        progress < 0.8 && /* @__PURE__ */ jsx("span", { className: "text-xs text-pink-300 -rotate-12 translate-y-1", children: "\u273F" }),
        progress < 0.5 && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-pink-300 rotate-45 translate-y-2", children: "\u273F" }),
        progress < 0.2 && /* @__PURE__ */ jsx("span", { className: "text-xs text-pink-300 rotate-90 w-4 translate-x-2", children: "\u273F" })
      ] })
    ] });
  } else if (containerId === "moon") {
    visual = /* @__PURE__ */ jsx("div", { className: "relative w-40 h-40 flex justify-center items-center mb-4 border-b border-primary/10 overflow-hidden", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "absolute w-20 h-20 bg-yellow-100 rounded-full shadow-[0_0_30px_rgba(255,255,200,0.8)] flex justify-center items-center",
        style: {
          top: `${20 + (1 - progress) * 60}%`,
          left: `${10 + (1 - progress) * 80}%`,
          opacity: progress + 0.2
        },
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-6 h-6 bg-black/10 rounded-full absolute top-4 left-4 blur-[2px]" }),
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-black/5 rounded-full absolute bottom-4 right-2 blur-[1px]" })
        ]
      }
    ) });
  } else if (containerId === "campfire") {
    visual = /* @__PURE__ */ jsxs("div", { className: "relative w-32 h-32 flex justify-center items-end flex-col mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "relative w-full h-24 flex justify-center items-end mb-2", children: (isActive || progress < 1) && progress > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          motion.div,
          {
            animate: { height: [`${progress * 100}%`, `${progress * 80}%`, `${progress * 110}%`] },
            transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
            className: "absolute bottom-1 w-6 rounded-t-full bg-yellow-400 blur-[2px] opacity-80 mix-blend-screen"
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            animate: { height: [`${progress * 80}%`, `${progress * 120}%`, `${progress * 70}%`] },
            transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 },
            className: "absolute bottom-1 -left-2 w-8 rounded-t-full bg-orange-500 blur-[3px] opacity-90 mix-blend-screen"
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            animate: { height: [`${progress * 110}%`, `${progress * 70}%`, `${progress * 90}%`] },
            transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
            className: "absolute bottom-1 -right-2 w-8 rounded-t-full bg-red-500 blur-[4px] opacity-70 mix-blend-screen"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-16 h-8 flex justify-center items-center shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute w-14 h-4 bg-amber-900 rounded-sm rotate-12 border border-black/40 shadow-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-black/40 transition-opacity duration-1000", style: { opacity: 1 - progress } }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute w-14 h-4 bg-amber-800 rounded-sm -rotate-12 border border-black/40 shadow-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-black/40 transition-opacity duration-1000", style: { opacity: 1 - progress } }) }),
        (isActive || progress < 1) && progress > 0 && /* @__PURE__ */ jsx(
          motion.div,
          {
            animate: { opacity: [0.5, 1, 0.5] },
            transition: { duration: 2, repeat: Infinity },
            className: "absolute w-6 h-2 bg-orange-500 blur-[2px] rounded-full"
          }
        )
      ] })
    ] });
  } else {
    visual = /* @__PURE__ */ jsx("div", { className: "relative w-32 h-32 flex justify-center items-center mb-4", children: /* @__PURE__ */ jsx("div", { className: `text-7xl transition-all duration-1000 filter drop-shadow-xl ${progress === 0 ? "grayscale opacity-50" : ""}`, style: {
      transform: `scale(${0.8 + progress * 0.2}) translateY(${isActive ? Math.sin(progress * 100) * 5 : 0}px)`
    }, children: container.emoji }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full flex flex-col items-center justify-center min-h-[220px]", children: [
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-end justify-center mb-6 z-0", children: visual }),
    /* @__PURE__ */ jsxs("div", { className: "text-[3.5rem] font-mono font-bold text-primary tabular-nums tracking-tighter filter drop-shadow-lg z-10 leading-none", children: [
      pad0(Math.floor(timeLeft / 60)),
      ":",
      pad0(Math.floor(timeLeft % 60))
    ] })
  ] });
}
export default function App() {
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem("niuma_profiles");
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return [];
  });
  const [currentProfileName, setCurrentProfileName] = useState("");
  useEffect(() => {
    localStorage.setItem("niuma_profiles", JSON.stringify(profiles));
  }, [profiles]);
  const [isLightMode, setIsLightMode] = useState(() => {
    const saved = localStorage.getItem("isLightMode");
    return saved ? saved === "true" : true;
  });
  useEffect(() => {
    localStorage.setItem("isLightMode", isLightMode.toString());
    if (isLightMode) {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }, [isLightMode]);
  const [config, setConfig] = useState(() => {
    const defaultConfig = {
      monthlySalary: 25e3,
      holidayRegion: "CN",
      restDays: 2,
      // 2 for double rest, 1 for single
      hoursPerDay: 8,
      exchangeRateUsd: 6.8,
      joinDate: "2021-06-01",
      firstPayDate: "2021-07-05",
      payday: 5,
      startTime: "09:00",
      endTime: "18:00",
      hasLunchBreak: true,
      lunchStartTime: "12:00",
      lunchEndTime: "13:00",
      customEvents: [{ id: "1", name: "\u7EAA\u5FF5\u65E5", date: "2022-01-01", color: "purple" }],
      retirementDate: "2050-01-01",
      otherTimezone: "Asia/Ho_Chi_Minh",
      otherTimezoneLabel: "\u80E1\u5FD7\u660E",
      localTimezone: initialTz.value,
      localTimezoneLabel: initialTz.label,
      customItemName: "\u81EA\u5B9A\u4E49",
      customItemPrice: 100,
      pomodoroStartSound: "none",
      pomodoroEndSound: "bell",
      pomodoroBreakSound: "chime",
      avatarTheme: "default"
    };
    try {
      const savedConfig = localStorage.getItem("niuma_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        const merged = { ...defaultConfig, ...parsed || {} };
        if (!merged.customEvents && merged.customEventName) {
          merged.customEvents = [{ id: Math.random().toString(), name: merged.customEventName, date: merged.customEventDate || "2000-01-01", color: "purple" }];
        }
        return merged;
      }
    } catch (e) {
    }
    return defaultConfig;
  });
  useEffect(() => {
    localStorage.setItem("niuma_config", JSON.stringify(config));
  }, [config]);
  const [runtimeState] = useState(() => {
    try {
      const saved = localStorage.getItem("niuma_runtime_state");
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return null;
  });
  const todayStr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { timeZone: config.localTimezone });
  const isSameDay = runtimeState?.date === todayStr;
  const timeSinceLastTick = Math.max(0, (Date.now() - (runtimeState?.lastGlobalTick || Date.now())) / 1e3);
  const [dailyFortune, setDailyFortune] = useState(() => {
    try {
      const saved = localStorage.getItem("niuma_fortune");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayStr) return parsed.fortune;
      }
    } catch (e) {
    }
    return null;
  });
  const [fortuneModalOpen, setFortuneModalOpen] = useState(false);
  const drawFortune = useCallback(() => {
    if (dailyFortune) {
      setFortuneModalOpen(true);
      return;
    }
    const r = Math.floor(Math.random() * FORTUNES.length);
    const fortune = FORTUNES[r];
    setDailyFortune(fortune);
    setFortuneModalOpen(true);
    localStorage.setItem("niuma_fortune", JSON.stringify({ date: todayStr, fortune }));
  }, [todayStr, dailyFortune]);
  const [pomodoroContainer, setPomodoroContainer] = useState(() => localStorage.getItem("pomodoroContainer") || "incense");
  const [activeBgms, setActiveBgms] = useState(() => {
    try {
      const saved = localStorage.getItem("activeBgms");
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return [];
  });
  useEffect(() => localStorage.setItem("pomodoroContainer", pomodoroContainer), [pomodoroContainer]);
  useEffect(() => localStorage.setItem("activeBgms", JSON.stringify(activeBgms)), [activeBgms]);
  useEffect(() => {
    const allSupportedBgms = ["rain", "fire", "train", "ocean", "birds", "wind", "stream", "keyboard", "clock"];
    allSupportedBgms.forEach((bgm) => {
      if (activeBgms.includes(bgm)) {
        playNoise(bgm);
      } else {
        stopNoise(bgm);
      }
    });
  }, [activeBgms]);
  const [pomodoroLength, setPomodoroLength] = useState(() => runtimeState?.pomodoroLength ?? 25);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(() => {
    if (runtimeState?.pomodoroTimeLeft !== void 0) {
      if (runtimeState.isPomodoroActive) {
        return Math.max(0, runtimeState.pomodoroTimeLeft - timeSinceLastTick);
      }
      return runtimeState.pomodoroTimeLeft;
    }
    return 25 * 60;
  });
  const [isPomodoroActive, setIsPomodoroActive] = useState(() => {
    if (runtimeState?.isPomodoroActive && runtimeState?.pomodoroTimeLeft !== void 0) {
      return runtimeState.pomodoroTimeLeft - timeSinceLastTick > 0;
    }
    return false;
  });
  const [pomodoroTask, setPomodoroTask] = useState(() => runtimeState?.pomodoroTask ?? "");
  const [completedPomodoros, setCompletedPomodoros] = useState(() => runtimeState?.completedPomodoros ?? 0);
  const [visaEntries, setVisaEntries] = useState(() => {
    try {
      const saved = localStorage.getItem("visaEntries");
      if (saved) return JSON.parse(saved);
    } catch (e) {
    }
    return [];
  });
  const [showFinishedVisa, setShowFinishedVisa] = useState(true);
  useEffect(() => {
    localStorage.setItem("visaEntries", JSON.stringify(visaEntries));
  }, [visaEntries]);
  const [reminderText, setReminderText] = useState("\u8BE5\u6478\u4E00\u4F1A\u513F\u9C7C\u4E86\uFF0C\u4F11\u606F\u4E00\u4E0B\uFF01");
  const [reminderMins, setReminderMins] = useState(30);
  const [isReminderActive, setIsReminderActive] = useState(false);
  const [reminderTimeLeft, setReminderTimeLeft] = useState(30 * 60);
  const pomodoroTimeLeftRef = useRef(pomodoroTimeLeft);
  pomodoroTimeLeftRef.current = pomodoroTimeLeft;
  const isPomodoroActiveRef = useRef(isPomodoroActive);
  isPomodoroActiveRef.current = isPomodoroActive;
  const reminderTimeLeftRef = useRef(reminderTimeLeft);
  reminderTimeLeftRef.current = reminderTimeLeft;
  const isReminderActiveRef = useRef(isReminderActive);
  isReminderActiveRef.current = isReminderActive;
  const reminderMinsRef = useRef(reminderMins);
  reminderMinsRef.current = reminderMins;
  const reminderTextRef = useRef(reminderText);
  reminderTextRef.current = reminderText;
  const togglePomodoro = () => {
    if (!isPomodoroActive && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
      });
    }
    if (!isPomodoroActive) {
      playAlertSound(config.pomodoroStartSound);
    }
    setIsPomodoroActive(!isPomodoroActive);
  };
  const resetPomodoro = () => {
    setIsPomodoroActive(false);
    setPomodoroTimeLeft(pomodoroLength * 60);
  };
  const handlePomodoroLengthChange = (mins) => {
    setPomodoroLength(mins);
    setPomodoroTimeLeft(mins * 60);
    setIsPomodoroActive(false);
  };
  const [memos, setMemos] = useState(() => {
    try {
      const saved = localStorage.getItem("niuma_memos");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed || {};
      }
    } catch (e) {
    }
    return {};
  });
  useEffect(() => {
    localStorage.setItem("niuma_memos", JSON.stringify(memos));
  }, [memos]);
  const [selectedMemoDate, setSelectedMemoDate] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showAllCountdowns, setShowAllCountdowns] = useState(false);
  const [conversionTimeframe, setConversionTimeframe] = useState("today");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImgUrl, setShareImgUrl] = useState("");
  const shareRef = useRef(null);
  const [calendarDate, setCalendarDate] = useState(/* @__PURE__ */ new Date());
  const [now, setNow] = useState(/* @__PURE__ */ new Date());
  const localTime = useMemo(() => new Date(now.toLocaleString("en-US", { timeZone: config.localTimezone })), [now, config.localTimezone]);
  const initialLeaveDate = `${localTime.getFullYear()}-${(localTime.getMonth() + 1).toString().padStart(2, "0")}-${localTime.getDate().toString().padStart(2, "0")}`;
  const [leaveDateStr, setLeaveDateStr] = useState(initialLeaveDate);
  const generateShareImage = async () => {
    if (!shareRef.current) return;
    try {
      const canvas = await html2canvas(shareRef.current, { backgroundColor: null, scale: 2 });
      setShareImgUrl(canvas.toDataURL("image/png"));
      setShowShareModal(true);
    } catch (err) {
      console.error("Failed to generate sharing image:", err);
    }
  };
  const currentMonthWorkDays = useMemo(() => {
    return getWorkDaysInMonth(localTime.getFullYear(), localTime.getMonth(), config.holidayRegion, config.restDays);
  }, [localTime.getFullYear(), localTime.getMonth(), config.holidayRegion, config.restDays]);
  const hourlyRate = config.monthlySalary / (currentMonthWorkDays * config.hoursPerDay);
  const minuteRate = hourlyRate / 60;
  const secondRate = minuteRate / 60;
  const [isSlacking, setIsSlacking] = useState(() => isSameDay ? runtimeState?.isSlacking ?? false : false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3e3);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const handleMemoModalClose = useCallback(() => {
    setSelectedMemoDate(null);
  }, []);
  const handleMemoModalSave = useCallback((date, updatedMemos) => {
    setMemos((prev) => ({
      ...prev,
      [date]: updatedMemos
    }));
  }, []);
  const toggleLeaveType = useCallback((type) => {
    setMemos((prev) => {
      const prevMemos = prev[leaveDateStr] || [];
      const hasLeaveType = prevMemos.some((m) => m.type === type);
      let newMemos = prevMemos.filter((m) => !(m.type && m.type.includes("leave")));
      if (!hasLeaveType) {
        newMemos.unshift({
          id: "sys_leave_" + Date.now(),
          text: type === "paid_leave" ? "\u{1F31F} \u5E26\u85AA\u5047" : "\u{1F342} \u65E0\u85AA\u5047",
          type,
          completed: true
        });
      }
      return { ...prev, [leaveDateStr]: newMemos };
    });
  }, [leaveDateStr]);
  const handleDateClick = useCallback((key) => {
    setSelectedMemoDate(key);
  }, []);
  const [isOvertime, setIsOvertime] = useState(() => isSameDay ? runtimeState?.isOvertime ?? false : false);
  const [showMoney, setShowMoney] = useState(true);
  const [showUSD, setShowUSD] = useState(false);
  const [excuse, setExcuse] = useState("\u521A\u521A\u6211\u7684\u952E\u76D8\u5361\u4E3B\u4E86\uFF0C\u6211\u5728\u6D4B\u8BD5\u786C\u4EF6\u6297\u51B2\u51FB\u529B...");
  const generateExcuse = () => {
    const excuses = [
      "\u62A5\u544A\u8001\u677F\uFF0C\u6211\u7684\u952E\u76D8\u6B63\u5728\u8FDB\u884C\u7CFB\u7EDF\u7EA7\u7684\u81EA\u6211\u51C0\u5316\u3002",
      "\u6B63\u5728\u7B49npm\u88C5\u5305\uFF0C\u8FDB\u5EA6\u6761\u5361\u572899%\u5DF2\u7ECF\u5341\u5206\u949F\u4E86\u3002",
      "\u6211\u5728\u6D4B\u8BD5\u7CFB\u7EDF\u7684\u6297\u538B\u80FD\u529B\uFF0C\u987A\u4FBF\u7814\u7A76\u4E0B\u7F13\u5B58\u4E3A\u4EC0\u4E48\u6CA1\u5931\u6548\u3002",
      "\u521A\u624D\u95ED\u773C\u662F\u5728\u505A\u9700\u6C42\u53EF\u89C6\u5316\uFF0C\u7EDD\u4E0D\u662F\u5728\u6253\u76F9\u3002",
      "\u9886\u5BFC\uFF0C\u8FD9\u53EB\u654F\u6377\u5F00\u53D1\u4E2D\u7684\u2018\u6218\u7565\u6027\u505C\u987F\u2019\u3002",
      "\u4E0D\u662F\u5728\u53D1\u5446\uFF0C\u662F\u5728\u548C\u4EA7\u54C1\u7684\u7075\u9B42\u6DF1\u5207\u5BF9\u8BDD\uFF0C\u5BFB\u627E\u4E1A\u52A1\u75DB\u70B9\u3002",
      "\u773C\u775B\u5E72\u6DA9\uFF0C\u6B63\u5728\u6267\u884C\u533B\u5631\uFF1A\u773A\u671B\u8FDC\u65B920\u82F1\u5C3A\u591620\u79D2\u3002",
      "\u8FD9\u4E0D\u662F\u6478\u9C7C\uFF0C\u8FD9\u662F\u5728\u4E3A\u4E0B\u4E00\u884C\u80FD\u591F\u6539\u53D8\u4E16\u754C\u7684\u4EE3\u7801\u79EF\u6512\u7075\u611F\u3002",
      "\u6211\u5728\u601D\u8003\u5982\u4F55\u91CD\u6784\u5E95\u5C42\u7684\u5C4E\u5C71\u4EE3\u7801\uFF0C\u592A\u590D\u6742\u4E86\u8111\u58F3\u75BC\u3002",
      "\u6B63\u5728\u67E5\u9605\u884C\u4E1A\u524D\u6CBF\u8D44\u6599\uFF0C\u5206\u6790\u7ADE\u54C1\u7684\u6700\u65B0\u52A8\u6001\u3002",
      "\u521A\u624D\u5728\u60F3\u4E2D\u5348\u8DDF\u540C\u4E8B\u53BB\u5403\u54EA\u5BB6\u5BF9\u56E2\u961F\u5EFA\u8BBE\u6700\u6709\u5E2E\u52A9\u3002",
      "\u672C\u5730\u73AF\u5883\u5D29\u4E86\uFF0C\u6B63\u5728\u91CD\u65B0\u914D\uFF0C\u592A\u96BE\u4E86\uFF01",
      "\u521A\u624D\u5728\u5C1D\u8BD5\u901A\u8FC7\u91CF\u5B50\u7EA0\u7F20\u7684\u65B9\u5F0F\u8FDC\u7A0B\u4FEE\u590DBug\u3002",
      "\u6211\u5728\u89C2\u5BDF\u529E\u516C\u5BA4\u7684\u7A7A\u6C14\u52A8\u529B\u5B66\uFF0C\u4E3A\u4E86\u63D0\u9AD8\u5DE5\u4F4D\u6548\u7387\u3002",
      "\u6B63\u5728\u6DF1\u5EA6\u601D\u8003Carbon\u5728\u672A\u6765\u7684\u5730\u4F4D\u3002",
      "\u5176\u5B9E\u6211\u662F\u5728\u505A\u6DF1\u5EA6\u547C\u5438\u8BAD\u7EC3\uFF0C\u4EE5\u6B64\u964D\u4F4E\u670D\u52A1\u5668\u7684\u78B3\u6392\u653E\u3002",
      "\u521A\u624D\u90A3\u4E2A\u59FF\u52BF\u662F\u5728\u6A21\u4EFF\u7F57\u4E39\u7684\u2018\u601D\u8003\u8005\u2019\uFF0C\u8BD5\u56FE\u83B7\u5F97\u54F2\u5B66\u52A0\u6301\u3002",
      "\u6211\u53D1\u73B0\u4EE3\u7801\u91CC\u6709\u4E00\u4E2A\u903B\u8F91\u6F0F\u6D1E\uFF0C\u6B63\u5728\u8111\u6D77\u4E2D\u8DD1\u865A\u62DF\u673A\u6D4B\u8BD5\u3002",
      "\u6B63\u5728\u8BA1\u7B97\u516C\u53F8\u4E0A\u5E02\u540E\u6211\u624B\u91CC\u7684\u671F\u6743\u80FD\u4E70\u51E0\u65A4\u732A\u8089\u3002",
      "\u8001\u677F\uFF0C\u6211\u6B63\u5728\u7528\u610F\u5FF5\u4E0E\u670D\u52A1\u5668\u8FDB\u884C\u5E95\u5C42\u534F\u8BAE\u63E1\u624B\u3002",
      "\u8FD9\u4E0D\u53EB\u8FDF\u5230\uFF0C\u8FD9\u53EB\u2018\u5206\u5E03\u5F0F\u65F6\u5DEE\u529E\u516C\u2019\u3002",
      "\u6211\u5728\u7814\u7A76\u9ED1\u6D1E\uFF0C\u56E0\u4E3A\u6211\u611F\u89C9\u6211\u7684\u903B\u8F91\u88AB\u541E\u566C\u4E86\u3002",
      "\u521A\u624D\u662F\u5E7B\u89C9\uFF0C\u6211\u521A\u624D\u5176\u5B9E\u5728\u53E6\u4E00\u4E2A\u5E73\u884C\u5B87\u5B99\u5DF2\u7ECF\u5199\u5B8C\u9700\u6C42\u4E86\u3002",
      "\u6211\u5728\u6D4B\u8BD5\u9F20\u6807\u57AB\u7684\u6469\u64E6\u7CFB\u6570\uFF0C\u786E\u4FDD\u62D6\u52A8\u4EE3\u7801\u65F6\u7684\u6781\u81F4\u4E1D\u6ED1\u3002",
      "\u521A\u624D\u90A3\u4E2A\u773C\u795E\u662F\u5728\u626B\u63CF\u529E\u516C\u5BA4\u7684\u5B89\u5168\u6F0F\u6D1E\u3002",
      "\u6B63\u5728\u7B49\u5F85\u5B87\u5B99\u5C04\u7EBF\u7684\u5E72\u6270\u6D88\u5931\uFF0C\u5426\u5219\u4EE3\u7801\u4F1A\u4EA7\u751F\u4F4D\u7FFB\u8F6C\u3002",
      "\u6211\u5728\u901A\u8FC7\u5FC3\u8DF3\u9891\u7387\u5224\u65AD\u4EE3\u7801\u7684\u8FD0\u884C\u6548\u7387\u3002",
      "\u521A\u624D\u95ED\u773C\u662F\u5728\u8DDFAI\u8D3E\u7EF4\u65AF\u7075\u9B42\u6C9F\u901A\u3002",
      "\u8FD9\u4E0D\u53EB\u5077\u61D2\uFF0C\u8FD9\u53EB\u7ED9CPU\u964D\u9891\u4EE5\u5EF6\u957F\u4F01\u4E1A\u8D44\u4EA7\u5BFF\u547D\u3002",
      "\u6211\u6B63\u5728\u8FDB\u884C\u8BED\u4E49\u5206\u6790\uFF0C\u8BD5\u56FE\u7406\u89E3\u4EA7\u54C1\u7ECF\u7406\u90A3\u53E5\u2018\u7B80\u5355\u6539\u4E0B\u2019\u80CC\u540E\u7684\u542B\u4E49\u3002",
      "\u6211\u5728\u8DDF\u684C\u4E0A\u7684\u6A61\u76AE\u9E2D\u89E3\u91CA\u4E3A\u4F55\u8FD9\u6BB5\u4EE3\u7801\u5B83\u5C31\u662F\u8DD1\u4E0D\u901A\u3002",
      "\u6B63\u5728\u7B49\u5496\u5561\u673A\u7684\u8FDB\u5EA6\u6761\uFF0C\u90A3\u624D\u662F\u6211\u7684\u751F\u547D\u503C\u8FDB\u5EA6\u6761\u3002",
      "\u521A\u624D\u662F\u5728\u6D4B\u8BD5\u529E\u516C\u5BA4\u7684\u9694\u97F3\u6548\u679C\u3002",
      "\u6211\u5728\u601D\u8003\u5982\u679C\u4EBA\u7C7B\u706D\u7EDD\u4E86\uFF0C\u8FD9\u6BB5\u4EE3\u7801\u8FD8\u80FD\u4E0D\u80FD\u7EE7\u7EED\u8FD0\u884C\u4E0B\u53BB\u3002",
      "\u6211\u5728\u8FDB\u884C\u2018\u79BB\u6563\u6570\u5B66\u4EA4\u4E92\u6F14\u4E60\u2019\u3002",
      "\u521A\u624D\u90A3\u4E2A\u54C8\u6B20\u662F\u5728\u6392\u51FA\u5927\u8111\u591A\u4F59\u7684\u5197\u4F59\u6570\u636E\u3002",
      "\u8001\u677F\uFF0C\u6211\u5728\u7ED9\u4EE3\u7801\u505A\u5FC3\u7406\u8F85\u5BFC\uFF0C\u5B83\u6700\u8FD1\u6709\u70B9\u6297\u62D2\u751F\u4EA7\u73AF\u5883\u3002",
      "\u6211\u5728\u7814\u7A76\u5982\u4F55\u75285G\u4FE1\u53F7\u63A7\u5236\u6211\u7684\u5348\u9910\u5916\u5356\u3002",
      "\u521A\u624D\u4F4E\u5934\u662F\u5728\u611F\u53F9\u4EBA\u751F\u5982\u620F\uFF0C\u5168\u662FBug\u3002",
      "\u6211\u5728\u5BFB\u627E\u4EE3\u7801\u4E2D\u7684\u2018\u827A\u672F\u611F\u2019\u3002",
      "\u6B63\u5728\u8FDB\u884C\u9AD8\u5F3A\u5EA6\u7684\u8111\u673A\u63A5\u53E3\u6D4B\u8BD5\u3002",
      "\u8FD9\u53EB\u2018\u5185\u7701\u5F0F\u5F00\u53D1\u2019\uFF0C\u5728\u5B89\u9759\u4E2D\u5BFB\u627E\u903B\u8F91\u7684\u771F\u8C1B\u3002",
      "\u6211\u5728\u4E3A\u4E0B\u4E2A\u5B63\u5EA6\u7684KPI\u63D0\u524D\u62C5\u5FE7\uFF0C\u5BFC\u81F4\u7126\u8651\u6027\u505C\u5DE5\u3002",
      "\u6B63\u5728\u8BD5\u56FE\u7528\u2018\u539F\u529B\u2019\u4FEE\u590D\u90A3\u6BB5\u8BE5\u6B7B\u7684\u65E7\u4EE3\u7801\u3002",
      "\u8001\u677F\uFF0C\u6211\u6B63\u5728\u8BD5\u56FE\u7A81\u7834\u7531\u4E8E\u8FC7\u5EA6\u5DE5\u4F5C\u9020\u6210\u7684\u7EF4\u5EA6\u969C\u58C1\u3002",
      "\u6211\u5728\u601D\u8003\u5982\u4F55\u628A\u8FD9\u4E2A\u9879\u76EE\u505A\u6210\u5143\u5B87\u5B99\u6A21\u5F0F\u3002",
      "\u521A\u624D\u5176\u5B9E\u662F\u5728\u5BF9\u4EE3\u7801\u8FDB\u884C\u2018\u65E0\u58F0\u7684\u6297\u8BAE\u2019\u3002",
      "\u6211\u5728\u4F30\u7B97\u5982\u679C\u6211\u73B0\u5728\u8DF3\u69FD\uFF0C\u516C\u53F8\u7684\u635F\u5931\u4F1A\u6709\u591A\u5927\u3002",
      "\u6211\u5728\u8BD5\u56FE\u7406\u89E3\u4EBA\u7C7B\u5B58\u5728\u7684\u610F\u4E49\uFF0C\u987A\u4FBF\u5199\u4E2AHello World\u3002",
      "\u6211\u5728\u8DDF\u7A7A\u8C03\u7684\u98CE\u5411\u8FDB\u884C\u6597\u4E89\u3002",
      "\u6B63\u5728\u8DDF\u81EA\u5DF1\u7684\u5F71\u5B50\u5BF9\u9700\u6C42\u3002",
      "\u521A\u624D\u662F\u7075\u9B42\u51FA\u7A8D\uFF0C\u53BB\u5DE1\u67E5\u4E86\u4E00\u4E0B\u673A\u623F\u3002",
      "\u6211\u5728\u7EC3\u4E60\u5982\u4F55\u7528\u773C\u795E\u6740\u6389\u4E00\u4E2ABug\u3002",
      "\u8FD9\u53EB\u2018\u610F\u8BC6\u6D41\u7F16\u7801\u2019\uFF0C\u6211\u6B63\u5728\u79EF\u6512\u6D41\u91CF\u3002"
    ];
    setExcuse(excuses[Math.floor(Math.random() * excuses.length)]);
  };
  const [slackSecondsToday, setSlackSecondsToday] = useState(() => {
    if (isSameDay) {
      let base = runtimeState?.slackSecondsToday || 0;
      if (runtimeState?.isSlacking) base += timeSinceLastTick;
      return base;
    }
    return 0;
  });
  const [overtimeSecondsToday, setOvertimeSecondsToday] = useState(() => {
    if (isSameDay) {
      let base = runtimeState?.overtimeSecondsToday || 0;
      if (runtimeState?.isOvertime) base += timeSinceLastTick;
      return base;
    }
    return 0;
  });
  useEffect(() => {
    const d = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { timeZone: config.localTimezone });
    localStorage.setItem("niuma_runtime_state", JSON.stringify({
      date: d,
      slackSecondsToday,
      overtimeSecondsToday,
      isSlacking,
      isOvertime,
      pomodoroTimeLeft,
      pomodoroLength,
      isPomodoroActive,
      pomodoroTask,
      completedPomodoros,
      lastGlobalTick: Date.now()
    }));
  }, [config.localTimezone, slackSecondsToday, overtimeSecondsToday, isSlacking, isOvertime, pomodoroTimeLeft, pomodoroLength, isPomodoroActive, pomodoroTask, completedPomodoros]);
  const otherTime = new Date(now.toLocaleString("en-US", { timeZone: config.otherTimezone }));
  const lunar = Solar.fromDate(localTime).getLunar();
  const lunarDateStr = `\u519C\u5386${lunar.getMonthInChinese()}\u6708${lunar.getDayInChinese()} ${lunar.getYearInGanZhi()}\u5E74`;
  const getSecondsFromMidnight = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 3600 + (m || 0) * 60;
  };
  const nowSecs = localTime.getHours() * 3600 + localTime.getMinutes() * 60 + localTime.getSeconds();
  const startSecs = getSecondsFromMidnight(config.startTime);
  const endSecs = getSecondsFromMidnight(config.endTime);
  const lunchStartSecs = getSecondsFromMidnight(config.lunchStartTime);
  const lunchEndSecs = getSecondsFromMidnight(config.lunchEndTime);
  const isPublicHoliday = useMemo(() => {
    return isDateCustomHoliday(localTime, config.holidayRegion);
  }, [localTime, config.holidayRegion]);
  const isMakeUpWorkday = useMemo(() => {
    return isDateCustomWorkday(localTime, config.holidayRegion);
  }, [localTime, config.holidayRegion]);
  const memoTodayStr = `${localTime.getFullYear()}-${(localTime.getMonth() + 1).toString().padStart(2, "0")}-${localTime.getDate().toString().padStart(2, "0")}`;
  const todayMemos = (memos || {})[memoTodayStr] || [];
  const isTodayPaidLeave = todayMemos.some((m) => m.type === "paid_leave");
  const isTodayUnpaidLeave = todayMemos.some((m) => m.type === "unpaid_leave");
  const todayDay = localTime.getDay();
  const isWeekend = config.restDays === 2 && (todayDay === 0 || todayDay === 6) || config.restDays === 1 && todayDay === 0;
  const isHolidayOrWeekend = (isWeekend || isPublicHoliday) && !isMakeUpWorkday;
  const isRestDay = isHolidayOrWeekend || isTodayPaidLeave || isTodayUnpaidLeave;
  let restTypeLabel = "\u5468\u672B\u4F11\u606F";
  const todayHolidayName = getCustomHolidayName(localTime, config.holidayRegion);
  if (isTodayPaidLeave) {
    restTypeLabel = "\u5E26\u85AA\u4F11\u5047";
  } else if (isTodayUnpaidLeave) {
    restTypeLabel = "\u65E0\u85AA\u4F11\u5047";
  } else if (todayHolidayName) {
    restTypeLabel = `${todayHolidayName}\u5047\u671F`;
  }
  const isLunchBreak = config.hasLunchBreak && nowSecs >= lunchStartSecs && nowSecs < lunchEndSecs;
  const isCurrentlyWorkingTime = !isRestDay && nowSecs >= startSecs && nowSecs < endSecs && !isLunchBreak;
  let autoWorkSecs = 0;
  if (!isRestDay && nowSecs > startSecs) {
    autoWorkSecs = Math.min(nowSecs, endSecs) - startSecs;
    if (config.hasLunchBreak) {
      if (nowSecs > lunchStartSecs) {
        autoWorkSecs -= Math.min(nowSecs, lunchEndSecs) - lunchStartSecs;
      }
    }
  } else if (isTodayPaidLeave) {
    if (nowSecs > startSecs) {
      autoWorkSecs = Math.min(nowSecs, endSecs) - startSecs;
      if (config.hasLunchBreak && nowSecs > lunchStartSecs) {
        autoWorkSecs -= Math.min(nowSecs, lunchEndSecs) - lunchStartSecs;
      }
    }
  }
  const workSecondsToday = Math.max(0, autoWorkSecs);
  const workerRef = useRef(null);
  const lastGlobalTickRef = useRef(Date.now());
  const isSlackingRef = useRef(isSlacking);
  const isOvertimeRef = useRef(isOvertime);
  const configRef = useRef(config);
  isSlackingRef.current = isSlacking;
  isOvertimeRef.current = isOvertime;
  configRef.current = config;
  useEffect(() => {
    lastGlobalTickRef.current = Date.now();
    const code = `
      let interval;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          interval = setInterval(() => self.postMessage('tick'), 1000);
        } else if (e.data === 'stop') {
          clearInterval(interval);
        }
      };
    `;
    const blob = new Blob([code], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;
    const handleTick = () => {
      const current = Date.now();
      const deltaSecs = (current - lastGlobalTickRef.current) / 1e3;
      const lastDateStr = new Date(lastGlobalTickRef.current).toLocaleDateString("en-US", { timeZone: configRef.current.localTimezone });
      const currDateStr = new Date(current).toLocaleDateString("en-US", { timeZone: configRef.current.localTimezone });
      lastGlobalTickRef.current = current;
      setNow(new Date(current));
      if (lastDateStr !== currDateStr) {
        setSlackSecondsToday(0);
        setOvertimeSecondsToday(0);
      } else {
        if (isSlackingRef.current) {
          setSlackSecondsToday((prev) => prev + deltaSecs);
        }
        if (isOvertimeRef.current) {
          setOvertimeSecondsToday((prev) => prev + deltaSecs);
        }
      }
      if (isPomodoroActiveRef.current && pomodoroTimeLeftRef.current > 0) {
        const nextTime = pomodoroTimeLeftRef.current - deltaSecs;
        if (nextTime <= 0) {
          setPomodoroTimeLeft(0);
          setIsPomodoroActive(false);
          setCompletedPomodoros((prev) => prev + 1);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("\u756A\u8304\u949F\u5B8C\u6210", { body: "\u65F6\u95F4\u5230\uFF0C\u4F11\u606F\u4E00\u4E0B\u5427\uFF01" });
          }
          playAlertSound(configRef.current.pomodoroEndSound);
        } else {
          setPomodoroTimeLeft(nextTime);
        }
      }
      if (isReminderActiveRef.current && reminderTimeLeftRef.current > 0) {
        const nextTime = reminderTimeLeftRef.current - deltaSecs;
        if (nextTime <= 0) {
          setReminderTimeLeft(reminderMinsRef.current * 60);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("\u5B9A\u65F6\u63D0\u9192", { body: reminderTextRef.current });
          }
          playAlertSound(configRef.current.pomodoroBreakSound);
        } else {
          setReminderTimeLeft(nextTime);
        }
      }
    };
    worker.onmessage = handleTick;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleTick();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    worker.postMessage("start");
    return () => {
      worker.postMessage("stop");
      worker.terminate();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
  const earnedToday = workSecondsToday * secondRate;
  const slackLoss = slackSecondsToday * secondRate;
  const overtimeLoss = overtimeSecondsToday * secondRate;
  const sym = showUSD ? "$" : "\xA5";
  const ex = showUSD ? config.exchangeRateUsd : 1;
  const hide = (val) => showMoney ? val : "****";
  let totalUnpaidLeaves = 0;
  let unpaidLeavesThisYear = 0;
  let unpaidLeavesThisMonth = 0;
  const currentMonthPrefix = `${localTime.getFullYear()}-${(localTime.getMonth() + 1).toString().padStart(2, "0")}`;
  const currentYearPrefix = `${localTime.getFullYear()}-`;
  const todayVal = `${localTime.getFullYear()}${(localTime.getMonth() + 1).toString().padStart(2, "0")}${localTime.getDate().toString().padStart(2, "0")}`;
  Object.keys(memos || {}).forEach((key) => {
    const keyVal = key.replace(/-/g, "");
    if (keyVal <= todayVal) {
      const dayMemos = memos[key];
      if (Array.isArray(dayMemos) && dayMemos.some((m) => m.type === "unpaid_leave")) {
        totalUnpaidLeaves++;
        if (key.startsWith(currentYearPrefix)) {
          unpaidLeavesThisYear++;
        }
        if (key.startsWith(currentMonthPrefix)) {
          unpaidLeavesThisMonth++;
        }
      }
    }
  });
  const joinDateObj = new Date(config.joinDate);
  const firstPayObj = new Date(config.firstPayDate || config.joinDate);
  const monthsWorked = (localTime.getFullYear() - joinDateObj.getFullYear()) * 12 + localTime.getMonth() - joinDateObj.getMonth();
  const monthsPaid = Math.max(0, (localTime.getFullYear() - firstPayObj.getFullYear()) * 12 + localTime.getMonth() - firstPayObj.getMonth());
  const dailyDeduction = config.monthlySalary / 30;
  const totalEarnedBeforeToday = Math.max(0, monthsPaid * config.monthlySalary - totalUnpaidLeaves * dailyDeduction);
  const daysInMonth = new Date(localTime.getFullYear(), localTime.getMonth() + 1, 0).getDate();
  const pastWorkDaysThisMonth = getWorkDaysInMonth(localTime.getFullYear(), localTime.getMonth(), config.holidayRegion, config.restDays, Math.max(0, localTime.getDate() - 1));
  const earnedThisMonth = Math.max(0, pastWorkDaysThisMonth * (config.monthlySalary / (currentMonthWorkDays || 1)) + earnedToday - unpaidLeavesThisMonth * dailyDeduction);
  const hoursThisMonth = Math.max(0, pastWorkDaysThisMonth * config.hoursPerDay + workSecondsToday / 3600);
  let monthsThisYear = localTime.getMonth();
  if (joinDateObj.getFullYear() === localTime.getFullYear()) {
    monthsThisYear = Math.max(0, localTime.getMonth() - joinDateObj.getMonth());
  }
  const earnedThisYear = Math.max(0, monthsThisYear * config.monthlySalary + earnedThisMonth - (unpaidLeavesThisYear - unpaidLeavesThisMonth) * dailyDeduction);
  const displayEarned = conversionTimeframe === "today" ? earnedToday : conversionTimeframe === "month" ? earnedThisMonth : earnedThisYear;
  const daysThisWeek = localTime.getDay() === 0 ? 7 : localTime.getDay();
  const earnedThisWeek = Math.max(0, config.monthlySalary / daysInMonth * Math.max(0, daysThisWeek - 1) + earnedToday);
  const effectiveWorkThisWeek = Math.max(0, (daysThisWeek - 1) * config.hoursPerDay * 0.85 + (workSecondsToday - slackSecondsToday) / 3600);
  const slackThisWeek = Math.max(0, (daysThisWeek - 1) * config.hoursPerDay * 0.15 + slackSecondsToday / 3600);
  const bestDayEarned = Math.max(earnedToday, config.monthlySalary / daysInMonth);
  const weekDaysStr = ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"];
  const bestDayStr = weekDaysStr[localTime.getDay()];
  const offWorkSecs = Math.max(0, endSecs - nowSecs);
  const paydayObj = new Date(localTime.getFullYear(), localTime.getMonth(), config.payday);
  if (localTime.getDate() > config.payday) {
    paydayObj.setMonth(paydayObj.getMonth() + 1);
  }
  const daysToPayday = localTime.getDate() === config.payday ? 0 : Math.ceil((paydayObj.getTime() - localTime.getTime()) / (1e3 * 3600 * 24));
  let daysToNextRestDay = 1;
  let nextRestDayObj = new Date(localTime);
  nextRestDayObj.setDate(localTime.getDate() + 1);
  for (let i = 0; i < 30; i++) {
    const dayDay = nextRestDayObj.getDay();
    const isWknd = config.restDays === 2 && (dayDay === 0 || dayDay === 6) || config.restDays === 1 && dayDay === 0;
    const isMakeUp = isDateCustomWorkday(nextRestDayObj, config.holidayRegion);
    const isHol = isDateCustomHoliday(nextRestDayObj, config.holidayRegion);
    const nextMemoStr = `${nextRestDayObj.getFullYear()}-${(nextRestDayObj.getMonth() + 1).toString().padStart(2, "0")}-${nextRestDayObj.getDate().toString().padStart(2, "0")}`;
    const nextMemos = (memos || {})[nextMemoStr] || [];
    const isNextPaid = nextMemos.some((m) => m.type === "paid_leave");
    const isNextUnpaid = nextMemos.some((m) => m.type === "unpaid_leave");
    if ((isWknd || isHol) && !isMakeUp || isNextPaid || isNextUnpaid) {
      break;
    }
    nextRestDayObj.setDate(nextRestDayObj.getDate() + 1);
    daysToNextRestDay++;
  }
  const customDateObj = new Date(config.customEventDate);
  const daysToCustom = Math.ceil((customDateObj.getTime() - localTime.getTime()) / (1e3 * 3600 * 24));
  const retireDateObj = new Date(config.retirementDate);
  const daysToRetire = Math.ceil((retireDateObj.getTime() - localTime.getTime()) / (1e3 * 3600 * 24));
  let isSelectedLeaveDateNaturalRest = false;
  let selectedLeaveDateLabel = "";
  if (leaveDateStr) {
    const tDate = new Date(leaveDateStr);
    if (!isNaN(tDate.getTime())) {
      const dDay = tDate.getDay();
      const isWknd = config.restDays === 2 && (dDay === 0 || dDay === 6) || config.restDays === 1 && dDay === 0;
      const isHolStr = getCustomHolidayName(tDate, config.holidayRegion);
      const isHol = isDateCustomHoliday(tDate, config.holidayRegion);
      const isMakeUp = isDateCustomWorkday(tDate, config.holidayRegion);
      isSelectedLeaveDateNaturalRest = (isWknd || isHol) && !isMakeUp;
      if (isSelectedLeaveDateNaturalRest) {
        selectedLeaveDateLabel = isHolStr ? `${isHolStr}\u5047\u671F\uFF0C\u65E0\u9700\u8BF7\u5047` : `\u5468\u672B\u4F11\u606F\u65E5\uFF0C\u65E0\u9700\u8BF7\u5047`;
      }
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full min-h-[100dvh] md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-app text-primary font-sans overflow-x-hidden pb-24 md:pb-0 relative flex flex-col transition-colors duration-300 md:shadow-2xl md:my-4 md:rounded-3xl border-x md:border-y border-app duration-500", children: [
    activeTab === "home" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto no-scrollbar pb-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-8 pt-6 pb-2 flex flex-col gap-4 max-w-5xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center justify-between gap-2 pb-2 mt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 md:gap-3 shrink-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-brand/20 via-card to-brand/5 border border-brand/30 flex items-center justify-center text-brand shadow-[0_0_20px_rgba(0,255,65,0.25)] shrink-0 relative overflow-hidden", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" }),
              /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "relative z-10 drop-shadow-md", children: [
                /* @__PURE__ */ jsx("polygon", { points: "12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" }),
                /* @__PURE__ */ jsx("line", { x1: "12", y1: "22", x2: "12", y2: "15.5" }),
                /* @__PURE__ */ jsx("polyline", { points: "22 8.5 12 15.5 2 8.5" }),
                /* @__PURE__ */ jsx("polyline", { points: "2 15.5 12 8.5 22 15.5" }),
                /* @__PURE__ */ jsx("line", { x1: "12", y1: "2", x2: "12", y2: "8.5" }),
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "1.5", className: "fill-brand stroke-brand" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center shrink-0", children: [
              /* @__PURE__ */ jsxs("h1", { className: "text-lg md:text-[22px] font-bold tracking-tight text-primary leading-none mb-1.5 flex items-center gap-2", children: [
                "TimeMeter",
                /* @__PURE__ */ jsx("span", { className: "text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-mono font-medium border border-brand/20 hidden md:inline-flex", children: "BETA" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[9px] md:text-[10px] text-brand/90 font-mono uppercase tracking-[0.2em] font-bold leading-none", children: "Pay Per Sec" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 md:gap-3 bg-card-inner/60 backdrop-blur-md pl-2 md:pl-4 pr-1.5 md:pr-2 py-1 md:py-1.5 rounded-2xl border border-app shadow-sm min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-right truncate", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-[10px] md:text-sm font-semibold text-primary mb-0.5 flex items-center gap-1 md:gap-2 justify-end truncate", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-[9px] md:text-xs text-secondary font-medium hidden md:inline-block", children: [
                  "\u5468",
                  ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"][localTime.getDay()]
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
                  localTime.getFullYear(),
                  "-",
                  String(localTime.getMonth() + 1).padStart(2, "0"),
                  "-",
                  String(localTime.getDate()).padStart(2, "0")
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-[8px] md:text-[10px] text-secondary/80 font-medium tracking-wide truncate mt-0.5 md:mt-0", children: lunarDateStr })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-[1px] h-6 md:h-7 bg-app block mx-0.5 md:mx-1 shrink-0" }),
            /* @__PURE__ */ jsxs("button", { onClick: drawFortune, className: "w-7 h-7 md:w-8 md:h-8 bg-card rounded-xl border border-app shadow-inner text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative group shrink-0", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-brand/5 group-hover:bg-brand/10 transition-colors rounded-xl" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm md:text-base relative z-10 group-hover:scale-110 transition-transform", children: "\u{1F960}" }),
              !dailyFortune && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card animate-pulse" })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setIsLightMode(!isLightMode), className: "w-7 h-7 md:w-8 md:h-8 bg-card rounded-xl border border-app shadow-inner text-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-brand shrink-0", children: isLightMode ? /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 group-hover:rotate-45 transition-transform", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" }) }) : /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5 md:w-4 md:h-4 text-brand group-hover:-rotate-12 transition-transform", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2.5, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" }) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-[24px] p-5 border border-app shadow-2xl relative overflow-hidden mb-2 group", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none group-hover:bg-brand/10 transition-colors duration-500" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-card-inner/30 to-transparent pointer-events-none" }),
          /* @__PURE__ */ jsxs("div", { className: "w-full flex-col flex gap-2 relative z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end pl-1 mb-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-[11px] font-bold text-tertiary uppercase tracking-widest", children: [
                /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full border-[2px] border-brand shadow-[0_0_5px_rgba(0,255,65,0.5)]" }),
                "\u4ECA\u65E5\u8FDB\u5EA6\u6807\u5C3A"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-1 font-mono", children: [
                /* @__PURE__ */ jsx("span", { className: "text-brand font-black text-lg tracking-tighter drop-shadow-[0_0_8px_rgba(0,255,65,0.4)] leading-none mt-1", children: isRestDay ? "100" : nowSecs < startSecs ? "0" : nowSecs > endSecs ? "100" : `${(workSecondsToday / Math.max(1, endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0)) * 100).toFixed(1)}` }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-brand/80 font-bold mb-[2px]", children: "%" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative pt-6 pb-1", children: [
              /* @__PURE__ */ jsx("div", { className: "h-4 bg-[#141414] rounded-full overflow-hidden border border-app shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] relative", children: /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "absolute top-0 left-0 h-full bg-gradient-to-r from-[#00cc33] via-[#00FF41] to-[#e4ff00] transition-all duration-1000 ease-linear",
                  style: { width: `${nowSecs < startSecs ? 0 : nowSecs > endSecs ? 100 : workSecondsToday / Math.max(1, endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0)) * 100}%` },
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-20", style: { backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 8px)" } }),
                    /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute top-0 transform -translate-x-1/2 -translate-y-2.5 transition-all duration-1000 ease-linear z-20",
                  style: { left: `${nowSecs < startSecs ? 0 : nowSecs > endSecs ? 100 : workSecondsToday / Math.max(1, endSecs - startSecs - (config.hasLunchBreak ? lunchEndSecs - lunchStartSecs : 0)) * 100}%` },
                  children: /* @__PURE__ */ jsxs("div", { className: "bg-card border-2 border-brand text-[22px] w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,65,0.4)] relative bg-gradient-to-br from-card to-card-inner", children: [
                    /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 text-[9px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-sm transform -rotate-12 animate-pulse", children: "!" }),
                    isRestDay ? "\u{1F3D6}\uFE0F" : nowSecs < startSecs ? "\u{1F634}" : nowSecs > endSecs ? "\u{1F389}" : isLunchBreak ? "\u{1F35A}" : "\u{1F3C3}"
                  ] })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-tertiary/60 font-mono mt-3 px-2 font-medium", children: [
                /* @__PURE__ */ jsx("span", { children: config.startTime }),
                config.hasLunchBreak && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5 text-orange-500/60 relative -mt-1.5 group-hover:text-orange-500 transition-colors", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[8px] bg-orange-500/10 px-1.5 py-0.5 rounded-sm", children: "\u5348\u4F11\u671F\u95F4" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    config.lunchStartTime,
                    " - ",
                    config.lunchEndTime
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { children: config.endTime })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-3 border border-app flex flex-row items-center justify-between relative shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col relative w-1/2 overflow-hidden", children: [
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "absolute top-0 left-0 w-24 h-full opacity-0 cursor-pointer appearance-none z-10",
                value: config.localTimezone,
                onChange: (e) => {
                  const tz = TIMEZONES.find((t) => t.value === e.target.value);
                  if (tz) setConfig({ ...config, localTimezone: tz.value, localTimezoneLabel: tz.short });
                },
                children: TIMEZONES.map((t) => /* @__PURE__ */ jsx("option", { value: t.value, children: t.label }, t.value))
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary mb-0.5 flex items-center gap-1 group", children: [
              config.localTimezoneLabel,
              "\u65F6\u95F4 ",
              /* @__PURE__ */ jsx("span", { className: "transform rotate-90 text-[8px] opacity-70 group-hover:opacity-100 mix-blend-screen transition-opacity", children: "\u25B8" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-mono text-brand font-semibold leading-none drop-shadow-[0_0_8px_rgba(0,255,65,0.4)]", children: [
              pad0(localTime.getHours()),
              ":",
              pad0(localTime.getMinutes()),
              ":",
              pad0(localTime.getSeconds())
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-[9px] text-primary/40 mt-1 truncate max-w-[80%]", children: config.localTimezone.split("/")[1] || config.localTimezone })
          ] }),
          /* @__PURE__ */ jsx(RefreshCw, { size: 14, className: "text-primary/20 mx-1 shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end text-right relative w-1/2 overflow-hidden", children: [
            /* @__PURE__ */ jsx(
              "select",
              {
                className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10",
                value: config.otherTimezone,
                onChange: (e) => {
                  const tz = TIMEZONES.find((t) => t.value === e.target.value);
                  if (tz) setConfig({ ...config, otherTimezone: tz.value, otherTimezoneLabel: tz.short });
                },
                children: TIMEZONES.map((t) => /* @__PURE__ */ jsx("option", { value: t.value, children: t.label }, t.value))
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary mb-0.5 flex items-center justify-end w-full gap-1 group", children: [
              config.otherTimezoneLabel,
              "\u65F6\u95F4 ",
              /* @__PURE__ */ jsx("span", { className: "transform rotate-90 text-[8px] opacity-70 group-hover:opacity-100 mix-blend-screen transition-opacity", children: "\u25B8" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-mono text-primary font-medium leading-none", children: [
              pad0(otherTime.getHours()),
              ":",
              pad0(otherTime.getMinutes()),
              ":",
              pad0(otherTime.getSeconds())
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-[9px] text-primary/40 mt-1 truncate max-w-[80%] text-right float-right", children: config.otherTimezone.split("/")[1] || config.otherTimezone })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-4 md:px-8 py-2 max-w-5xl mx-auto w-full", children: /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-full px-3 py-2 text-xs flex items-center justify-between border border-app", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-yellow-500/80 truncate pr-2", children: [
          /* @__PURE__ */ jsx("span", { children: "\u{1F4E2}" }),
          /* @__PURE__ */ jsxs("span", { className: "truncate", children: [
            "\u8DDD\u79BB\u53D1\u5DE5\u8D44\u8FD8\u6709 ",
            daysToPayday,
            " \u5929\uFF0C\u518D\u575A\u6301\u4E00\u4E0B\uFF01\u{1F4AA}"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-secondary cursor-pointer whitespace-nowrap relative shrink-0", onClick: () => {
          const input = document.getElementById("native-calendar");
          if (input && "showPicker" in input) {
            try {
              input.showPicker();
            } catch (e) {
              input.focus();
            }
          } else if (input) {
            input.click();
          }
        }, children: [
          /* @__PURE__ */ jsx("span", { children: "\u67E5\u770B\u65E5\u5386" }),
          /* @__PURE__ */ jsx(CalendarIcon, { size: 12 }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0", onClick: () => setActiveTab("calendar") })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-8 py-2 flex flex-col gap-3 md:gap-5 max-w-5xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 md:gap-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "w-[140px] md:w-[180px] rounded-[32px] bg-card border-[1.5px] border-app p-4 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-24 h-24 bg-brand/10 blur-2xl rounded-full mix-blend-screen pointer-events-none" }),
            /* @__PURE__ */ jsxs("div", { className: "relative w-24 h-24 mb-3 drop-shadow-[0_0_10px_rgba(0,255,65,0.2)] shrink-0", children: [
              /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 w-full h-full transform -rotate-90", viewBox: "0 0 100 100", children: [
                /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: "46", fill: "none", stroke: "currentColor", className: "text-app-strong", strokeWidth: "2", strokeDasharray: "1 4" }),
                /* @__PURE__ */ jsx("g", { className: "origin-center animate-[spin_10s_linear_infinite]", children: /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: "46", fill: "none", stroke: "currentColor", className: "text-brand/40", strokeWidth: "2", strokeDasharray: "20 40 10 20", strokeLinecap: "round" }) }),
                /* @__PURE__ */ jsx("g", { className: "origin-center animate-[spin_15s_linear_infinite_reverse]", children: /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: "38", fill: "none", stroke: "currentColor", className: "text-brand/20", strokeWidth: "1", strokeDasharray: "5 15", strokeLinecap: "round" }) }),
                /* @__PURE__ */ jsx(
                  "circle",
                  {
                    cx: "50",
                    cy: "50",
                    r: "46",
                    fill: "none",
                    stroke: "url(#cow_gradient)",
                    strokeWidth: "4",
                    strokeDasharray: 289,
                    strokeDashoffset: 289 * (1 - workSecondsToday / Math.max(1, endSecs - startSecs)),
                    className: "transition-all duration-1000 ease-linear",
                    strokeLinecap: "round"
                  }
                ),
                /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "cow_gradient", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [
                  /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#00FF41" }),
                  /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#00cc33" })
                ] }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center", children: /* @__PURE__ */ jsx(
                NiumaAvatar,
                {
                  activeTheme: config.avatarTheme || "default",
                  workSeconds: workSecondsToday,
                  slackSeconds: slackSecondsToday,
                  overtimeSeconds: overtimeSecondsToday,
                  nowSecs,
                  endSecs
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center z-10 w-full mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: `text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block ${isRestDay ? "text-primary bg-blue-500/10" : nowSecs < startSecs ? "text-secondary bg-secondary/10" : nowSecs > endSecs ? "text-brand bg-brand/10" : isLunchBreak ? "text-orange-500 bg-orange-500/10" : "text-primary bg-primary/10"}`, children: isRestDay ? `${restTypeLabel} \u2728` : nowSecs < startSecs ? "\u8FD8\u6CA1\u4E0A\u73ED" : nowSecs > endSecs ? "\u5DF2\u7ECF\u4E0B\u73ED" : isLunchBreak ? "\u5348\u4F11\u5E72\u996D \u{1F35A}" : "\u725B\u9A6C\u8FDB\u884C\u4E2D \u26A1\uFE0F" }),
              /* @__PURE__ */ jsxs("div", { className: "text-[18px] font-mono font-bold tracking-tight text-primary/90", children: [
                pad0(Math.floor(workSecondsToday / 3600)),
                ":",
                pad0(Math.floor(workSecondsToday % 3600 / 60)),
                ":",
                pad0(workSecondsToday % 60)
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full mb-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-card-inner rounded-xl p-1.5 border border-app text-center", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-tertiary block mb-0.5", children: "\u725B\u9A6C\u6307\u6570" }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-primary", children: isRestDay ? "\u{1F3D6}\uFE0F \u5E78\u798F\u8EBA\u5E73\u4E2D" : nowSecs < startSecs ? "\u{1F634} \u7EED\u547D\u7761\u7720\u4E2D" : nowSecs >= endSecs ? "\u{1F389} \u7075\u9B42\u5F52\u4F4D" : isLunchBreak ? "\u{1F60B} \u80FD\u91CF\u8865\u7ED9\u4E2D" : workSecondsToday / Math.max(1, endSecs - startSecs) > 0.9 ? "\u{1F480} \u5F7B\u5E95\u75AF\u72C2" : workSecondsToday / Math.max(1, endSecs - startSecs) > 0.7 ? "\u{1F92F} \u9010\u6E10\u66B4\u8E81" : workSecondsToday / Math.max(1, endSecs - startSecs) > 0.4 ? "\u{1F50B} \u7535\u91CF\u8FC7\u534A" : workSecondsToday / Math.max(1, endSecs - startSecs) > 0.2 ? "\u{1F914} \u9677\u5165\u6C89\u601D" : "\u2615\uFE0F \u80FD\u91CF\u56DE\u6536\u4E2D" })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "w-full py-2 rounded-xl flex flex-col items-center justify-center font-black uppercase tracking-tighter bg-card border-none", children: /* @__PURE__ */ jsx("span", { className: `text-xs ${isRestDay ? "text-primary" : nowSecs < startSecs ? "text-secondary" : nowSecs > endSecs ? "text-brand" : isLunchBreak ? "text-orange-500" : "text-primary"}`, children: isRestDay ? `${restTypeLabel}\u6109\u5FEB \u{1F3D6}\uFE0F` : nowSecs < startSecs ? "\u7B49\u5F85\u6253\u5DE5" : nowSecs > endSecs ? "\u4E0B\u73ED\u5566 \u2728" : isLunchBreak ? "\u5E72\u996D\u5566 \u{1F35A}" : "\u6B63\u5728\u725B\u9A6C \u26A1\uFE0F" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 rounded-[32px] bg-gradient-to-b from-card to-card-inner border-[1.5px] border-app p-5 flex flex-col shadow-2xl justify-between relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-secondary mb-2", children: [
                /* @__PURE__ */ jsx("span", { children: "\u4ECA\u65E5\u5DF2\u8D5A" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("button", { onClick: () => setShowUSD(!showUSD), className: `text-[9px] px-1.5 py-0.5 rounded border transition-colors ${showUSD ? "border-brand text-brand" : "border-app-strong text-secondary hover:text-primary"}`, children: "USD" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setShowMoney(!showMoney), className: "text-tertiary hover:text-primary", children: showMoney ? /* @__PURE__ */ jsx(Eye, { size: 14 }) : /* @__PURE__ */ jsx(EyeOff, { size: 14 }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-brand text-xl font-mono opacity-80", children: sym }),
                /* @__PURE__ */ jsx(
                  motion.span,
                  {
                    initial: { opacity: 0.8, y: 2 },
                    animate: { opacity: 1, y: 0 },
                    className: "text-4xl md:text-5xl font-mono font-bold text-brand tracking-tighter leading-none",
                    children: hide(formatMoney(earnedToday / ex))
                  },
                  earnedToday
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 mt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-card-inner rounded-xl p-2.5 flex items-center justify-between border border-app", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] text-tertiary mb-0.5", children: "\u672C\u6708\u5DF2\u8D5A\uFF08\u9884\u4F30\uFF09" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-primary font-mono text-xs", children: [
                    sym,
                    " ",
                    hide(formatMoney(earnedThisMonth / ex))
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand", children: "\u{1F4B0}" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-card-inner rounded-xl p-2.5 flex items-center justify-between border border-app", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[9px] text-tertiary mb-0.5", children: "\u672C\u6708\u5DE5\u65F6" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-primary font-mono text-xs", children: [
                    hoursThisMonth.toFixed(1),
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary", children: "h" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400", children: /* @__PURE__ */ jsx(TrendingUp, { size: 12 }) })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-3 border border-app flex items-center justify-between shadow-lg px-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-secondary", children: "\u5386\u53F2\u7D2F\u8BA1\u5DF2\u8D5A (\u4F30\u7B97)" }),
          /* @__PURE__ */ jsxs("span", { className: "text-primary font-mono text-sm tracking-tight", children: [
            sym,
            " ",
            hide(formatMoney((totalEarnedBeforeToday + earnedThisMonth) / ex))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-4 md:px-8 py-2 mt-2 max-w-5xl mx-auto w-full", children: /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-3 border border-app flex flex-col shadow-lg", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "appearance-none bg-transparent text-[11px] text-secondary font-medium outline-none cursor-pointer hover:text-primary transition-colors pr-4 relative",
              style: { background: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' width='12' height='12' xmlns='http://www.w3.org/2000/svg'><path fill='gray' d='M7 10l5 5 5-5z'/></svg>") no-repeat right center` },
              value: conversionTimeframe,
              onChange: (e) => setConversionTimeframe(e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "today", children: "\u4ECA\u65E5\u6536\u5165\u6362\u7B97 & \u8D2D\u4E70\u529B" }),
                /* @__PURE__ */ jsx("option", { value: "month", children: "\u672C\u6708\u6536\u5165\u6362\u7B97 & \u8D2D\u4E70\u529B" }),
                /* @__PURE__ */ jsx("option", { value: "year", children: "\u672C\u5E74\u6536\u5165\u6362\u7B97 & \u8D2D\u4E70\u529B" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] bg-primary/5 text-primary/80 px-2 py-1 flex items-center rounded-full hover:bg-primary/10 border border-app transition-colors cursor-pointer", onClick: generateShareImage, children: "\u{1F4F8} \u5206\u4EAB" }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] bg-brand/10 text-brand px-2 py-1 flex items-center rounded-full gap-1 border border-brand/20 shadow-sm cursor-pointer", onClick: () => setShowUSD(!showUSD), children: "\u53CC\u5E01\u5C55\u793A" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 mb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner rounded-xl p-3 border border-app flex flex-col items-center justify-center relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary mb-1 tracking-wider", children: "\u4EBA\u6C11\u5E01 (CNY)" }),
            /* @__PURE__ */ jsxs("span", { className: "text-brand font-mono text-2xl font-bold tracking-tight", children: [
              "\xA5",
              hide(formatMoney(displayEarned))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner rounded-xl p-3 border border-app flex flex-col items-center justify-center relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary mb-1 tracking-wider", children: "\u7F8E\u5143 (USD)" }),
            /* @__PURE__ */ jsxs("span", { className: "text-primary font-mono text-2xl font-bold tracking-tight", children: [
              "$",
              hide(formatMoney(displayEarned / config.exchangeRateUsd))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex overflow-x-auto no-scrollbar gap-2 pb-1", children: [
          /* @__PURE__ */ jsx(ConversionCard, { icon: /* @__PURE__ */ jsx("span", { className: "text-xl filter drop-shadow-md", children: "\u{1F9CB}" }), label: "\u5976\u8336", value: hide((displayEarned / MILK_TEA_PRICE).toFixed(1)), unit: "\u676F", color: "text-orange-300" }),
          /* @__PURE__ */ jsx(ConversionCard, { icon: /* @__PURE__ */ jsx("span", { className: "text-xl filter drop-shadow-md", children: "\u2615\uFE0F" }), label: "\u5496\u5561", value: hide((displayEarned / COFFEE_PRICE).toFixed(1)), unit: "\u676F", color: "text-amber-400" }),
          /* @__PURE__ */ jsx(ConversionCard, { icon: /* @__PURE__ */ jsx("span", { className: "text-xl filter drop-shadow-md", children: "\u26FD\uFE0F" }), label: "\u6C7D\u6CB9", value: hide((displayEarned / GAS_PRICE).toFixed(1)), unit: "L", color: "text-red-400" }),
          /* @__PURE__ */ jsx(ConversionCard, { icon: /* @__PURE__ */ jsx("span", { className: "text-xl filter drop-shadow-md", children: "\u{1F4F1}" }), label: "iPhone", value: hide((displayEarned / IPHONE_PRICE * 100).toFixed(2)), unit: "%", color: "text-blue-300" }),
          /* @__PURE__ */ jsx(ConversionCard, { icon: /* @__PURE__ */ jsx("span", { className: "text-xl filter drop-shadow-md", children: "\u2728" }), label: config.customItemName, value: hide((displayEarned / config.customItemPrice).toFixed(2)), unit: "\u4E2A", color: "text-purple-400" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-8 py-2 max-w-5xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3 text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary font-medium", children: "\u5012\u8BA1\u65F6" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-tertiary cursor-pointer flex items-center", onClick: () => setShowAllCountdowns(true), children: [
            "\u5168\u90E8 ",
            /* @__PURE__ */ jsx(ChevronRight, { size: 12 })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 overflow-x-auto no-scrollbar pb-2 snaps-x", children: [
          /* @__PURE__ */ jsx(
            CountdownCard,
            {
              title: "\u4E0B\u73ED\u5012\u8BA1\u65F6",
              time: `${pad0(Math.floor(offWorkSecs / 3600))}:${pad0(Math.floor(offWorkSecs % 3600 / 60))}:${pad0(offWorkSecs % 60)}`,
              desc: `${config.endTime}\u4E0B\u73ED`,
              progress: 100 - offWorkSecs / (config.hoursPerDay * 3600) * 100,
              icon: /* @__PURE__ */ jsx(Briefcase, { size: 16 }),
              color: "green"
            }
          ),
          /* @__PURE__ */ jsx(
            CountdownCard,
            {
              title: isRestDay ? "\u8DDD\u79BB\u4E0B\u4E2A\u4F11\u606F\u65E5" : "\u8DDD\u79BB\u4F11\u606F\u65E5",
              time: `${daysToNextRestDay} \u5929`,
              desc: "\u76FC\u671B\u597D\u65E5\u5B50",
              progress: 100 - daysToNextRestDay / 7 * 100,
              icon: /* @__PURE__ */ jsx(CalendarIcon, { size: 16 }),
              color: "yellow"
            }
          ),
          /* @__PURE__ */ jsx(
            CountdownCard,
            {
              title: "\u8DDD\u79BB\u53D1\u85AA\u65E5",
              time: `${daysToPayday} \u5929`,
              desc: `${config.payday}\u53F7\u53D1\u85AA`,
              progress: 100 - daysToPayday / daysInMonth * 100,
              icon: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u{1F4B0}" }),
              color: "amber"
            }
          ),
          (config.customEvents || []).map((evt) => {
            const evtDateObj = new Date(evt.date);
            const daysToEvt = Math.ceil((evtDateObj.getTime() - localTime.getTime()) / (1e3 * 3600 * 24));
            return /* @__PURE__ */ jsx(
              CountdownCard,
              {
                title: evt.name,
                time: daysToEvt < 0 ? `\u5DF2\u8FC7\u53BB ${Math.abs(daysToEvt)} \u5929` : `${daysToEvt} \u5929`,
                desc: evtDateObj.toLocaleDateString(),
                progress: daysToEvt < 0 ? 100 : Math.max(0, 100 - daysToEvt / 365 * 100),
                icon: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u2B50" }),
                color: evt.color || "purple"
              },
              evt.id
            );
          }),
          /* @__PURE__ */ jsx(
            CountdownCard,
            {
              title: "\u8DDD\u79BB\u9000\u4F11",
              time: `${daysToRetire}\u5929`,
              desc: retireDateObj.toLocaleDateString(),
              progress: daysToRetire < 0 ? 100 : Math.max(0, 100 - daysToRetire / (365 * 30) * 100),
              icon: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u{1FA91}" }),
              color: "red"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "px-4 md:px-8 py-2 max-w-5xl mx-auto w-full", children: /* @__PURE__ */ jsxs("div", { className: "bg-card-inner rounded-2xl border border-app shadow-sm p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs md:text-sm font-bold text-primary flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u2708\uFE0F" }),
            " \u8BF7\u5047\u64CD\u4F5C\u677F"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              value: leaveDateStr,
              onChange: (e) => setLeaveDateStr(e.target.value),
              className: "text-[10px] md:text-xs bg-card border border-app rounded text-secondary px-2 py-1 outline-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-3 w-full", children: isSelectedLeaveDateNaturalRest ? /* @__PURE__ */ jsxs("div", { className: "w-full text-center py-4 bg-primary/5 rounded-xl text-primary/80 text-xs tracking-wider font-medium", children: [
          "\u6240\u9009\u65E5\u671F\u662F",
          selectedLeaveDateLabel,
          " \u{1F389}"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => toggleLeaveType("paid_leave"), className: `flex-1 flex max-w-sm flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all shadow-sm ${((memos || {})[leaveDateStr] || []).some((m) => m.type === "paid_leave") ? "bg-blue-500/10 border-blue-500/40 text-blue-500 font-bold" : "bg-card border-app text-secondary hover:bg-card-inner hover:text-primary"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xl", children: "\u{1F31F}" }),
              ((memos || {})[leaveDateStr] || []).some((m) => m.type === "paid_leave") && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-blue-500", children: "\u2705" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] md:text-xs tracking-wider mt-1", children: "\u5E26\u85AA\u5047" })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => toggleLeaveType("unpaid_leave"), className: `flex-1 flex max-w-sm flex-col items-center justify-center gap-1 py-3 rounded-xl border transition-all shadow-sm ${((memos || {})[leaveDateStr] || []).some((m) => m.type === "unpaid_leave") ? "bg-orange-500/10 border-orange-500/40 text-orange-500 font-bold" : "bg-card border-app text-secondary hover:bg-card-inner hover:text-primary"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xl", children: "\u{1F342}" }),
              ((memos || {})[leaveDateStr] || []).some((m) => m.type === "unpaid_leave") && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-orange-500", children: "\u2705" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] md:text-xs tracking-wider mt-1", children: "\u65E0\u85AA\u5047" })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "px-4 md:px-8 py-2 mt-2 mb-8 flex flex-col gap-3 max-w-5xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 border border-app flex items-center relative overflow-hidden shadow-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 mr-3 relative z-10 flex items-center justify-center filter drop-shadow-lg text-4xl", children: "\u{1F41F}" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-primary font-medium", children: "\u4ECA\u65E5\u6478\u9C7C" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg font-mono font-bold text-brand", children: Math.floor(slackSecondsToday / 60) }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary", children: "\u5206\u949F" }),
              /* @__PURE__ */ jsx("button", { onClick: () => setSlackSecondsToday(0), className: "text-[9px] px-1.5 py-0.5 bg-card-inner border border-app rounded text-secondary hover:text-primary ml-1", children: "\u5F52\u96F6" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary font-mono", children: [
              "\u2248 \u767D\u8D5A ",
              /* @__PURE__ */ jsxs("span", { className: "text-brand font-semibold text-[12px]", children: [
                sym,
                hide(formatMoney(slackLoss / ex))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `z-10 ml-2 px-3 py-1.5 text-[11px] rounded-full border flex items-center gap-1 transition-colors ${isSlacking ? "bg-brand hover:opacity-90 text-app border-transparent" : "bg-card-inner hover:bg-app text-primary border-app-strong"}`,
              onClick: () => {
                if (!isSlacking && !isCurrentlyWorkingTime) {
                  setToast({ message: "\u5F53\u524D\u975E\u5DE5\u4F5C\u65F6\u95F4\uFF0C\u4F60\u5728\u81EA\u613F\u52A0\u73ED\u5417\uFF1F\u4E0D\u7B97\u6478\u9C7C\u54E6\uFF01", type: "info" });
                  return;
                }
                setIsSlacking(!isSlacking);
              },
              children: isSlacking ? "\u6B63\u5728\u6478\u9C7C\u4E2D..." : "\u5F00\u59CB\u6478\u9C7C"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 border border-red-500/20 flex items-center relative overflow-hidden shadow-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 mr-3 relative z-10 flex items-center justify-center filter drop-shadow-lg text-4xl", children: "\u{1F3E2}" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 z-10", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-red-500/80 font-medium", children: "\u4E49\u52A1\u52A0\u73ED" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg font-mono font-bold text-red-500", children: Math.floor(overtimeSecondsToday / 60) }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary", children: "\u5206\u949F" }),
              /* @__PURE__ */ jsx("button", { onClick: () => setOvertimeSecondsToday(0), className: "text-[9px] px-1.5 py-0.5 bg-red-500/10 rounded text-red-500 hover:bg-red-500/20 ml-1", children: "\u5F52\u96F6" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary font-mono", children: [
              "\u2248 \u635F\u5931 ",
              /* @__PURE__ */ jsxs("span", { className: "text-red-500 font-semibold text-[12px]", children: [
                sym,
                hide(formatMoney(overtimeLoss / ex))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `z-10 ml-2 px-3 py-1.5 text-[11px] rounded-full border flex items-center gap-1 transition-colors ${isOvertime ? "bg-red-500 hover:bg-red-600 text-primary border-transparent" : "bg-card-inner hover:bg-app text-red-500/80 border-app-strong"}`,
              onClick: () => setIsOvertime(!isOvertime),
              children: isOvertime ? "\u6B63\u5728\u52A0\u73ED\u4E2D..." : "\u5F00\u59CB\u52A0\u73ED"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 border border-app shadow-lg relative overflow-hidden flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 z-10", children: [
            /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-xs", children: "\u{1F916}" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-300 font-medium", children: "\u4E00\u952E\u751F\u6210\u6478\u9C7C\u8BDD\u672F" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner p-3 rounded-xl border border-app min-h-[60px] text-[13px] text-primary z-10 font-medium leading-relaxed shadow-inner break-words", children: [
            '"',
            excuse,
            '"'
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: generateExcuse,
              className: "w-full py-2.5 mt-1 rounded-xl bg-card-inner hover:bg-app border border-app text-[11px] text-secondary font-bold transition-colors z-10",
              children: "\u6362\u4E2A\u501F\u53E3\u88AB\u8001\u677F\u6293\u5230\u4E86"
            }
          )
        ] })
      ] })
    ] }),
    activeTab === "data" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6 space-y-4 pb-24 max-w-5xl mx-auto w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-primary mb-1", children: "\u725B\u9A6C\u6570\u636E\u4E2D\u5FC3" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-tertiary", children: "\u638C\u63E1\u8FDB\u5EA6\uFF0C\u5408\u7406\u89C4\u5212\u6478\u9C7C\u4E0E\u79BB\u804C\u65F6\u523B\u3002" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setShowUSD(!showUSD), className: `text-[10px] px-2 py-1 rounded border transition-colors ${showUSD ? "border-brand text-brand" : "border-app-strong text-secondary hover:text-primary"}`, children: "USD" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowMoney(!showMoney), className: "text-secondary hover:text-primary p-1 rounded-full bg-card-inner border border-app", children: showMoney ? /* @__PURE__ */ jsx(Eye, { size: 16 }) : /* @__PURE__ */ jsx(EyeOff, { size: 16 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-5 border border-app shadow-xl space-y-4 relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-primary", children: "\u672C\u6708\u641E\u94B1\u8FDB\u5EA6" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-2 mt-2", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-3xl font-mono text-brand font-bold tracking-tight", children: [
              sym,
              " ",
              hide(formatMoney(earnedThisMonth / ex))
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-tertiary mb-1.5 font-mono", children: [
              "/ ",
              sym,
              " ",
              hide(formatMoney(config.monthlySalary / ex))
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 h-2.5 bg-card-inner rounded-full overflow-hidden border border-app", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gradient-to-r from-teal-500 to-[#00FF41] rounded-full shadow-[0_0_10px_rgba(0,255,65,0.5)]", style: { width: `${Math.min(100, earnedThisMonth / config.monthlySalary * 100)}%` } }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-tertiary mt-2 font-mono", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "\u5DF2\u7ED3\u7B97\u8FDB\u5EA6: ",
              (earnedThisMonth / config.monthlySalary * 100).toFixed(2),
              "%"
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "\u5269\u4F59: ",
              sym,
              " ",
              hide(formatMoney((config.monthlySalary - earnedThisMonth) / ex))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 pt-3 border-t border-app relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner p-3 rounded-xl border border-app flex flex-col justify-center shadow-inner", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(TrendingUp, { size: 10 }),
              " \u5386\u53F2\u603B\u8BA1\u603B\u6536\u5165\u4F30\u7B97"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-primary tracking-tight", children: [
              sym,
              " ",
              hide(formatMoney((totalEarnedBeforeToday + earnedThisMonth) / ex))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner p-3 rounded-xl border border-app flex flex-col justify-center shadow-inner", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Briefcase, { size: 10 }),
              " \u7D2F\u8BA1\u5949\u732E\u9752\u6625\u5929\u6570"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-primary", children: [
              Math.floor(monthsWorked * currentMonthWorkDays + localTime.getDate()),
              " \u5929"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner p-3 rounded-xl border border-brand/10 flex flex-col justify-center shadow-inner", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F41F}" }),
              " \u672C\u6708\u6478\u9C7C\u603B\u6536\u76CA"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-brand font-bold", children: [
              sym,
              " ",
              hide(formatMoney(slackLoss * (localTime.getDate() * 0.7) / ex))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner p-3 rounded-xl border border-red-500/10 flex flex-col justify-center shadow-inner", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F3E2}" }),
              " \u672C\u6708\u4E49\u52A1\u52A0\u73ED\u9001\u94B1"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-red-500 font-bold", children: [
              sym,
              " ",
              hide(formatMoney(overtimeLoss * (localTime.getDate() * 0.8) / ex))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-2 bg-gradient-to-r from-card to-card-inner p-3 rounded-xl border border-app flex justify-between items-center shadow-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-tertiary flex items-center gap-1 mb-0.5", children: "\u{1F4B0} \u7CBE\u786E\u65F6\u85AA\u6298\u7B97" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-primary", children: [
                sym,
                " ",
                hide(formatMoney(hourlyRate / ex)),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-[9px] text-secondary", children: "/\u5C0F\u65F6" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-tertiary flex justify-end items-center gap-1 mb-0.5", children: "\u{1F451} \u5168\u56FD\u725B\u9A6C\u51FB\u8D25\u7387" }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-brand", children: [
                Math.min(99.9, Math.max(1, config.monthlySalary / 1e4 * 80)).toFixed(1),
                "%"
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-card rounded-2xl p-5 border border-app shadow-xl space-y-4 relative overflow-hidden mt-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-primary mb-3", children: "\u{1F4CA} \u65F6\u95F4\u4EF7\u503C\u62A5\u544A (\u5468\u62A5)" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner p-3 rounded-xl border border-brand/20 flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-tertiary mb-1", children: "\u672C\u5468\u6478\u9C7C\u6536\u76CA" }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-brand font-bold", children: [
              sym,
              " ",
              hide(formatMoney(slackThisWeek * hourlyRate / ex))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner p-3 rounded-xl border border-app flex flex-col justify-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-tertiary mb-1", children: "\u672C\u5468\u6700\u8D5A\u94B1\u4E00\u5929" }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-mono text-primary tracking-tight", children: [
              bestDayStr,
              " (",
              sym,
              hide(formatMoney(bestDayEarned / ex)),
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 bg-card-inner p-3 rounded-xl border border-app shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-1 text-[10px]", children: [
            /* @__PURE__ */ jsx("span", { className: "text-tertiary", children: "\u65F6\u95F4\u5206\u914D" }),
            /* @__PURE__ */ jsxs("span", { className: "text-secondary font-mono", children: [
              "\xA5 ",
              hide(formatMoney(hourlyRate / ex)),
              "/h"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "w-full h-3 flex rounded-full overflow-hidden border border-app", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-brand transition-all", style: { width: `${effectiveWorkThisWeek / (effectiveWorkThisWeek + slackThisWeek || 1) * 100}%` } }),
            /* @__PURE__ */ jsx("div", { className: "bg-app-strong transition-all", style: { width: `${slackThisWeek / (effectiveWorkThisWeek + slackThisWeek || 1) * 100}%` } })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] mt-1", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-brand", children: [
              "\u6709\u6548\u8FD9\u5468 ",
              effectiveWorkThisWeek.toFixed(1),
              "h"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-tertiary", children: [
              "\u6478\u9C7C ",
              slackThisWeek.toFixed(1),
              "h"
            ] })
          ] })
        ] })
      ] }) })
    ] }),
    activeTab === "profile" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-8 space-y-4 pb-24 max-w-5xl mx-auto w-full", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-primary", children: "\u725B\u9A6C\u8BBE\u7F6E\u4E2D\u5FC3" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary mb-4", children: "\u7CBE\u51C6\u7684\u53C2\u6570\u624D\u80FD\u7B97\u51FA\u7CBE\u51C6\u7684\u6478\u9C7C\u6536\u76CA\u3002" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-brand/5 border border-brand/20 rounded-2xl p-4 mb-4 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0", children: /* @__PURE__ */ jsx(RefreshCw, { size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-brand mb-0.5", children: "\u9690\u79C1\u4FDD\u62A4" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-secondary", children: "\u4F60\u7684\u65F6\u95F4\u6709\u4EF7\u503C\uFF0C\u4F60\u7684\u6570\u636E\u4E5F\u4E00\u6837\u3002\u6240\u6709\u4FE1\u606F\u4EC5\u5B58\u4E8E\u672C\u5730\uFF0C\u6536\u5165\u53EA\u6709\u4F60\u81EA\u5DF1\u77E5\u9053\u3002" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-5 border border-app space-y-5 shadow-lg", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u6BCF\u6708\u7A0E\u540E\u85AA\u8D44 (\u4EBA\u6C11\u5E01)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-brand font-mono text-base focus:border-brand focus:outline-none transition-colors",
              value: config.monthlySalary === 0 ? "" : config.monthlySalary,
              onChange: (e) => setConfig({ ...config, monthlySalary: e.target.value === "" ? 0 : Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u516C\u5171\u5047\u671F\u5730\u533A" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors",
                value: config.holidayRegion,
                onChange: (e) => setConfig({ ...config, holidayRegion: e.target.value }),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "CN", children: "\u{1F1E8}\u{1F1F3} \u4E2D\u56FD\u5185\u5730" }),
                  /* @__PURE__ */ jsx("option", { value: "HK", children: "\u{1F1ED}\u{1F1F0} \u4E2D\u56FD\u9999\u6E2F" }),
                  /* @__PURE__ */ jsx("option", { value: "TH", children: "\u{1F1F9}\u{1F1ED} \u6CF0\u56FD" }),
                  /* @__PURE__ */ jsx("option", { value: "VN", children: "\u{1F1FB}\u{1F1F3} \u8D8A\u5357" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u4F11\u606F\u65E5\u8BBE\u7F6E" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors",
                value: config.restDays,
                onChange: (e) => setConfig({ ...config, restDays: Number(e.target.value) }),
                children: [
                  /* @__PURE__ */ jsx("option", { value: 2, children: "\u53CC\u4F11 (\u5468\u672B)" }),
                  /* @__PURE__ */ jsx("option", { value: 1, children: "\u5355\u4F11 (\u5468\u65E5)" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u6BCF\u65E5\u5DE5\u4F5C\u65F6\u957F (\u5C0F\u65F6)" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "0.5",
              className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
              value: config.hoursPerDay === 0 ? "" : config.hoursPerDay,
              onChange: (e) => setConfig({ ...config, hoursPerDay: e.target.value === "" ? 0 : Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u53D1\u85AA\u65E5 (\u6BCF\u6708X\u53F7)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.payday === 0 ? "" : config.payday,
                onChange: (e) => setConfig({ ...config, payday: e.target.value === "" ? 0 : Number(e.target.value) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u5165\u804C\u65F6\u95F4" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.joinDate,
                onChange: (e) => setConfig({ ...config, joinDate: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u9996\u6B21\u53D1\u85AA\u65F6\u95F4" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.firstPayDate || config.joinDate,
                onChange: (e) => setConfig({ ...config, firstPayDate: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u6C47\u7387 (USD/CNY)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.exchangeRateUsd === 0 ? "" : config.exchangeRateUsd,
                onChange: (e) => setConfig({ ...config, exchangeRateUsd: e.target.value === "" ? 0 : Number(e.target.value) })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u725B\u9A6C\u4E2A\u6027\u5316\u5F62\u8C61" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-base focus:border-brand focus:outline-none transition-colors",
              value: config.avatarTheme || "default",
              onChange: (e) => setConfig({ ...config, avatarTheme: e.target.value }),
              children: [
                /* @__PURE__ */ jsx("option", { value: "default", children: "\u9ED8\u8BA4\u725B\u9A6C \u{1F42E}" }),
                /* @__PURE__ */ jsx("option", { value: "cyberpunk", children: "\u8D5B\u535A\u670B\u514B \u{1F916}" }),
                /* @__PURE__ */ jsx("option", { value: "retro", children: "\u590D\u53E4\u50CF\u7D20 \u{1F47E}" }),
                /* @__PURE__ */ jsx("option", { value: "classic", children: "\u7ECF\u5178\u9A6C\u513F \u{1F434}" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u4E0A\u73ED\u65F6\u95F4" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "time",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.startTime,
                onChange: (e) => setConfig({ ...config, startTime: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u4E0B\u73ED\u65F6\u95F4" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "time",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.endTime,
                onChange: (e) => setConfig({ ...config, endTime: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pb-1 mt-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-primary", children: "\u662F\u5426\u6709\u5348\u4F11\u65F6\u957F" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: `w-12 h-6 rounded-full p-1 transition-colors relative ${config.hasLunchBreak ? "bg-brand" : "bg-gray-700"}`,
              onClick: () => setConfig({ ...config, hasLunchBreak: !config.hasLunchBreak }),
              children: /* @__PURE__ */ jsx("div", { className: `w-4 h-4 rounded-full bg-white transition-transform ${config.hasLunchBreak ? "translate-x-6" : "translate-x-0"}` })
            }
          )
        ] }),
        config.hasLunchBreak && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs text-secondary mb-1.5 block flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F35A}" }),
              " \u5348\u4F11\u5F00\u59CB"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "time",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.lunchStartTime,
                onChange: (e) => setConfig({ ...config, lunchStartTime: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs text-secondary mb-1.5 block flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F4BC}" }),
              " \u5348\u4F11\u7ED3\u675F"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "time",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.lunchEndTime,
                onChange: (e) => setConfig({ ...config, lunchEndTime: e.target.value })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("hr", { className: "border-app my-2" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary font-medium block", children: "\u81EA\u5B9A\u4E49\u5012\u8BA1\u65F6\u8BB0\u5F55" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setConfig({
                ...config,
                customEvents: [...config.customEvents || [], { id: Math.random().toString(), name: "\u65B0\u4E8B\u4EF6", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0], color: "purple" }]
              }),
              className: "text-xs text-brand border border-brand/30 px-3 py-1 rounded-full hover:bg-brand/10 transition-colors",
              children: "\u6DFB\u52A0 +"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          (config.customEvents || []).map((evt, i) => /* @__PURE__ */ jsxs("div", { className: "p-3 bg-card-inner/50 rounded-xl border border-app relative flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setConfig({
                  ...config,
                  customEvents: config.customEvents.filter((_, idx) => idx !== i)
                }),
                className: "absolute -top-2 -right-2 w-6 h-6 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500/20",
                children: /* @__PURE__ */ jsx("span", { className: "text-xs", children: "\xD7" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] text-tertiary mb-1 block", children: "\u540D\u79F0" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    className: "w-full appearance-none m-0 bg-card border border-app rounded-lg px-2 h-[36px] box-border text-[13px] text-primary focus:border-brand focus:outline-none",
                    value: evt.name,
                    onChange: (e) => {
                      const updated = [...config.customEvents];
                      updated[i].name = e.target.value;
                      setConfig({ ...config, customEvents: updated });
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "text-[10px] text-tertiary mb-1 block", children: "\u989C\u8272" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    className: "w-full appearance-none m-0 bg-card border border-app rounded-lg px-2 h-[36px] box-border text-[13px] text-primary focus:border-brand focus:outline-none",
                    value: evt.color,
                    onChange: (e) => {
                      const updated = [...config.customEvents];
                      updated[i].color = e.target.value;
                      setConfig({ ...config, customEvents: updated });
                    },
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "purple", children: "\u7D2B\u8272" }),
                      /* @__PURE__ */ jsx("option", { value: "amber", children: "\u6A59\u8272" }),
                      /* @__PURE__ */ jsx("option", { value: "red", children: "\u7EA2\u8272" }),
                      /* @__PURE__ */ jsx("option", { value: "green", children: "\u7EFF\u8272" }),
                      /* @__PURE__ */ jsx("option", { value: "yellow", children: "\u9EC4\u8272" }),
                      /* @__PURE__ */ jsx("option", { value: "blue", children: "\u84DD\u8272" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] text-tertiary mb-1 block", children: "\u65E5\u671F" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  className: "w-full appearance-none m-0 bg-card border border-app rounded-lg px-3 h-[36px] block box-border text-primary font-mono text-sm focus:border-brand focus:outline-none",
                  value: evt.date,
                  onChange: (e) => {
                    const updated = [...config.customEvents];
                    updated[i].date = e.target.value;
                    setConfig({ ...config, customEvents: updated });
                  }
                }
              )
            ] })
          ] }, evt.id)),
          (!config.customEvents || config.customEvents.length === 0) && /* @__PURE__ */ jsx("div", { className: "text-center py-6 text-tertiary text-xs bg-card-inner/30 rounded-xl border border-app border-dashed", children: "\u6682\u65E0\u81EA\u5B9A\u4E49\u8BB0\u5F55" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u9884\u671F\u9000\u4F11\u65E5\u671F" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary font-mono text-base focus:border-brand focus:outline-none transition-colors",
              value: config.retirementDate,
              onChange: (e) => setConfig({ ...config, retirementDate: e.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-4 shadow-lg max-w-4xl mx-auto mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-primary mb-1", children: "\u5FAA\u73AF\u63D0\u9192\u529F\u80FD" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary mb-4", children: "\u540E\u53F0\u7A33\u5B9A\u8FD0\u884C\u7684\u5B9A\u65F6\u63D0\u9192\uFF08\u5982\u559D\u6C34/\u7AD9\u7ACB\uFF09\u3002" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u63D0\u9192\u95F4\u9694 (\u5206\u949F)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-brand font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: reminderMins,
                onChange: (e) => {
                  const v = Number(e.target.value);
                  setReminderMins(v);
                  if (!isReminderActive) setReminderTimeLeft(v * 60);
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u63D0\u9192\u5185\u5BB9" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "w-full bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary font-sans text-sm focus:border-brand focus:outline-none transition-colors",
                value: reminderText,
                onChange: (e) => setReminderText(e.target.value)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              if (!isReminderActive && "Notification" in window && Notification.permission === "default") {
                Notification.requestPermission().catch(() => {
                });
              }
              setIsReminderActive(!isReminderActive);
              if (!isReminderActive) {
                setReminderTimeLeft(reminderMins * 60);
              }
            },
            className: `w-full py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${isReminderActive ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-brand text-[#141414]"}`,
            children: isReminderActive ? `\u505C\u6B62\u63D0\u9192 (\u5269\u4F59 ${Math.floor(reminderTimeLeft / 60)} \u5206\u949F)` : "\u5F00\u542F\u63D0\u9192"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-4 shadow-lg max-w-4xl mx-auto mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-primary mb-1", children: "\u63D0\u793A\u97F3\u8BBE\u7F6E" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary mb-4", children: "\u8BBE\u5B9A\u756A\u8304\u949F\u4E0E\u63D0\u9192\u7684\u63D0\u793A\u97F3\u3002" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u756A\u8304\u949F\u5F00\u59CB" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-sm focus:border-brand focus:outline-none transition-colors",
                value: config.pomodoroStartSound,
                onChange: (e) => {
                  setConfig({ ...config, pomodoroStartSound: e.target.value });
                  if (e.target.value !== "none") playAlertSound(e.target.value);
                },
                children: [
                  /* @__PURE__ */ jsx("option", { value: "none", children: "\u65E0" }),
                  /* @__PURE__ */ jsx("option", { value: "beep", children: "\u77ED\u4FC3 (Beep)" }),
                  /* @__PURE__ */ jsx("option", { value: "bell", children: "\u6E05\u8106 (Bell)" }),
                  /* @__PURE__ */ jsx("option", { value: "chime", children: "\u548C\u5F26 (Chime)" }),
                  /* @__PURE__ */ jsx("option", { value: "digital", children: "\u7535\u5B50 (Digital)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u756A\u8304\u949F\u7ED3\u675F" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-sm focus:border-brand focus:outline-none transition-colors",
                value: config.pomodoroEndSound,
                onChange: (e) => {
                  setConfig({ ...config, pomodoroEndSound: e.target.value });
                  if (e.target.value !== "none") playAlertSound(e.target.value);
                },
                children: [
                  /* @__PURE__ */ jsx("option", { value: "none", children: "\u65E0" }),
                  /* @__PURE__ */ jsx("option", { value: "beep", children: "\u77ED\u4FC3 (Beep)" }),
                  /* @__PURE__ */ jsx("option", { value: "bell", children: "\u6E05\u8106 (Bell)" }),
                  /* @__PURE__ */ jsx("option", { value: "chime", children: "\u548C\u5F26 (Chime)" }),
                  /* @__PURE__ */ jsx("option", { value: "digital", children: "\u7535\u5B50 (Digital)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u63D0\u9192/\u4F11\u606F\u7ED3\u675F" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-sm focus:border-brand focus:outline-none transition-colors",
                value: config.pomodoroBreakSound,
                onChange: (e) => {
                  setConfig({ ...config, pomodoroBreakSound: e.target.value });
                  if (e.target.value !== "none") playAlertSound(e.target.value);
                },
                children: [
                  /* @__PURE__ */ jsx("option", { value: "none", children: "\u65E0" }),
                  /* @__PURE__ */ jsx("option", { value: "beep", children: "\u77ED\u4FC3 (Beep)" }),
                  /* @__PURE__ */ jsx("option", { value: "bell", children: "\u6E05\u8106 (Bell)" }),
                  /* @__PURE__ */ jsx("option", { value: "chime", children: "\u548C\u5F26 (Chime)" }),
                  /* @__PURE__ */ jsx("option", { value: "digital", children: "\u7535\u5B50 (Digital)" })
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-app space-y-5 shadow-lg max-w-4xl mx-auto mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-app-strong" }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-primary mb-2", children: "\u81EA\u5B9A\u4E49\u8D2D\u4E70\u529B\u6362\u7B97" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u81EA\u5B9A\u4E49\u7269\u54C1\u540D\u79F0" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors",
                value: config.customItemName,
                onChange: (e) => setConfig({ ...config, customItemName: e.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u91D1\u989D (\u4EBA\u6C11\u5E01)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-brand font-mono text-base focus:border-brand focus:outline-none transition-colors",
                value: config.customItemPrice === 0 ? "" : config.customItemPrice,
                onChange: (e) => setConfig({ ...config, customItemPrice: e.target.value === "" ? 0 : parseFloat(e.target.value) })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-5 border border-app space-y-4 shadow-lg mt-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-primary mb-2", children: "\u914D\u7F6E\u65B9\u6848\u4FDD\u5B58" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "\u8F93\u5165\u65B9\u6848\u540D\u79F0\uFF0C\u4F8B\u5982: \u65B9\u6848\u4E00\u7EBF\u57CE\u5E02",
              className: "flex-1 appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border placeholder:text-secondary/50 text-primary text-base focus:border-brand focus:outline-none transition-colors",
              value: currentProfileName,
              onChange: (e) => setCurrentProfileName(e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                if (!currentProfileName) return;
                const newProfiles = [...profiles.filter((p) => p.name !== currentProfileName), { name: currentProfileName, config: { ...config } }];
                setProfiles(newProfiles);
                setCurrentProfileName("");
              },
              className: "px-4 py-2 bg-brand text-app font-bold rounded-xl whitespace-nowrap hover:bg-brand-hover",
              children: "\u4FDD\u5B58\u5F53\u524D"
            }
          )
        ] }),
        profiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 mt-3", children: profiles.map((p) => /* @__PURE__ */ jsxs("div", { className: "flex items-center bg-card-inner border border-app rounded-full px-3 py-1 text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary mr-2", children: p.name }),
          /* @__PURE__ */ jsx("button", { onClick: () => setConfig(p.config), className: "text-brand hover:underline mr-2", children: "\u8F7D\u5165" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setProfiles(profiles.filter((x) => x.name !== p.name)), className: "text-red-500 hover:underline", children: "\u5220\u9664" })
        ] }, p.name)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-5 md:p-8 lg:p-10 border border-brand/20 max-w-4xl mx-auto mt-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xs text-brand font-bold mb-3 uppercase tracking-wider", children: "\u5B9E\u65F6\u65F6\u85AA\u9884\u4F30" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-secondary", children: "\u65F6\u85AA:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-primary font-mono", children: [
            "\xA5 ",
            hourlyRate.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-secondary", children: "\u5206\u949F\u85AA:" }),
          /* @__PURE__ */ jsxs("span", { className: "text-primary font-mono", children: [
            "\xA5 ",
            minuteRate.toFixed(2)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-8 text-center opacity-50 flex flex-col gap-1 text-[11px] font-mono text-tertiary pb-8", children: [
        /* @__PURE__ */ jsx("p", { children: "Architect & Author" }),
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-primary", children: "Barry" }),
        /* @__PURE__ */ jsx("a", { href: "mailto:barry.bai@hotwavehk.com", className: "hover:text-brand transition-colors", children: "barry.bai@hotwavehk.com" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-[10px] tracking-widest uppercase", children: "Version 1.0.17" })
      ] })
    ] }),
    activeTab === "pomodoro" && /* @__PURE__ */ jsx("div", { className: `flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 pt-6 pb-24 md:rounded-3xl max-w-4xl mx-auto w-full transition-colors duration-1000 bg-card-inner`, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-full py-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8 w-full max-w-sm text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight text-primary", children: "\u6C89\u6D78\u756A\u8304\u949F" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary mt-1 font-medium", children: "\u4E13\u6CE8\u4E00\u70B7\u9999\uFF0C\u5E72\u5B8C\u53BB\u653E\u98DE" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm bg-card border border-app rounded-[32px] p-6 shadow-2xl relative flex flex-col items-center shrink-0", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full pointer-events-none" }),
        /* @__PURE__ */ jsx(
          FocusVisualizer,
          {
            containerId: pomodoroContainer,
            timeLeft: pomodoroTimeLeft,
            lengthMins: pomodoroLength,
            isActive: isPomodoroActive
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-full mb-6 relative z-10", children: /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: pomodoroTask,
            onChange: (e) => setPomodoroTask(e.target.value),
            placeholder: "\u4ECA\u65E5\u5F85\u529E\u4E8B\u9879...",
            className: "w-full bg-card-inner border border-app rounded-xl p-3 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand shadow-inner text-primary placeholder:text-tertiary"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6 w-full max-w-[200px] flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-brand/5 to-transparent border border-brand/10 relative z-10", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary mb-1", children: "\u672C\u6B21\u4E13\u6CE8\u5DF2\u8D5A\u53D6" }),
          /* @__PURE__ */ jsxs("span", { className: "text-xl font-mono font-bold text-brand shadow-sm", children: [
            "\xA5",
            formatMoney((pomodoroLength * 60 - pomodoroTimeLeft) / 60 * minuteRate)
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4 relative z-20 pb-4", children: !isPomodoroActive && pomodoroTimeLeft >= pomodoroLength * 60 - 5 ? /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: togglePomodoro,
            className: "px-10 py-5 bg-brand text-[#141414] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.4)] hover:scale-105 active:scale-95 transition-all text-lg font-black",
            children: [
              /* @__PURE__ */ jsx(Play, { size: 24, className: "mr-3 fill-current" }),
              "\u5F00\u59CB\u4E13\u6CE8"
            ]
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: togglePomodoro,
              className: "px-8 py-4 bg-brand text-[#141414] rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all font-bold",
              children: isPomodoroActive ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Pause, { size: 22, className: "mr-2 fill-current" }),
                " \u6682\u505C"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Play, { size: 22, className: "mr-2 fill-current" }),
                " \u7EE7\u7EED"
              ] })
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: resetPomodoro,
              className: "px-8 py-4 bg-card-inner border border-app text-red-500 rounded-2xl flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all font-bold",
              children: [
                /* @__PURE__ */ jsx(Square, { size: 22, className: "mr-2 fill-current" }),
                " \u7ED3\u675F"
              ]
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm mt-8 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-primary mb-3", children: "\u71C3\u70E7\u65F6\u95F4\u7684\u5BB9\u5668" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: FOCUS_CONTAINERS.map((c) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setPomodoroContainer(c.id);
                handlePomodoroLengthChange(c.defaultTime);
              },
              className: `flex flex-col items-center justify-center p-2 rounded-xl border ${pomodoroContainer === c.id ? "bg-brand/10 border-brand/50 text-brand" : "bg-card border-app text-secondary hover:text-primary"} transition-colors`,
              title: c.name,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-2xl mb-1", children: c.emoji }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] whitespace-nowrap overflow-hidden text-ellipsis w-full text-center", children: c.name })
              ]
            },
            c.id
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-primary mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "\u73AF\u5883\u767D\u566A\u97F3" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary", children: "\u53EF\u591A\u9009" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-2", children: [
            { id: "rain", name: "\u96E8\u58F0", emoji: "\u{1F327}\uFE0F" },
            { id: "fire", name: "\u7BDD\u706B", emoji: "\u{1F525}" },
            { id: "train", name: "\u706B\u8F66", emoji: "\u{1F682}" },
            { id: "ocean", name: "\u6D77\u6D6A", emoji: "\u{1F30A}" },
            { id: "birds", name: "\u9E1F\u9E23", emoji: "\u{1F426}" },
            { id: "wind", name: "\u6E05\u98CE", emoji: "\u{1F32C}\uFE0F" },
            { id: "stream", name: "\u6EAA\u6D41", emoji: "\u{1F3DE}\uFE0F" },
            { id: "keyboard", name: "\u952E\u76D8", emoji: "\u2328\uFE0F" },
            { id: "clock", name: "\u949F\u8868", emoji: "\u{1F570}\uFE0F" }
          ].map((bgm) => {
            const isActiveBg = activeBgms.includes(bgm.id);
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  if (isActiveBg) {
                    setActiveBgms(activeBgms.filter((x) => x !== bgm.id));
                  } else {
                    setActiveBgms([...activeBgms, bgm.id]);
                  }
                },
                className: `flex flex-col items-center justify-center py-3 rounded-xl border ${isActiveBg ? "bg-brand/10 border-brand/50 text-brand shadow-[0_0_10px_rgba(0,255,65,0.2)]" : "bg-card border-app text-secondary hover:text-primary"} transition-all`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xl mb-1", children: bgm.emoji }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: bgm.name })
                ]
              },
              bgm.id
            );
          }) })
        ] })
      ] }),
      completedPomodoros > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 text-sm text-secondary flex items-center gap-2", children: [
        "\u4ECA\u65E5\u5DF2\u96C6\u9F50 ",
        /* @__PURE__ */ jsx("span", { className: "text-brand font-bold", children: completedPomodoros }),
        " \u4E2A\u756A\u8304 \u{1F345}"
      ] })
    ] }) }),
    activeTab === "calendar" && (() => {
      let calWorkDays = 0;
      let calRestDays = 0;
      const calDaysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
      for (let date = 1; date <= calDaysInMonth; date++) {
        const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), date);
        const dayOfWeek = d.getDay();
        const isStandardWeekend = config.restDays === 2 ? dayOfWeek === 0 || dayOfWeek === 6 : dayOfWeek === 0;
        const isCustomHoliday = isDateCustomHoliday(d, config.holidayRegion);
        const isCustomWorkday = isDateCustomWorkday(d, config.holidayRegion);
        let isRest = (isStandardWeekend || isCustomHoliday) && !isCustomWorkday;
        const memoKey = `${calendarDate.getFullYear()}-${(calendarDate.getMonth() + 1).toString().padStart(2, "0")}-${date.toString().padStart(2, "0")}`;
        const dayMemos = (memos || {})[memoKey] || [];
        const isPaidLeave = dayMemos.some((m) => m.type === "paid_leave");
        const isUnpaidLeave = dayMemos.some((m) => m.type === "unpaid_leave");
        if (isPaidLeave || isUnpaidLeave) {
          isRest = true;
        }
        if (isRest) {
          calRestDays++;
        } else {
          calWorkDays++;
        }
      }
      const getRegionName = (code) => {
        switch (code) {
          case "CN":
            return "\u4E2D\u56FD\u5927\u9646";
          case "HK":
            return "\u4E2D\u56FD\u9999\u6E2F";
          case "TH":
            return "\u6CF0\u56FD";
          case "VN":
            return "\u8D8A\u5357";
          default:
            return "\u672C\u5730\u533A";
        }
      };
      return /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-8 space-y-4 pb-24 absolute inset-0 top-0 bg-card-inner z-40 md:rounded-3xl max-w-4xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2 mb-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("home"), className: "p-2 bg-card rounded-full border border-app text-primary", children: /* @__PURE__ */ jsx(ChevronLeft, { size: 18 }) }),
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-primary", children: [
            getRegionName(config.holidayRegion),
            "\u5DE5\u4F5C\u65E5\u5386"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsx("button", { onClick: () => setCalendarDate(/* @__PURE__ */ new Date()), className: "px-3 py-1 bg-card rounded-full border border-app text-xs text-primary", children: "\u4ECA" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-3 border border-app flex items-center justify-between shadow-lg", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1)),
              className: "p-2 bg-card-inner rounded-full border border-app text-brand hover:bg-app",
              children: /* @__PURE__ */ jsx(ChevronLeft, { size: 16 })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold text-primary", children: [
              calendarDate.getFullYear(),
              "\u5E74",
              calendarDate.getMonth() + 1,
              "\u6708"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary", children: [
              "\u5DE5\u4F5C\u65E5: ",
              /* @__PURE__ */ jsx("span", { className: "font-bold text-primary", children: calWorkDays }),
              "\u5929 | \u4F11\u606F\u65E5: ",
              /* @__PURE__ */ jsx("span", { className: "font-bold text-primary", children: calRestDays }),
              "\u5929"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)),
              className: "p-2 bg-card-inner rounded-full border border-app text-brand hover:bg-app",
              children: /* @__PURE__ */ jsx(ChevronRight, { size: 16 })
            }
          )
        ] }),
        (() => {
          const isPastMonth = calendarDate.getFullYear() < localTime.getFullYear() || calendarDate.getFullYear() === localTime.getFullYear() && calendarDate.getMonth() < localTime.getMonth();
          const isFutureMonth = calendarDate.getFullYear() > localTime.getFullYear() || calendarDate.getFullYear() === localTime.getFullYear() && calendarDate.getMonth() > localTime.getMonth();
          let calEarned = 0;
          let calHours = 0;
          let calSlack = 0;
          let calOvertime = 0;
          if (isPastMonth) {
            calEarned = config.monthlySalary;
            calHours = calWorkDays * config.hoursPerDay;
            calSlack = slackLoss / Math.max(1, localTime.getDate()) * calWorkDays;
            calOvertime = overtimeLoss / Math.max(1, localTime.getDate()) * calWorkDays;
          } else if (isFutureMonth) {
            calEarned = 0;
            calHours = 0;
            calSlack = 0;
            calOvertime = 0;
          } else {
            calEarned = earnedThisMonth;
            calHours = hoursThisMonth;
            calSlack = slackLoss * (localTime.getDate() * 0.7);
            calOvertime = overtimeLoss * (localTime.getDate() * 0.8);
          }
          return /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 border border-app grid grid-cols-2 gap-3 shadow-lg relative overflow-hidden", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col bg-card-inner p-3 rounded-xl border border-app justify-center mt-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(TrendingUp, { size: 10 }),
                " \u5F53\u6708\u603B\u6536\u5165"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-lg font-mono font-bold text-brand", children: [
                sym,
                hide(formatMoney(calEarned / ex))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col bg-card-inner p-3 rounded-xl border border-app justify-center mt-1", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u23F1\uFE0F" }),
                " \u5F53\u6708\u603B\u5DE5\u65F6"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-lg font-mono font-bold text-brand", children: [
                calHours.toFixed(1),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary font-sans", children: "\u5C0F\u65F6" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col bg-card-inner p-3 rounded-xl border border-brand/10 justify-center", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F41F}" }),
                " \u6708\u5EA6\u6478\u9C7C\u4F30\u503C"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-mono font-bold text-brand", children: [
                sym,
                hide(formatMoney(calSlack / ex))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col bg-card-inner p-3 rounded-xl border border-red-500/10 justify-center", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-tertiary mb-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F3E2}" }),
                " \u6708\u5EA6\u52A0\u73ED\u635F\u5931"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-mono font-bold text-red-500", children: [
                sym,
                hide(formatMoney(calOvertime / ex))
              ] })
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-2xl p-4 border border-app shadow-lg relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1 text-center mb-4", children: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"].map((d) => /* @__PURE__ */ jsx("div", { className: "text-[13px] text-tertiary font-bold py-1", children: d }, d)) }),
          /* @__PURE__ */ jsx(
            CalendarGrid,
            {
              calendarDate,
              localTime,
              config,
              memos,
              onDateClick: handleDateClick
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-center mt-6 text-[11px] text-tertiary font-medium bg-card-inner/50 py-2.5 rounded-xl border border-app border-dashed", children: "\u63D0\u793A\uFF1A\u70B9\u51FB\u65E5\u671F\u8BB0\u5F55\u5907\u5FD8\u4E8B\u9879\uFF0C\u6240\u6709\u6570\u636E\u5747\u4FDD\u7559\u5728\u60A8\u672C\u5730\u3002" }),
          /* @__PURE__ */ jsx("div", { className: "text-center pt-8 pb-4 opacity-30", children: /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono tracking-widest text-tertiary uppercase", children: "Version 1.0.17" }) })
        ] })
      ] });
    })(),
    activeTab === "visa" && /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-8 space-y-6 pb-24 absolute inset-0 top-0 bg-card-inner z-40 md:rounded-3xl max-w-4xl mx-auto w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2 mb-6", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold tracking-tight text-primary flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Plane, { size: 24, className: "text-brand" }),
          " \u8DE8\u56FD\u7B7E\u8BC1\u7BA1\u5BB6"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowFinishedVisa(!showFinishedVisa),
            className: `flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${showFinishedVisa ? "bg-brand/10 border-brand/20 text-brand shadow-[0_0_10px_rgba(34,197,94,0.1)]" : "bg-card border-app text-tertiary"}`,
            children: [
              showFinishedVisa ? "\u663E\u793A\u5168\u90E8\u884C\u7A0B" : "\u4EC5\u770B\u8FDB\u884C\u4E2D",
              /* @__PURE__ */ jsx("div", { className: `w-1.5 h-1.5 rounded-full ${showFinishedVisa ? "bg-brand animate-pulse" : "bg-tertiary"}` })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card w-full border border-app rounded-[24px] p-5 shadow-sm relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full" }),
        /* @__PURE__ */ jsxs("form", { className: "relative z-10 flex flex-col gap-4", onSubmit: (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const entryDate = fd.get("entryDate");
          const exitDate = fd.get("exitDate");
          const country = fd.get("country") || "US";
          const validityDays = parseInt(fd.get("validityDays")) || 30;
          const entryAirport = fd.get("entryAirport");
          const exitAirport = fd.get("exitAirport");
          if (!entryDate) return alert("\u8BF7\u8F93\u5165\u5165\u5883\u65E5\u671F");
          setVisaEntries([{
            id: Date.now().toString(),
            entryDate,
            exitDate,
            country,
            validityDays,
            entryAirport,
            exitAirport
          }, ...visaEntries]);
          e.currentTarget.reset();
        }, children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u5165\u5883\u56FD\u5BB6/\u5730\u533A" }),
              /* @__PURE__ */ jsx("input", { name: "country", type: "text", placeholder: "\u4F8B\u5982\uFF1A\u6CF0\u56FD", required: true, className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-base focus:border-brand focus:outline-none transition-colors" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u7B7E\u8BC1\u6709\u6548\u671F (\u5929)" }),
              /* @__PURE__ */ jsx("input", { name: "validityDays", type: "number", defaultValue: "30", required: true, className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-base focus:border-brand focus:outline-none transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 border-t border-app pt-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "text-xs text-secondary mb-1.5 block flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F6EC}" }),
                " \u5165\u5883\u65E5\u671F"
              ] }),
              /* @__PURE__ */ jsx("input", { name: "entryDate", type: "date", required: true, className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-base focus:border-brand focus:outline-none transition-colors" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u5165\u5883\u673A\u573A/\u53E3\u5CB8" }),
              /* @__PURE__ */ jsx("input", { name: "entryAirport", type: "text", placeholder: "\u5982\uFF1ABKK", className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-base focus:border-brand focus:outline-none transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 border-t border-app pt-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "text-xs text-secondary mb-1.5 block flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: "\u{1F6EB}" }),
                " \u51FA\u5883\u65E5\u671F (\u9009\u586B)"
              ] }),
              /* @__PURE__ */ jsx("input", { name: "exitDate", type: "date", className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-base focus:border-brand focus:outline-none transition-colors" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs text-secondary mb-1.5 block", children: "\u51FA\u5883\u673A\u573A/\u53E3\u5CB8 (\u9009\u586B)" }),
              /* @__PURE__ */ jsx("input", { name: "exitAirport", type: "text", placeholder: "\u5982\uFF1ANRT", className: "w-full appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[44px] block box-border text-primary text-base focus:border-brand focus:outline-none transition-colors" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full py-3 h-[48px] bg-brand text-app font-bold rounded-xl mt-2 hover:brightness-110 transition-all shadow-md", children: "\u767B\u8BB0\u65B0\u884C\u7A0B (\u51FA\u5883\u53EF\u9009\u586B)" }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-tertiary text-center mt-1", children: "\u5982\u679C\u4E2D\u9014\u79BB\u5883\u518D\u6B21\u5165\u5883\uFF0C\u53EF\u4EE5\u76F4\u63A5\u6DFB\u52A0\u4E00\u6761\u65B0\u884C\u7A0B\u3002" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        visaEntries.filter((entry) => showFinishedVisa || !entry.exitDate).map((entry) => {
          const entryTime = new Date(entry.entryDate).getTime();
          const exitTime = entry.exitDate ? new Date(entry.exitDate).getTime() : Date.now();
          const expireTime = entryTime + entry.validityDays * 24 * 60 * 60 * 1e3;
          const totalStayed = Math.floor((exitTime - entryTime) / (1e3 * 60 * 60 * 24)) + 1;
          const remainingDays = Math.ceil((expireTime - Date.now()) / (1e3 * 60 * 60 * 24));
          const isOverdue = remainingDays < 0 && !entry.exitDate;
          let tag = null;
          if (entry.exitDate) {
            tag = /* @__PURE__ */ jsx("span", { className: "bg-app px-2 py-0.5 rounded text-secondary border border-app-strong text-[10px]", children: "\u5DF2\u7ED3\u675F" });
          } else if (isOverdue) {
            tag = /* @__PURE__ */ jsxs("span", { className: "bg-red-500/10 px-2 py-0.5 rounded text-red-500 border border-red-500/30 text-[10px] font-bold animate-pulse", children: [
              "\u5DF2\u903E\u671F ",
              Math.abs(remainingDays),
              " \u5929\uFF01"
            ] });
          } else if (remainingDays <= 3) {
            tag = /* @__PURE__ */ jsxs("span", { className: "bg-orange-500/10 px-2 py-0.5 rounded text-orange-500 border border-orange-500/30 text-[10px] font-bold", children: [
              "\u26A0\uFE0F \u5269 ",
              remainingDays,
              " \u5929\u7EED\u7B7E"
            ] });
          } else {
            tag = /* @__PURE__ */ jsx("span", { className: "bg-brand/10 px-2 py-0.5 rounded text-brand border border-brand/30 text-[10px] font-bold italic", children: "\u8FDB\u884C\u4E2D" });
          }
          return /* @__PURE__ */ jsxs("div", { className: `bg-card w-full border border-app border-l-[4px] rounded-2xl p-4 shadow-sm relative group overflow-hidden transition-all ${entry.exitDate ? "border-l-tertiary/30" : "border-l-brand"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-primary flex items-center gap-1.5", children: [
                  entry.country,
                  tag
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-tertiary mt-2 flex flex-col gap-1.5 font-medium", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "w-3 h-3 flex items-center justify-center bg-brand/10 text-brand rounded-full text-[7px]", children: "\u5165" }),
                    /* @__PURE__ */ jsxs("span", { className: "opacity-80", children: [
                      entry.entryDate,
                      " ",
                      entry.entryAirport && `\xB7 ${entry.entryAirport}`
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: `w-3 h-3 flex items-center justify-center rounded-full text-[7px] ${entry.exitDate ? "bg-tertiary/10 text-tertiary" : "bg-blue-500/10 text-blue-500 animate-pulse"}`, children: "\u51FA" }),
                    /* @__PURE__ */ jsx("span", { className: entry.exitDate ? "opacity-80" : "text-blue-500", children: entry.exitDate ? `${entry.exitDate} ${entry.exitAirport ? `\xB7 ${entry.exitAirport}` : ""}` : "\u5C1A\u672A\u51FA\u5883" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: () => setVisaEntries(visaEntries.filter((x) => x.id !== entry.id)), className: "text-tertiary hover:text-red-500 transition-colors p-1.5 bg-card-inner rounded-lg border border-app opacity-40 group-hover:opacity-100", children: /* @__PURE__ */ jsx(Trash2, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-card-inner/50 rounded-2xl p-3 border border-app flex flex-col justify-center relative", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] text-tertiary mb-1 uppercase tracking-wider font-bold", children: entry.exitDate ? "\u5386\u65F6" : "\u5DF2\u505C\u7559" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xl font-mono font-bold text-primary", children: totalStayed }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary", children: "Days" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-card-inner/50 rounded-2xl p-3 border border-app flex flex-col justify-center relative", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[9px] text-tertiary mb-1 uppercase tracking-wider font-bold", children: entry.exitDate ? "\u671F\u9650" : "\u5269\u4F59" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1", children: [
                  /* @__PURE__ */ jsx("span", { className: `text-xl font-mono font-bold ${!entry.exitDate && remainingDays <= 7 ? "text-orange-500" : "text-brand"}`, children: entry.exitDate ? entry.validityDays : Math.max(0, remainingDays) }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-tertiary", children: "Days" })
                ] })
              ] })
            ] }),
            !entry.exitDate && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-app relative z-10", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-secondary mb-2 block uppercase tracking-tighter", children: "\u5FEB\u901F\u8BB0\u5F55\u51FA\u5883" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "date",
                    className: "flex-1 appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[40px] block box-border text-primary focus:border-brand focus:outline-none text-xs transition-shadow focus:shadow-[0_0_10px_rgba(34,197,94,0.1)]",
                    onChange: (e) => {
                      if (e.target.value) {
                        const updated = visaEntries.map((x) => x.id === entry.id ? { ...x, exitDate: e.target.value } : x);
                        setVisaEntries(updated);
                      }
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    placeholder: "\u53E3\u5CB8",
                    className: "w-[80px] appearance-none m-0 bg-card-inner border border-app-strong rounded-xl px-3 h-[40px] block box-border text-primary focus:border-brand focus:outline-none text-xs transition-shadow focus:shadow-[0_0_10px_rgba(34,197,94,0.1)]",
                    value: entry.exitAirport,
                    onChange: (e) => {
                      const updated = visaEntries.map((x) => x.id === entry.id ? { ...x, exitAirport: e.target.value } : x);
                      setVisaEntries(updated);
                    }
                  }
                )
              ] })
            ] })
          ] }, entry.id);
        }),
        visaEntries.filter((entry) => showFinishedVisa || !entry.exitDate).length === 0 && /* @__PURE__ */ jsxs("div", { className: "py-16 bg-card border border-app border-dashed rounded-3xl text-center text-secondary text-sm flex flex-col items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-card-inner border border-app flex items-center justify-center opacity-30 mt-2", children: /* @__PURE__ */ jsx(Plane, { size: 32 }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold opacity-80", children: "\u6682\u65E0\u884C\u7A0B\u8BB0\u5F55" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] opacity-40 uppercase tracking-widest tracking-tighter", children: "Nothing to display" })
          ] }),
          !showFinishedVisa && visaEntries.length > 0 && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowFinishedVisa(true),
              className: "mt-2 text-brand text-xs font-bold underline underline-offset-4",
              children: [
                "\u67E5\u770B\u5DF2\u7ED3\u675F\u7684\u884C\u7A0B (",
                visaEntries.length,
                ")"
              ]
            }
          )
        ] }),
        visaEntries.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-8 pt-8 border-t border-app", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold text-secondary uppercase tracking-widest", children: "\u51FA\u5883\u884C\u7A0B\u7EDF\u8BA1" }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-tertiary", children: "TOTAL STATS" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card-inner rounded-[24px] p-5 border border-brand/20 shadow-inner flex flex-col group hover:border-brand/40 transition-colors", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4 pb-4 border-b border-app/50 border-dashed", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-secondary mb-1 uppercase tracking-tighter", children: "\u4ECA\u5E74\u7D2F\u8BA1\u505C\u7559\u65F6\u957F" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-3xl font-mono font-bold text-brand group-hover:scale-105 transition-transform origin-left", children: visaEntries.filter((x) => x.entryDate.startsWith((/* @__PURE__ */ new Date()).getFullYear().toString())).reduce((acc, entry) => {
                    const entryTime = new Date(entry.entryDate).getTime();
                    const exitTime = entry.exitDate ? new Date(entry.exitDate).getTime() : Date.now();
                    return acc + Math.floor((exitTime - entryTime) / (1e3 * 60 * 60 * 24)) + 1;
                  }, 0) }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-sans font-bold text-secondary", children: "DAYS" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand shadow-inner rotate-3 group-hover:rotate-0 transition-transform", children: /* @__PURE__ */ jsx(Globe, { size: 28 }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-bold text-secondary uppercase tracking-tighter mb-1", children: "\u5404\u56FD\u5BB6/\u5730\u533A\u603B\u9017\u7559\u65F6\u95F4" }),
              Object.entries(
                visaEntries.reduce((acc, entry) => {
                  const entryTime = new Date(entry.entryDate).getTime();
                  const exitTime = entry.exitDate ? new Date(entry.exitDate).getTime() : Date.now();
                  const days = Math.floor((exitTime - entryTime) / (1e3 * 60 * 60 * 24)) + 1;
                  acc[entry.country] = (acc[entry.country] || 0) + days;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).map(([country, days]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-primary flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-brand" }),
                  " ",
                  country
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-mono text-tertiary", children: [
                  "\u7D2F\u8BA1 ",
                  /* @__PURE__ */ jsx("span", { className: "text-brand font-bold", children: days }),
                  " \u5929"
                ] })
              ] }, country))
            ] })
          ] })
        ] })
      ] })
    ] }),
    activeTab !== "home" && activeTab !== "pomodoro" && activeTab !== "profile" && activeTab !== "data" && activeTab !== "calendar" && activeTab !== "visa" && /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center p-8 text-center bg-card-inner z-40 absolute inset-0 top-0", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-2", children: "\u{1F6A7} \u6B63\u5728\u65BD\u5DE5" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "\u529F\u80FD\u6B63\u5728\u5F00\u53D1\u4E2D..." }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary mt-1", children: "Please come back later" })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: selectedMemoDate && /* @__PURE__ */ jsx(
      MemoModal,
      {
        date: selectedMemoDate,
        memos: (memos || {})[selectedMemoDate] || [],
        onClose: handleMemoModalClose,
        onSave: handleMemoModalSave
      },
      "memo-modal"
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showAllCountdowns && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-md px-0 md:px-4", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
        transition: { type: "spring", damping: 25, stiffness: 300 },
        className: "w-full md:max-w-md bg-card rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "p-5 flex justify-between items-center border-b border-app", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold text-primary flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Timer, { size: 20, className: "text-brand" }),
              "\u6240\u6709\u8BB0\u5F55"
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setShowAllCountdowns(false), className: "w-8 h-8 flex items-center justify-center rounded-full bg-card-inner border border-app text-tertiary hover:text-primary transition-colors", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "p-5 overflow-y-auto space-y-4 no-scrollbar", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(
              CountdownCard,
              {
                title: "\u4E0B\u73ED\u5012\u8BA1\u65F6",
                time: `${pad0(Math.floor(offWorkSecs / 3600))}:${pad0(Math.floor(offWorkSecs % 3600 / 60))}:${pad0(offWorkSecs % 60)}`,
                desc: `${config.endTime}\u4E0B\u73ED`,
                progress: 100 - offWorkSecs / (config.hoursPerDay * 3600) * 100,
                icon: /* @__PURE__ */ jsx(Briefcase, { size: 16 }),
                color: "green"
              }
            ),
            /* @__PURE__ */ jsx(
              CountdownCard,
              {
                title: isRestDay ? "\u8DDD\u79BB\u4E0B\u4E2A\u4F11\u606F\u65E5" : "\u8DDD\u79BB\u4F11\u606F\u65E5",
                time: `${daysToNextRestDay} \u5929`,
                desc: "\u76FC\u671B\u597D\u65E5\u5B50",
                progress: 100 - daysToNextRestDay / 7 * 100,
                icon: /* @__PURE__ */ jsx(CalendarIcon, { size: 16 }),
                color: "yellow"
              }
            ),
            /* @__PURE__ */ jsx(
              CountdownCard,
              {
                title: "\u8DDD\u79BB\u53D1\u85AA\u65E5",
                time: `${daysToPayday} \u5929`,
                desc: `${config.payday}\u53F7\u53D1\u85AA`,
                progress: 100 - daysToPayday / daysInMonth * 100,
                icon: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u{1F4B0}" }),
                color: "amber"
              }
            ),
            /* @__PURE__ */ jsx(
              CountdownCard,
              {
                title: "\u8DDD\u79BB\u9000\u4F11",
                time: `${daysToRetire}\u5929`,
                desc: retireDateObj.toLocaleDateString(),
                progress: daysToRetire < 0 ? 100 : Math.max(0, 100 - daysToRetire / (365 * 30) * 100),
                icon: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u{1FA91}" }),
                color: "red"
              }
            ),
            (config.customEvents || []).map((evt) => {
              const evtDateObj = new Date(evt.date);
              const daysToEvt = Math.ceil((evtDateObj.getTime() - localTime.getTime()) / (1e3 * 3600 * 24));
              return /* @__PURE__ */ jsx(
                CountdownCard,
                {
                  title: evt.name,
                  time: daysToEvt < 0 ? `\u5DF2\u8FC7\u53BB ${Math.abs(daysToEvt)} \u5929` : `${daysToEvt} \u5929`,
                  desc: evtDateObj.toLocaleDateString(),
                  progress: daysToEvt < 0 ? 100 : Math.max(0, 100 - daysToEvt / 365 * 100),
                  icon: /* @__PURE__ */ jsx("span", { className: "text-sm", children: "\u2B50" }),
                  color: evt.color || "purple"
                },
                evt.id
              );
            })
          ] }) })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxs("div", { className: "fixed bottom-0 left-0 right-0 w-full md:max-w-4xl lg:max-w-6xl xl:max-w-[1400px] mx-auto bg-card-inner/90 backdrop-blur-lg border-t md:border border-app py-2 md:py-4 px-2 md:px-16 flex justify-between items-center z-50 md:rounded-b-3xl md:rounded-t-none md:bottom-4 xl:rounded-3xl shadow-2xl md:mb-4 xl:mb-0 transition-all duration-300", children: [
      /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Home, { size: 22 }), label: "\u9996\u9875", active: activeTab === "home", onClick: () => setActiveTab("home") }),
      /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Timer, { size: 22 }), label: "\u4E13\u6CE8", active: activeTab === "pomodoro", onClick: () => setActiveTab("pomodoro") }),
      /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(CalendarIcon, { size: 22 }), label: "\u65E5\u5386", active: activeTab === "calendar", onClick: () => {
        setActiveTab("calendar");
        setCalendarDate(/* @__PURE__ */ new Date());
      } }),
      /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Globe, { size: 22 }), label: "\u7B7E\u8BC1", active: activeTab === "visa", onClick: () => setActiveTab("visa") }),
      /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(PieChart, { size: 22 }), label: "\u6570\u636E", active: activeTab === "data", onClick: () => setActiveTab("data") }),
      /* @__PURE__ */ jsx(NavItem, { icon: /* @__PURE__ */ jsx(Settings, { size: 22 }), label: "\u8BBE\u5B9A", active: activeTab === "profile", onClick: () => setActiveTab("profile") })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "fixed -left-[9999px] top-0 pointer-events-none", "aria-hidden": "true", children: /* @__PURE__ */ jsxs("div", { ref: shareRef, style: { width: "375px", backgroundColor: "#0E0E10", color: "#E0E0E0", padding: "24px", borderRadius: "24px", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }, children: [
      /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", backgroundColor: "rgba(76, 175, 80, 0.1)", borderRadius: "50%" } }),
      /* @__PURE__ */ jsxs("div", { style: { position: "relative", zIndex: 10 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }, children: [
          /* @__PURE__ */ jsx("div", { style: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx("span", { style: { color: "#FFFFFF", fontWeight: "bold", fontSize: "14px", width: "100%", textAlign: "center" }, children: "T" }) }),
          /* @__PURE__ */ jsx("span", { style: { fontWeight: "bold", fontSize: "18px", letterSpacing: "-0.025em" }, children: "TimeMeter" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "24px" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { style: { fontSize: "14px", color: "#888888", marginBottom: "4px" }, children: "\u4ECA\u65E5\u6478\u9C7C\u6536\u5165" }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: "36px", fontFamily: "monospace", fontWeight: "bold", color: "#4CAF50" }, children: [
              "\xA5",
              formatMoney(earnedToday)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { backgroundColor: "#1A1A1E", padding: "16px", borderRadius: "16px", border: "1px solid #2A2A2E" }, children: [
              /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#888888", marginBottom: "4px" }, children: "\u672C\u6708\u7D2F\u8BA1" }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: "18px", fontFamily: "monospace", fontWeight: "600" }, children: [
                "\xA5",
                formatMoney(earnedThisMonth)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { backgroundColor: "#1A1A1E", padding: "16px", borderRadius: "16px", border: "1px solid #2A2A2E" }, children: [
              /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: "#888888", marginBottom: "4px" }, children: "\u5976\u8336\u6362\u7B97" }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: "18px", fontFamily: "monospace", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }, children: [
                /* @__PURE__ */ jsx("span", { children: "\u{1F9CB}" }),
                " ",
                (earnedToday / MILK_TEA_PRICE).toFixed(1),
                " \u676F"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid rgba(76, 175, 80, 0.2)", padding: "16px", borderRadius: "16px", marginTop: "16px" }, children: /* @__PURE__ */ jsxs("p", { style: { color: "#81C784", fontWeight: "500", fontSize: "14px", lineHeight: "1.6" }, children: [
            "\u6211\u4ECA\u5929\u7528 TimeMeter \u8D5A\u4E86 \xA5",
            formatMoney(earnedToday).split(".")[0],
            "\uFF0C\u76F8\u5F53\u4E8E ",
            Math.floor(earnedToday / MILK_TEA_PRICE),
            " \u676F\u5976\u8336\u7684\u81EA\u7531\uFF01"
          ] }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: showShareModal && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4",
        onClick: () => setShowShareModal(false),
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.95, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.95, opacity: 0 },
            className: "bg-card border border-app p-4 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-primary mb-4 text-lg", children: "\u4E00\u952E\u751F\u6210\u5206\u4EAB\u56FE" }),
              shareImgUrl ? /* @__PURE__ */ jsx("img", { src: shareImgUrl, alt: "Share", className: "w-full rounded-2xl shadow-lg border border-app filter brightness-[0.85]" }) : /* @__PURE__ */ jsx("div", { className: "w-full aspect-[3/4] bg-card-inner rounded-2xl animate-pulse flex items-center justify-center text-secondary text-sm", children: "\u751F\u6210\u4E2D..." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary mt-4 text-center", children: "\u957F\u6309\u56FE\u7247\u4FDD\u5B58\u6216\u5206\u4EAB\u7ED9\u5176\u4ED6\u4EBA" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "w-full mt-4 py-3 bg-brand text-[#141414] font-semibold rounded-xl text-sm",
                  onClick: () => setShowShareModal(false),
                  children: "\u5B8C\u6210"
                }
              )
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: fortuneModalOpen && dailyFortune && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4",
        onClick: () => setFortuneModalOpen(false),
        children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { scale: 0.95, opacity: 0, y: 20 },
            animate: { scale: 1, opacity: 1, y: 0 },
            exit: { scale: 0.95, opacity: 0, y: 20 },
            className: "bg-card border border-app p-6 md:p-8 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center relative overflow-hidden",
            onClick: (e) => e.stopPropagation(),
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-3xl rounded-full" }),
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-primary mb-6 text-lg tracking-wider", children: "\u4ECA\u65E5\u4E13\u5C5E\u8FD0\u52BF\u5361" }),
              /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-full bg-card-inner border-2 border-app flex items-center justify-center text-5xl mb-4 shadow-inner", children: dailyFortune.emoji }),
              /* @__PURE__ */ jsx("div", { className: `text-2xl font-black mb-2 ${dailyFortune.color}`, children: dailyFortune.level }),
              /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-primary mb-2 px-2", children: dailyFortune.text }),
              /* @__PURE__ */ jsx("div", { className: "text-secondary text-xs leading-relaxed px-4 opacity-80", children: dailyFortune.detail }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "w-full mt-8 py-3 bg-card-inner border border-app text-primary font-semibold rounded-xl text-sm hover:bg-app transition-colors",
                  onClick: () => setFortuneModalOpen(false),
                  children: "\u6536\u4E0B\u8FD0\u52BF"
                }
              )
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: toast && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 },
        className: "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-brand text-[#141414] rounded-full shadow-2xl font-bold flex items-center gap-2 border border-brand/50",
        children: [
          /* @__PURE__ */ jsx("span", { children: toast.type === "warn" ? "\u26A0\uFE0F" : "\u2139\uFE0F" }),
          toast.message
        ]
      }
    ) })
  ] });
}
function ConversionCard({ icon, label, value, unit, color, className = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: `bg-card-inner border border-app rounded-lg p-1.5 flex flex-col items-center justify-center relative overflow-hidden group min-w-0 h-[60px] shrink-0 w-[72px] ${className}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mb-0.5", children: [
      /* @__PURE__ */ jsx("div", { className: "transition-transform group-hover:scale-110 duration-300", children: icon }),
      /* @__PURE__ */ jsx("div", { className: "text-[9px] text-secondary truncate", children: label })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-0.5 text-center px-1", children: [
      /* @__PURE__ */ jsx("span", { className: `text-[11px] font-mono font-semibold ${color} truncate`, children: value }),
      /* @__PURE__ */ jsx("span", { className: "text-[8px] text-tertiary shrink-0", children: unit })
    ] })
  ] });
}
const colorMap = {
  green: { bg: "bg-brand/10", text: "text-brand", border: "border-brand/20", bar: "bg-brand shadow-[0_0_8px_rgba(0,255,65,0.4)]" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", bar: "bg-yellow-500" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", bar: "bg-amber-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20", bar: "bg-purple-500" },
  red: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", bar: "bg-red-500" }
};
function CountdownCard({ title, time, desc, progress, icon, color }) {
  const styles = colorMap[color];
  const w = Math.max(0, Math.min(100, progress));
  return /* @__PURE__ */ jsxs("div", { className: `min-w-[124px] snap-center bg-card border border-app rounded-2xl p-3 flex flex-col relative`, children: [
    /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${styles.bg} ${styles.text}`, children: icon }),
    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-secondary mb-1", children: title }),
    /* @__PURE__ */ jsx("div", { className: `text-xl font-mono font-semibold mb-0.5 tracking-tight ${styles.text}`, children: time }),
    /* @__PURE__ */ jsx("div", { className: "text-[9px] text-tertiary mb-4", children: desc }),
    /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 right-3 flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-card-inner border border-app rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: `h-full ${styles.bar} rounded-full`, style: { width: `${w}%` } }) }),
      /* @__PURE__ */ jsxs("span", { className: "text-[8px] text-tertiary font-mono w-4 text-right", children: [
        Math.round(w),
        "%"
      ] })
    ] })
  ] });
}
function NavItem({ icon, label, active = false, onClick }) {
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-col items-center justify-center cursor-pointer gap-1 p-1`, onClick, children: [
    /* @__PURE__ */ jsx("div", { className: `${active ? "text-brand" : "text-tertiary"} transition-colors`, children: icon }),
    /* @__PURE__ */ jsx("div", { className: `text-[10px] ${active ? "text-brand font-bold" : "text-tertiary"}`, children: label })
  ] });
}
