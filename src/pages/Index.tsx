import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

function playSound(type: "correct" | "wrong") {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (type === "correct") {
      // Весёлые нарастающие ноты
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
        gain.gain.linearRampToValueAtTime(0, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } else {
      // Грустный нисходящий звук
      const notes = [330, 277, 220];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.25);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    }
  } catch (e) { console.warn("Audio error", e); }
}

type Section = "home" | "tasks" | "progress" | "rewards" | "parents" | "contacts";

const NAV_ITEMS = [
  { id: "home", label: "Главная", emoji: "🏠" },
  { id: "tasks", label: "Задания", emoji: "✏️" },
  { id: "progress", label: "Прогресс", emoji: "📈" },
  { id: "rewards", label: "Награды", emoji: "⭐" },
  { id: "parents", label: "Родителям", emoji: "💛" },
  { id: "contacts", label: "Контакты", emoji: "📬" },
] as const;

const TASKS = [
  // Уровень 1 — счёт (14 заданий)
  { id: 1,  level: 1, type: "count", title: "Считаем яблоки",     question: "Сколько яблок? 🍎🍎🍎🍎🍎",               answer: "5",  options: ["3","4","5","6"],          color: "bg-sky-100",    emoji: "🍎" },
  { id: 2,  level: 1, type: "count", title: "Считаем звёздочки",  question: "Сколько звёздочек? ⭐⭐⭐",              answer: "3",  options: ["2","3","4","5"],          color: "bg-green-100",  emoji: "⭐" },
  { id: 3,  level: 1, type: "count", title: "Считаем мячики",     question: "Сколько мячиков? ⚽⚽⚽⚽⚽⚽⚽",         answer: "7",  options: ["5","6","7","8"],          color: "bg-yellow-100", emoji: "⚽" },
  { id: 4,  level: 1, type: "count", title: "Считаем сердечки",   question: "Сколько сердечек? ❤️❤️❤️❤️",            answer: "4",  options: ["3","4","5","6"],          color: "bg-pink-100",   emoji: "❤️" },
  { id: 5,  level: 1, type: "count", title: "Считаем грибочки",   question: "Сколько грибочков? 🍄🍄🍄🍄🍄🍄",       answer: "6",  options: ["4","5","6","7"],          color: "bg-amber-100",  emoji: "🍄" },
  { id: 6,  level: 1, type: "count", title: "Считаем бабочек",    question: "Сколько бабочек? 🦋🦋",                answer: "2",  options: ["1","2","3","4"],          color: "bg-violet-100", emoji: "🦋" },
  { id: 7,  level: 1, type: "count", title: "Считаем рыбок",      question: "Сколько рыбок? 🐟🐟🐟🐟🐟🐟🐟🐟",      answer: "8",  options: ["6","7","8","9"],          color: "bg-blue-100",   emoji: "🐟" },
  { id: 8,  level: 1, type: "count", title: "Считаем морковки",   question: "Сколько морковок? 🥕🥕🥕",             answer: "3",  options: ["2","3","4","5"],          color: "bg-orange-100", emoji: "🥕" },
  { id: 9,  level: 1, type: "count", title: "Считаем пчёлок",     question: "Сколько пчёлок? 🐝🐝🐝🐝🐝🐝🐝🐝🐝",  answer: "9",  options: ["7","8","9","10"],         color: "bg-yellow-100", emoji: "🐝" },
  { id: 10, level: 1, type: "count", title: "Считаем шарики",     question: "Сколько шариков? 🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈", answer: "10", options: ["8","9","10","11"],         color: "bg-red-100",    emoji: "🎈" },
  { id: 11, level: 1, type: "count", title: "Считаем котиков",    question: "Сколько котиков? 🐱🐱🐱🐱",            answer: "4",  options: ["3","4","5","6"],          color: "bg-rose-100",   emoji: "🐱" },
  { id: 12, level: 1, type: "count", title: "Считаем утят",       question: "Сколько утят? 🐥🐥🐥🐥🐥🐥",           answer: "6",  options: ["4","5","6","7"],          color: "bg-lime-100",   emoji: "🐥" },
  { id: 13, level: 1, type: "count", title: "Считаем конфеты",    question: "Сколько конфет? 🍬🍬🍬🍬🍬🍬🍬",       answer: "7",  options: ["5","6","7","8"],          color: "bg-fuchsia-100",emoji: "🍬" },
  { id: 14, level: 1, type: "count", title: "Считаем снежинки",   question: "Сколько снежинок? ❄️❄️❄️❄️❄️",         answer: "5",  options: ["4","5","6","7"],          color: "bg-cyan-100",   emoji: "❄️" },

  // Уровень 2 — состав числа (12 заданий)
  { id: 15, level: 2, type: "compose", title: "Состав числа 7",  question: "7 = 3 + ?",     answer: "4",  options: ["3","4","5","6"],   color: "bg-purple-100",  emoji: "🔢" },
  { id: 16, level: 2, type: "compose", title: "Состав числа 10", question: "10 = ? + 6",    answer: "4",  options: ["2","3","4","5"],   color: "bg-orange-100",  emoji: "🧩" },
  { id: 17, level: 2, type: "compose", title: "Состав числа 9",  question: "9 = 5 + ?",     answer: "4",  options: ["3","4","5","6"],   color: "bg-violet-100",  emoji: "🎯" },
  { id: 18, level: 2, type: "compose", title: "Состав числа 8",  question: "8 = ? + 3",     answer: "5",  options: ["3","4","5","6"],   color: "bg-cyan-100",    emoji: "🎲" },
  { id: 19, level: 2, type: "compose", title: "Состав числа 5",  question: "5 = ? + 2",     answer: "3",  options: ["1","2","3","4"],   color: "bg-teal-100",    emoji: "🐸" },
  { id: 20, level: 2, type: "compose", title: "Состав числа 6",  question: "6 = 4 + ?",     answer: "2",  options: ["1","2","3","4"],   color: "bg-lime-100",    emoji: "🌿" },
  { id: 21, level: 2, type: "compose", title: "Состав числа 4",  question: "4 = ? + 1",     answer: "3",  options: ["1","2","3","4"],   color: "bg-amber-100",   emoji: "🍀" },
  { id: 22, level: 2, type: "compose", title: "Состав числа 3",  question: "3 = 1 + ?",     answer: "2",  options: ["1","2","3","4"],   color: "bg-rose-100",    emoji: "🌺" },
  { id: 23, level: 2, type: "compose", title: "Состав числа 8",  question: "8 = 6 + ?",     answer: "2",  options: ["1","2","3","4"],   color: "bg-sky-100",     emoji: "🎀" },
  { id: 24, level: 2, type: "compose", title: "Состав числа 10", question: "10 = 7 + ?",    answer: "3",  options: ["2","3","4","5"],   color: "bg-green-100",   emoji: "🍃" },
  { id: 25, level: 2, type: "compose", title: "Состав числа 9",  question: "9 = ? + 4",     answer: "5",  options: ["4","5","6","7"],   color: "bg-fuchsia-100", emoji: "🌸" },
  { id: 26, level: 2, type: "compose", title: "Состав числа 7",  question: "7 = ? + 5",     answer: "2",  options: ["1","2","3","4"],   color: "bg-indigo-100",  emoji: "💎" },

  // Уровень 3 — логика (12 заданий)
  { id: 27, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: кошка, собака, роза, рыба?",         answer: "роза",       options: ["кошка","собака","роза","рыба"],           color: "bg-pink-100",   emoji: "🌹" },
  { id: 28, level: 3, type: "logic", title: "Следующее число",   question: "2, 4, 6, 8, ?",                                  answer: "10",         options: ["9","10","11","12"],                       color: "bg-yellow-100", emoji: "🔄" },
  { id: 29, level: 3, type: "logic", title: "Продолжи ряд",      question: "1, 3, 5, 7, ?",                                  answer: "9",          options: ["8","9","10","11"],                        color: "bg-blue-100",   emoji: "🧮" },
  { id: 30, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: стол, стул, диван, яблоко?",          answer: "яблоко",     options: ["стол","стул","диван","яблоко"],           color: "bg-green-100",  emoji: "🍎" },
  { id: 31, level: 3, type: "logic", title: "Продолжи ряд",      question: "10, 20, 30, ?",                                   answer: "40",         options: ["35","38","40","45"],                      color: "bg-orange-100", emoji: "📏" },
  { id: 32, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: автобус, самолёт, велосипед, книга?", answer: "книга",      options: ["автобус","самолёт","велосипед","книга"],  color: "bg-sky-100",    emoji: "📚" },
  { id: 33, level: 3, type: "logic", title: "Продолжи ряд",      question: "5, 10, 15, ?",                                    answer: "20",         options: ["17","18","19","20"],                      color: "bg-teal-100",   emoji: "🎵" },
  { id: 34, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: яблоко, груша, морковь, банан?",      answer: "морковь",    options: ["яблоко","груша","морковь","банан"],       color: "bg-lime-100",   emoji: "🥕" },
  { id: 35, level: 3, type: "logic", title: "Больше или меньше", question: "Что меньше: 8 или 5?",                            answer: "5",          options: ["5","6","7","8"],                          color: "bg-violet-100", emoji: "⚖️" },
  { id: 36, level: 3, type: "logic", title: "Продолжи ряд",      question: "3, 6, 9, ?",                                      answer: "12",         options: ["10","11","12","13"],                      color: "bg-rose-100",   emoji: "🔁" },
  { id: 37, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: красный, синий, круглый, зелёный?",   answer: "круглый",    options: ["красный","синий","круглый","зелёный"],    color: "bg-fuchsia-100",emoji: "🎨" },
  { id: 38, level: 3, type: "logic", title: "Сравни числа",      question: "Какое число между 4 и 6?",                        answer: "5",          options: ["3","4","5","7"],                          color: "bg-amber-100",  emoji: "🔍" },

  // Уровень 4 — сложение и вычитание (12 заданий)
  { id: 39, level: 4, type: "count",   title: "Сложение",              question: "8 + 7 = ?",      answer: "15", options: ["13","14","15","16"], color: "bg-teal-100",    emoji: "➕" },
  { id: 40, level: 4, type: "compose", title: "Вычитание",             question: "20 − 8 = ?",     answer: "12", options: ["10","11","12","13"], color: "bg-indigo-100",  emoji: "➖" },
  { id: 41, level: 4, type: "count",   title: "Сложение",              question: "13 + 5 = ?",     answer: "18", options: ["16","17","18","19"], color: "bg-sky-100",     emoji: "🔵" },
  { id: 42, level: 4, type: "compose", title: "Вычитание",             question: "15 − 7 = ?",     answer: "8",  options: ["6","7","8","9"],     color: "bg-rose-100",    emoji: "🔴" },
  { id: 43, level: 4, type: "compose", title: "Пропущенное число",     question: "? + 9 = 17",     answer: "8",  options: ["6","7","8","9"],     color: "bg-amber-100",   emoji: "❓" },
  { id: 44, level: 4, type: "count",   title: "Сложение",              question: "6 + 8 = ?",      answer: "14", options: ["12","13","14","15"], color: "bg-green-100",   emoji: "➕" },
  { id: 45, level: 4, type: "compose", title: "Вычитание",             question: "18 − 9 = ?",     answer: "9",  options: ["7","8","9","10"],    color: "bg-violet-100",  emoji: "➖" },
  { id: 46, level: 4, type: "count",   title: "Сложение",              question: "9 + 9 = ?",      answer: "18", options: ["16","17","18","19"], color: "bg-orange-100",  emoji: "🟠" },
  { id: 47, level: 4, type: "compose", title: "Пропущенное число",     question: "14 − ? = 6",     answer: "8",  options: ["6","7","8","9"],     color: "bg-cyan-100",    emoji: "🔣" },
  { id: 48, level: 4, type: "count",   title: "Сложение трёх чисел",   question: "3 + 4 + 5 = ?",  answer: "12", options: ["10","11","12","13"], color: "bg-lime-100",    emoji: "✨" },
  { id: 49, level: 4, type: "compose", title: "Вычитание",             question: "20 − 13 = ?",    answer: "7",  options: ["5","6","7","8"],     color: "bg-fuchsia-100", emoji: "🟣" },
  { id: 50, level: 4, type: "count",   title: "Сложение",              question: "7 + 6 = ?",      answer: "13", options: ["11","12","13","14"], color: "bg-pink-100",    emoji: "💫" },
];

const REWARDS = [
  { id: 1, name: "Первые шаги", emoji: "👣", desc: "Выполни первое задание", earned: true },
  { id: 2, name: "Любитель счёта", emoji: "🔢", desc: "Реши 5 заданий на счёт", earned: true },
  { id: 3, name: "Мастер состава", emoji: "🧩", desc: "Разгадай 3 состава числа", earned: true },
  { id: 4, name: "Логик", emoji: "🧠", desc: "Реши 3 логических задачи", earned: false },
  { id: 5, name: "Скоростной ум", emoji: "⚡", desc: "Реши 5 заданий быстро", earned: false },
  { id: 6, name: "Звезда недели", emoji: "🌟", desc: "Заходи 7 дней подряд", earned: false },
  { id: 7, name: "Чемпион", emoji: "🏆", desc: "Пройди все уровни", earned: false },
  { id: 8, name: "Математик", emoji: "📐", desc: "100% правильных ответов", earned: false },
];

const PROGRESS_DAYS = [
  { day: "Пн", done: 5 }, { day: "Вт", done: 3 }, { day: "Ср", done: 7 },
  { day: "Чт", done: 4 }, { day: "Пт", done: 6 }, { day: "Сб", done: 2 }, { day: "Вс", done: 0 },
];

function HomeSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center pt-10 pb-8 animate-fade-in">
        <div className="text-7xl mb-4 animate-pulse-soft">🦉</div>
        <h1 className="font-display text-5xl font-extrabold text-[#3A3A5C] mb-3 leading-tight">
          Умняша
        </h1>
        <p className="text-xl text-gray-500 font-body mb-6 max-w-md mx-auto leading-relaxed">
          Математика — это весело! Учись, решай задачи и собирай награды
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-[#5BAADC] text-white font-display font-bold text-lg px-8 py-3.5 rounded-2xl hover-lift shadow-md"
          style={{ boxShadow: "0 6px 20px rgba(91,170,220,0.35)" }}
        >
          Начать заниматься <Icon name="ArrowRight" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { emoji: "📚", value: "50", label: "заданий" },
          { emoji: "🎯", value: "4", label: "уровня" },
          { emoji: "⭐", value: "8", label: "наград" },
        ].map((s, i) => (
          <div key={i} className="card-soft text-center py-5 animate-slide-up hover-lift" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
            <div className="text-3xl mb-1">{s.emoji}</div>
            <div className="font-display text-2xl font-extrabold text-[#3A3A5C]">{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { bg: "bg-sky-50", border: "border-sky-100", emoji: "🔢", title: "Счёт и числа", desc: "От простого к сложному: считай предметы, складывай и вычитай" },
          { bg: "bg-purple-50", border: "border-purple-100", emoji: "🧩", title: "Состав числа", desc: "Пойми из чего состоит каждое число — это важный фундамент" },
          { bg: "bg-orange-50", border: "border-orange-100", emoji: "🧠", title: "Логические задачи", desc: "Ищи закономерности, выбирай лишнее, продолжай ряды" },
          { bg: "bg-green-50", border: "border-green-100", emoji: "🏅", title: "Система наград", desc: "За каждое достижение — красивый значок в коллекцию" },
        ].map((f, i) => (
          <div key={i} className={`${f.bg} border ${f.border} rounded-2xl p-5 animate-slide-up hover-lift`} style={{ animationDelay: `${0.25 + i * 0.07}s` }}>
            <div className="text-3xl mb-2">{f.emoji}</div>
            <h3 className="font-display font-bold text-[#3A3A5C] mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksSection() {
  const [answered, setAnswered] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<"all" | "count" | "compose" | "logic">("all");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  let filtered = filter === "all" ? TASKS : TASKS.filter(t => t.type === filter);
  if (levelFilter !== null) filtered = filtered.filter(t => t.level === levelFilter);

  const handleAnswer = useCallback((taskId: number, option: string) => {
    if (answered[taskId]) return;
    const task = TASKS.find(t => t.id === taskId);
    playSound(task?.answer === option ? "correct" : "wrong");
    setAnswered(prev => ({ ...prev, [taskId]: option }));
  }, [answered]);

  const totalAnswered = Object.keys(answered).length;
  const totalCorrect = Object.entries(answered).filter(([id, ans]) => {
    const task = TASKS.find(t => t.id === Number(id));
    return task?.answer === ans;
  }).length;

  const filterBtns = [
    { key: "all", label: "Все" },
    { key: "count", label: "Счёт 🔢" },
    { key: "compose", label: "Состав 🧩" },
    { key: "logic", label: "Логика 🧠" },
  ] as const;

  const levelBtns = [
    { l: null, label: "Все уровни" },
    { l: 1, label: "🌱 Ур. 1" },
    { l: 2, label: "🌿 Ур. 2" },
    { l: 3, label: "🌳 Ур. 3" },
    { l: 4, label: "🚀 Ур. 4" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5 animate-fade-in">
        <h2 className="font-display text-3xl font-extrabold text-[#3A3A5C] mb-1">Задания</h2>
        <p className="text-gray-400">Выбери задание и ответь на вопрос</p>
      </div>

      {/* Score */}
      {totalAnswered > 0 && (
        <div className="card-soft p-4 mb-4 flex items-center gap-4 animate-fade-in bg-green-50 border border-green-100">
          <div className="text-3xl">🎯</div>
          <div>
            <div className="font-display font-bold text-[#3A3A5C]">Отвечено: {totalAnswered} из {TASKS.length}</div>
            <div className="text-sm text-gray-500">Правильно: {totalCorrect} ({totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%)</div>
          </div>
          <div className="ml-auto">
            <div className="w-20 h-2 bg-gray-100 rounded-full">
              <div className="h-2 rounded-full bg-green-400 transition-all" style={{ width: `${(totalAnswered / TASKS.length) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-3 animate-slide-up">
        {filterBtns.map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`px-4 py-2 rounded-xl font-display font-semibold text-sm transition-all ${
              filter === btn.key ? "bg-[#5BAADC] text-white shadow-md" : "bg-white text-gray-500 border border-gray-100 hover:border-[#5BAADC]"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2 mb-5 animate-slide-up" style={{ animationDelay: "0.07s" }}>
        {levelBtns.map(btn => (
          <button
            key={String(btn.l)}
            onClick={() => setLevelFilter(btn.l)}
            className={`px-3 py-1.5 rounded-xl font-display font-semibold text-xs transition-all ${
              levelFilter === btn.l ? "bg-[#A78BDB] text-white shadow-sm" : "bg-white text-gray-400 border border-gray-100 hover:border-[#A78BDB]"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-4 font-display">Показано: {filtered.length} заданий</p>

      {/* Tasks grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((task, i) => {
          const userAnswer = answered[task.id];
          const isCorrect = userAnswer === task.answer;
          return (
            <div
              key={task.id}
              className="card-soft p-5 animate-slide-up transition-all"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-display font-bold px-2.5 py-1 rounded-full ${task.color} text-gray-600`}>
                  {task.level === 1 ? "🌱" : task.level === 2 ? "🌿" : task.level === 3 ? "🌳" : "🚀"} Ур. {task.level}
                </span>
                <span className="text-2xl">{task.emoji}</span>
              </div>
              <h3 className="font-display font-bold text-[#3A3A5C] mb-1 text-sm">{task.title}</h3>
              <p className="text-gray-600 font-semibold mb-4 text-base leading-relaxed">{task.question}</p>

              {!userAnswer ? (
                <div className="grid grid-cols-2 gap-2">
                  {task.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(task.id, opt)}
                      className="py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 font-display font-bold hover:border-[#5BAADC] hover:bg-sky-50 active:scale-95 transition-all text-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : isCorrect ? (
                <div className="text-center py-3 rounded-xl font-display font-bold text-sm bg-green-50 text-green-600 animate-bounce-in">
                  ✅ Верно! Молодец!
                </div>
              ) : (
                <div className="space-y-2 animate-bounce-in">
                  <div className="text-center py-2.5 rounded-xl font-display font-bold text-sm bg-red-50 text-red-500 border border-red-100">
                    ❌ Неправильно
                  </div>
                  <div className="text-center py-2.5 rounded-xl font-display font-bold text-sm bg-green-50 text-green-600 border border-green-100">
                    ✅ Правильный ответ: {task.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressSection() {
  const total = TASKS.length;
  const done = 3;
  const pct = Math.round((done / total) * 100);
  const maxDay = Math.max(...PROGRESS_DAYS.map(d => d.done));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h2 className="font-display text-3xl font-extrabold text-[#3A3A5C] mb-1">Прогресс</h2>
        <p className="text-gray-400">Смотри как растёт твоё мастерство</p>
      </div>

      <div className="card-soft p-6 mb-4 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Пройдено заданий</p>
            <p className="font-display text-4xl font-extrabold text-[#3A3A5C]">
              {done} <span className="text-xl text-gray-300">/ {total}</span>
            </p>
          </div>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center animate-bounce-in"
            style={{ background: `conic-gradient(#5BAADC ${pct * 3.6}deg, #EEF4FA 0deg)` }}
          >
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center font-display font-extrabold text-[#5BAADC]">
              {pct}%
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #5BAADC, #A78BDB)" }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { emoji: "🔥", value: "3", label: "дня подряд" },
          { emoji: "⭐", value: "3", label: "награды" },
          { emoji: "💯", value: "75%", label: "точность" },
        ].map((s, i) => (
          <div key={i} className="card-soft text-center py-4 animate-slide-up" style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
            <div className="text-2xl mb-1">{s.emoji}</div>
            <div className="font-display text-xl font-extrabold text-[#3A3A5C]">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card-soft p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h3 className="font-display font-bold text-[#3A3A5C] mb-4">Задания за неделю</h3>
        <div className="flex items-end gap-2 h-28">
          {PROGRESS_DAYS.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: d.done > 0 ? `${(d.done / maxDay) * 80}px` : "4px",
                  background: d.done > 0 ? "linear-gradient(180deg, #5BAADC, #A78BDB)" : "#F0F0F0",
                  minHeight: "4px",
                }}
              />
              <span className="text-xs text-gray-400 font-display font-semibold">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RewardsSection() {
  const earned = REWARDS.filter(r => r.earned);
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h2 className="font-display text-3xl font-extrabold text-[#3A3A5C] mb-1">Награды</h2>
        <p className="text-gray-400">Собрано {earned.length} из {REWARDS.length}</p>
      </div>

      <div className="card-soft p-5 mb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-[#3A3A5C] text-sm">Коллекция значков</span>
          <span className="text-sm text-gray-400">{earned.length} / {REWARDS.length}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="h-2.5 rounded-full" style={{ width: `${(earned.length / REWARDS.length) * 100}%`, background: "linear-gradient(90deg, #EDBA45, #F4A261)" }} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {REWARDS.map((r, i) => (
          <div key={r.id} className={`card-soft p-4 text-center animate-bounce-in transition-all ${r.earned ? "hover-lift" : "opacity-50 grayscale"}`} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={`text-4xl mb-2 ${r.earned ? "animate-pulse-soft" : ""}`}>{r.emoji}</div>
            <div className="font-display font-bold text-[#3A3A5C] text-xs leading-tight mb-1">{r.name}</div>
            <div className="text-xs text-gray-400 leading-tight">{r.desc}</div>
            {r.earned && <div className="mt-2 text-xs font-display font-bold text-amber-500">Получено ✓</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentsSection() {
  const tips = [
    { emoji: "⏰", title: "Регулярность", desc: "15–20 минут в день дают лучший результат, чем долгие занятия раз в неделю" },
    { emoji: "🎉", title: "Хвалите за процесс", desc: "Отмечайте усилия ребёнка, а не только правильные ответы" },
    { emoji: "🎮", title: "Игровой подход", desc: "Превратите задания в игру — соревнуйтесь вместе или придумывайте истории" },
    { emoji: "📊", title: "Следите за прогрессом", desc: "Раздел «Прогресс» покажет динамику и сильные стороны" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h2 className="font-display text-3xl font-extrabold text-[#3A3A5C] mb-1">Родителям</h2>
        <p className="text-gray-400">Как помочь ребёнку учиться эффективно</p>
      </div>

      <div className="card-soft p-6 mb-5 bg-amber-50 border border-amber-100 animate-slide-up">
        <div className="flex gap-3">
          <span className="text-4xl">👨‍👩‍👧</span>
          <div>
            <h3 className="font-display font-bold text-[#3A3A5C] mb-2">О платформе</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Умняша — интерактивная платформа для детей дошкольного возраста. 20 заданий построены по принципу
              прогрессии: от простого счёта до логических задач. Система наград мотивирует
              возвращаться каждый день.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {tips.map((t, i) => (
          <div key={i} className="card-soft p-5 animate-slide-up hover-lift" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
            <div className="text-3xl mb-2">{t.emoji}</div>
            <h3 className="font-display font-bold text-[#3A3A5C] mb-1">{t.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>

      <div className="card-soft p-5 bg-sky-50 border border-sky-100 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <h3 className="font-display font-bold text-[#3A3A5C] mb-3">Программа по уровням</h3>
        <div className="space-y-2">
          {[
            { l: 1, icon: "🌱", text: "Счёт до 10, распознавание количества (5 заданий)" },
            { l: 2, icon: "🌿", text: "Состав числа, простые примеры (5 заданий)" },
            { l: 3, icon: "🌳", text: "Логика, закономерности, сравнение (5 заданий)" },
            { l: 4, icon: "🚀", text: "Сложение и вычитание до 20 (5 заданий)" },
          ].map(item => (
            <div key={item.l} className="flex items-center gap-3 text-sm">
              <span className="font-display font-bold text-gray-400 w-16">Ур. {item.l}</span>
              <span>{item.icon}</span>
              <span className="text-gray-600">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactsSection() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h2 className="font-display text-3xl font-extrabold text-[#3A3A5C] mb-1">Контакты</h2>
        <p className="text-gray-400">Есть вопросы? Напишите нам</p>
      </div>

      <div className="card-soft p-6 mb-4 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📬</div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Мы рады вашим отзывам, предложениям и вопросам. Отвечаем в течение 24 часов.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: "Mail", label: "Email", value: "alenambarcuman5@gmail.com", href: "mailto:alenambarcuman5@gmail.com" },
            { icon: "MessageCircle", label: "Telegram", value: "@YT_Alen", href: "https://t.me/YT_Alen" },
            { icon: "Phone", label: "Телефон", value: "+7 952 950-09-89", href: "tel:+79529500989" },
            { icon: "ExternalLink", label: "Канал для связи в MAX", value: "Открыть MAX", href: "https://max.ru/join/CZH02dg2N1J6Ru9EpUKAiKM-Q4V2KXow7leOHYBHGZw" },
          ].map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-sky-50 transition-colors cursor-pointer group no-underline">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Icon name={c.icon} fallback="Mail" size={18} className="text-[#5BAADC]" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-display font-semibold">{c.label}</div>
                <div className="font-display font-bold text-[#3A3A5C]">{c.value}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="card-soft p-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <h3 className="font-display font-bold text-[#3A3A5C] mb-4">Написать сообщение</h3>
        <div className="space-y-3">
          <input type="text" placeholder="Ваше имя" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#5BAADC] focus:border-transparent transition-all" />
          <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#5BAADC] focus:border-transparent transition-all" />
          <textarea rows={4} placeholder="Ваш вопрос или предложение..." className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#5BAADC] focus:border-transparent transition-all resize-none" />
          <button className="w-full py-3 bg-[#5BAADC] text-white font-display font-bold rounded-xl hover-lift transition-all" style={{ boxShadow: "0 4px 14px rgba(91,170,220,0.35)" }}>
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [active, setActive] = useState<Section>("home");

  const renderSection = () => {
    switch (active) {
      case "home": return <HomeSection onStart={() => setActive("tasks")} />;
      case "tasks": return <TasksSection />;
      case "progress": return <ProgressSection />;
      case "rewards": return <RewardsSection />;
      case "parents": return <ParentsSection />;
      case "contacts": return <ContactsSection />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #F7F4FF 0%, #EEF6FD 50%, #FFF8F0 100%)" }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setActive("home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🦉</span>
            <span className="font-display font-extrabold text-xl text-[#3A3A5C]">Умняша</span>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.filter(n => n.id !== "home").map(item => (
              <button
                key={item.id}
                onClick={() => setActive(item.id as Section)}
                className={`px-3 py-2 rounded-xl font-display font-semibold text-sm transition-all ${
                  active === item.id ? "bg-[#5BAADC] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-[#3A3A5C]"
                }`}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {renderSection()}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id as Section)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all ${active === item.id ? "bg-sky-50" : ""}`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className={`text-xs font-display font-semibold ${active === item.id ? "text-[#5BAADC]" : "text-gray-400"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <div className="md:hidden h-20" />
    </div>
  );
}