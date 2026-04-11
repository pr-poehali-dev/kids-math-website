import React, { useState, useCallback } from "react";
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
  { id: 1,  level: 1, type: "count", title: "Считаем яблоки",     question: "Сколько яблок? 🍎🍎🍎🍎🍎",               answer: "5",  options: ["3","4","5","6"],          color: "bg-sky-100",    emoji: "🍎", hint: "Посчитай каждое яблоко по одному: 1, 2, 3, 4, 5. Всего 5 яблок!" },
  { id: 2,  level: 1, type: "count", title: "Считаем звёздочки",  question: "Сколько звёздочек? ⭐⭐⭐",              answer: "3",  options: ["2","3","4","5"],          color: "bg-green-100",  emoji: "⭐", hint: "Считай вслух: 1, 2, 3. Звёздочек всего три!" },
  { id: 3,  level: 1, type: "count", title: "Считаем мячики",     question: "Сколько мячиков? ⚽⚽⚽⚽⚽⚽⚽",         answer: "7",  options: ["5","6","7","8"],          color: "bg-yellow-100", emoji: "⚽", hint: "Считай по порядку: 1, 2, 3, 4, 5, 6, 7. Семь мячиков!" },
  { id: 4,  level: 1, type: "count", title: "Считаем сердечки",   question: "Сколько сердечек? ❤️❤️❤️❤️",            answer: "4",  options: ["3","4","5","6"],          color: "bg-pink-100",   emoji: "❤️", hint: "Посчитай сердечки: 1, 2, 3, 4. Их четыре!" },
  { id: 5,  level: 1, type: "count", title: "Считаем грибочки",   question: "Сколько грибочков? 🍄🍄🍄🍄🍄🍄",       answer: "6",  options: ["4","5","6","7"],          color: "bg-amber-100",  emoji: "🍄", hint: "Пересчитай грибочки: 1, 2, 3, 4, 5, 6. Всего шесть!" },
  { id: 6,  level: 1, type: "count", title: "Считаем бабочек",    question: "Сколько бабочек? 🦋🦋",                answer: "2",  options: ["1","2","3","4"],          color: "bg-violet-100", emoji: "🦋", hint: "Здесь всего две бабочки: вот одна и вот вторая!" },
  { id: 7,  level: 1, type: "count", title: "Считаем рыбок",      question: "Сколько рыбок? 🐟🐟🐟🐟🐟🐟🐟🐟",      answer: "8",  options: ["6","7","8","9"],          color: "bg-blue-100",   emoji: "🐟", hint: "Посчитай рыбок: 1, 2, 3, 4, 5, 6, 7, 8. Восемь рыбок!" },
  { id: 8,  level: 1, type: "count", title: "Считаем морковки",   question: "Сколько морковок? 🥕🥕🥕",             answer: "3",  options: ["2","3","4","5"],          color: "bg-orange-100", emoji: "🥕", hint: "Три морковки: одна, две, три. Не забудь посчитать все!" },
  { id: 9,  level: 1, type: "count", title: "Считаем пчёлок",     question: "Сколько пчёлок? 🐝🐝🐝🐝🐝🐝🐝🐝🐝",  answer: "9",  options: ["7","8","9","10"],         color: "bg-yellow-100", emoji: "🐝", hint: "Пчёлок девять: 1, 2, 3, 4, 5, 6, 7, 8, 9. Считай внимательно!" },
  { id: 10, level: 1, type: "count", title: "Считаем шарики",     question: "Сколько шариков? 🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈", answer: "10", options: ["8","9","10","11"],         color: "bg-red-100",    emoji: "🎈", hint: "Десять шариков! Считай по одному и не пропускай ни один!" },
  { id: 11, level: 1, type: "count", title: "Считаем котиков",    question: "Сколько котиков? 🐱🐱🐱🐱",            answer: "4",  options: ["3","4","5","6"],          color: "bg-rose-100",   emoji: "🐱", hint: "Четыре котика: 1, 2, 3, 4. Мяу!" },
  { id: 12, level: 1, type: "count", title: "Считаем утят",       question: "Сколько утят? 🐥🐥🐥🐥🐥🐥",           answer: "6",  options: ["4","5","6","7"],          color: "bg-lime-100",   emoji: "🐥", hint: "Шесть утят: 1, 2, 3, 4, 5, 6. Кря-кря!" },
  { id: 13, level: 1, type: "count", title: "Считаем конфеты",    question: "Сколько конфет? 🍬🍬🍬🍬🍬🍬🍬",       answer: "7",  options: ["5","6","7","8"],          color: "bg-fuchsia-100",emoji: "🍬", hint: "Семь конфет: 1, 2, 3, 4, 5, 6, 7. Вкусно!" },
  { id: 14, level: 1, type: "count", title: "Считаем снежинки",   question: "Сколько снежинок? ❄️❄️❄️❄️❄️",         answer: "5",  options: ["4","5","6","7"],          color: "bg-cyan-100",   emoji: "❄️", hint: "Пять снежинок: 1, 2, 3, 4, 5. Считай каждую!" },

  // Уровень 2 — состав числа (12 заданий)
  { id: 15, level: 2, type: "compose", title: "Состав числа 7",  question: "7 = 3 + ?",     answer: "4",  options: ["3","4","5","6"],   color: "bg-purple-100",  emoji: "🔢", hint: "Из 7 уже есть 3. Сколько не хватает до 7? Считай: 4, 5, 6, 7 — нужно ещё 4!" },
  { id: 16, level: 2, type: "compose", title: "Состав числа 10", question: "10 = ? + 6",    answer: "4",  options: ["2","3","4","5"],   color: "bg-orange-100",  emoji: "🧩", hint: "Из 10 уже есть 6. Считай обратно: 10 − 6 = 4. Значит не хватает 4!" },
  { id: 17, level: 2, type: "compose", title: "Состав числа 9",  question: "9 = 5 + ?",     answer: "4",  options: ["3","4","5","6"],   color: "bg-violet-100",  emoji: "🎯", hint: "Есть 5, нужно получить 9. Досчитай от 5 до 9: 6, 7, 8, 9 — это ещё 4!" },
  { id: 18, level: 2, type: "compose", title: "Состав числа 8",  question: "8 = ? + 3",     answer: "5",  options: ["3","4","5","6"],   color: "bg-cyan-100",    emoji: "🎲", hint: "Надо получить 8, а 3 уже есть. 8 − 3 = 5. Значит первое слагаемое — 5!" },
  { id: 19, level: 2, type: "compose", title: "Состав числа 5",  question: "5 = ? + 2",     answer: "3",  options: ["1","2","3","4"],   color: "bg-teal-100",    emoji: "🐸", hint: "Нужна сумма 5, и 2 уже есть. 5 − 2 = 3. Значит первое число — 3!" },
  { id: 20, level: 2, type: "compose", title: "Состав числа 6",  question: "6 = 4 + ?",     answer: "2",  options: ["1","2","3","4"],   color: "bg-lime-100",    emoji: "🌿", hint: "Есть 4, нужно 6. Сколько не хватает? 6 − 4 = 2!" },
  { id: 21, level: 2, type: "compose", title: "Состав числа 4",  question: "4 = ? + 1",     answer: "3",  options: ["1","2","3","4"],   color: "bg-amber-100",   emoji: "🍀", hint: "Нужна сумма 4, одно из чисел — 1. 4 − 1 = 3. Ответ: 3!" },
  { id: 22, level: 2, type: "compose", title: "Состав числа 3",  question: "3 = 1 + ?",     answer: "2",  options: ["1","2","3","4"],   color: "bg-rose-100",    emoji: "🌺", hint: "Есть 1, нужно 3. Значит нужно ещё 2, ведь 1 + 2 = 3!" },
  { id: 23, level: 2, type: "compose", title: "Состав числа 8",  question: "8 = 6 + ?",     answer: "2",  options: ["1","2","3","4"],   color: "bg-sky-100",     emoji: "🎀", hint: "Из 8 уже есть 6. Сколько осталось? 8 − 6 = 2!" },
  { id: 24, level: 2, type: "compose", title: "Состав числа 10", question: "10 = 7 + ?",    answer: "3",  options: ["2","3","4","5"],   color: "bg-green-100",   emoji: "🍃", hint: "Есть 7, нужно 10. Досчитай: 8, 9, 10 — это ещё 3!" },
  { id: 25, level: 2, type: "compose", title: "Состав числа 9",  question: "9 = ? + 4",     answer: "5",  options: ["4","5","6","7"],   color: "bg-fuchsia-100", emoji: "🌸", hint: "Нужна сумма 9, одно слагаемое — 4. 9 − 4 = 5!" },
  { id: 26, level: 2, type: "compose", title: "Состав числа 7",  question: "7 = ? + 5",     answer: "2",  options: ["1","2","3","4"],   color: "bg-indigo-100",  emoji: "💎", hint: "Нужно 7, есть 5. Сколько не хватает? 7 − 5 = 2!" },

  // Уровень 3 — логика (12 заданий)
  { id: 27, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: кошка, собака, роза, рыба?",         answer: "роза",       options: ["кошка","собака","роза","рыба"],           color: "bg-pink-100",   emoji: "🌹", hint: "Кошка, собака и рыба — это животные. А роза — это цветок, растение. Роза лишняя!" },
  { id: 28, level: 3, type: "logic", title: "Следующее число",   question: "2, 4, 6, 8, ?",                                  answer: "10",         options: ["9","10","11","12"],                       color: "bg-yellow-100", emoji: "🔄", hint: "Каждое следующее число больше на 2: 2+2=4, 4+2=6, 6+2=8, 8+2=10!" },
  { id: 29, level: 3, type: "logic", title: "Продолжи ряд",      question: "1, 3, 5, 7, ?",                                  answer: "9",          options: ["8","9","10","11"],                        color: "bg-blue-100",   emoji: "🧮", hint: "Это нечётные числа — каждое больше предыдущего на 2: 7 + 2 = 9!" },
  { id: 30, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: стол, стул, диван, яблоко?",          answer: "яблоко",     options: ["стол","стул","диван","яблоко"],           color: "bg-green-100",  emoji: "🍎", hint: "Стол, стул и диван — это мебель. Яблоко — это фрукт, еда. Яблоко лишнее!" },
  { id: 31, level: 3, type: "logic", title: "Продолжи ряд",      question: "10, 20, 30, ?",                                   answer: "40",         options: ["35","38","40","45"],                      color: "bg-orange-100", emoji: "📏", hint: "Каждое число больше на 10: 10, 20, 30 — значит следующее 30+10=40!" },
  { id: 32, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: автобус, самолёт, велосипед, книга?", answer: "книга",      options: ["автобус","самолёт","велосипед","книга"],  color: "bg-sky-100",    emoji: "📚", hint: "Автобус, самолёт и велосипед — это транспорт. Книга — это предмет для чтения. Книга лишняя!" },
  { id: 33, level: 3, type: "logic", title: "Продолжи ряд",      question: "5, 10, 15, ?",                                    answer: "20",         options: ["17","18","19","20"],                      color: "bg-teal-100",   emoji: "🎵", hint: "Это таблица пятёрок: каждое число больше на 5. 15 + 5 = 20!" },
  { id: 34, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: яблоко, груша, морковь, банан?",      answer: "морковь",    options: ["яблоко","груша","морковь","банан"],       color: "bg-lime-100",   emoji: "🥕", hint: "Яблоко, груша и банан — это фрукты. Морковь — это овощ. Морковь лишняя!" },
  { id: 35, level: 3, type: "logic", title: "Больше или меньше", question: "Что меньше: 8 или 5?",                            answer: "5",          options: ["5","6","7","8"],                          color: "bg-violet-100", emoji: "⚖️", hint: "5 меньше 8 — на числовой линейке 5 стоит левее, значит оно меньше!" },
  { id: 36, level: 3, type: "logic", title: "Продолжи ряд",      question: "3, 6, 9, ?",                                      answer: "12",         options: ["10","11","12","13"],                      color: "bg-rose-100",   emoji: "🔁", hint: "Это таблица тройки: каждое число больше на 3. 9 + 3 = 12!" },
  { id: 37, level: 3, type: "logic", title: "Что лишнее?",       question: "Что лишнее: красный, синий, круглый, зелёный?",   answer: "круглый",    options: ["красный","синий","круглый","зелёный"],    color: "bg-fuchsia-100",emoji: "🎨", hint: "Красный, синий и зелёный — это цвета. Круглый — это форма. Круглый лишний!" },
  { id: 38, level: 3, type: "logic", title: "Сравни числа",      question: "Какое число между 4 и 6?",                        answer: "5",          options: ["3","4","5","7"],                          color: "bg-amber-100",  emoji: "🔍", hint: "Между 4 и 6 стоит число 5: …4, 5, 6… Это 5!" },

  // Уровень 4 — сложение и вычитание (12 заданий)
  { id: 39, level: 4, type: "count",   title: "Сложение",              question: "8 + 7 = ?",      answer: "15", options: ["13","14","15","16"], color: "bg-teal-100",    emoji: "➕", hint: "Прибавь по частям: 8 + 2 = 10, потом 10 + 5 = 15. Ответ: 15!" },
  { id: 40, level: 4, type: "compose", title: "Вычитание",             question: "20 − 8 = ?",     answer: "12", options: ["10","11","12","13"], color: "bg-indigo-100",  emoji: "➖", hint: "Вычти по частям: 20 − 10 = 10, потом 10 + 2 = 12. Ответ: 12!" },
  { id: 41, level: 4, type: "count",   title: "Сложение",              question: "13 + 5 = ?",     answer: "18", options: ["16","17","18","19"], color: "bg-sky-100",     emoji: "🔵", hint: "13 + 5: считай от 13 ещё 5 шагов — 14, 15, 16, 17, 18. Ответ: 18!" },
  { id: 42, level: 4, type: "compose", title: "Вычитание",             question: "15 − 7 = ?",     answer: "8",  options: ["6","7","8","9"],     color: "bg-rose-100",    emoji: "🔴", hint: "15 − 7: считай назад от 15 семь шагов — 14, 13, 12, 11, 10, 9, 8. Ответ: 8!" },
  { id: 43, level: 4, type: "compose", title: "Пропущенное число",     question: "? + 9 = 17",     answer: "8",  options: ["6","7","8","9"],     color: "bg-amber-100",   emoji: "❓", hint: "Неизвестное число = 17 − 9 = 8. Проверяем: 8 + 9 = 17. Верно!" },
  { id: 44, level: 4, type: "count",   title: "Сложение",              question: "6 + 8 = ?",      answer: "14", options: ["12","13","14","15"], color: "bg-green-100",   emoji: "➕", hint: "6 + 8: сначала 6 + 4 = 10, потом 10 + 4 = 14. Ответ: 14!" },
  { id: 45, level: 4, type: "compose", title: "Вычитание",             question: "18 − 9 = ?",     answer: "9",  options: ["7","8","9","10"],    color: "bg-violet-100",  emoji: "➖", hint: "18 − 9: если 9 + 9 = 18, значит 18 − 9 = 9!" },
  { id: 46, level: 4, type: "count",   title: "Сложение",              question: "9 + 9 = ?",      answer: "18", options: ["16","17","18","19"], color: "bg-orange-100",  emoji: "🟠", hint: "9 + 9: это два раза по 9. 9 + 1 = 10, 10 + 8 = 18. Ответ: 18!" },
  { id: 47, level: 4, type: "compose", title: "Пропущенное число",     question: "14 − ? = 6",     answer: "8",  options: ["6","7","8","9"],     color: "bg-cyan-100",    emoji: "🔣", hint: "Неизвестное = 14 − 6 = 8. Проверяем: 14 − 8 = 6. Верно!" },
  { id: 48, level: 4, type: "count",   title: "Сложение трёх чисел",   question: "3 + 4 + 5 = ?",  answer: "12", options: ["10","11","12","13"], color: "bg-lime-100",    emoji: "✨", hint: "Складывай по шагам: 3 + 4 = 7, потом 7 + 5 = 12. Ответ: 12!" },
  { id: 49, level: 4, type: "compose", title: "Вычитание",             question: "20 − 13 = ?",    answer: "7",  options: ["5","6","7","8"],     color: "bg-fuchsia-100", emoji: "🟣", hint: "20 − 13: от 13 до 20 нужно пройти 7 шагов: 14, 15, 16, 17, 18, 19, 20. Ответ: 7!" },
  { id: 50, level: 4, type: "count",   title: "Сложение",              question: "7 + 6 = ?",      answer: "13", options: ["11","12","13","14"], color: "bg-pink-100",    emoji: "💫", hint: "7 + 6: до 10 нужно 3, значит 7 + 3 = 10, потом 10 + 3 = 13. Ответ: 13!" },

  // Уровень 5 — сравнение чисел (20 заданий)
  { id: 51, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число больше: 3 или 7?",    answer: "7",  options: ["3","5","6","7"],    color: "bg-sky-100",     emoji: "⚖️", hint: "7 больше 3 — на числовой линейке 7 стоит правее, значит оно больше!" },
  { id: 52, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число меньше: 9 или 4?",    answer: "4",  options: ["4","6","7","9"],    color: "bg-green-100",   emoji: "🔽", hint: "4 меньше 9 — на линейке цифра 4 стоит левее цифры 9!" },
  { id: 53, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число больше: 5 или 2?",    answer: "5",  options: ["2","3","4","5"],    color: "bg-violet-100",  emoji: "🔼", hint: "5 больше 2 — на линейке 5 стоит правее, значит оно больше!" },
  { id: 54, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число меньше: 6 или 10?",   answer: "6",  options: ["6","7","8","10"],   color: "bg-amber-100",   emoji: "⚖️", hint: "6 меньше 10 — на линейке 6 стоит левее, значит оно меньше!" },
  { id: 55, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число больше: 8 или 1?",    answer: "8",  options: ["1","4","6","8"],    color: "bg-rose-100",    emoji: "🔼", hint: "8 больше 1 — чем дальше число от нуля, тем оно больше!" },
  { id: 56, level: 5, type: "compare", title: "Найди наибольшее", question: "Какое число самое большое: 3, 7, 5, 1?", answer: "7", options: ["1","3","5","7"], color: "bg-orange-100", emoji: "🏆", hint: "Сравниваем все числа: 1 < 3 < 5 < 7. Самое большое — 7!" },
  { id: 57, level: 5, type: "compare", title: "Найди наименьшее", question: "Какое число самое маленькое: 8, 2, 6, 4?", answer: "2", options: ["2","4","6","8"], color: "bg-teal-100",  emoji: "🐜", hint: "Сравниваем: 2 < 4 < 6 < 8. Самое маленькое — 2!" },
  { id: 58, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число больше: 12 или 9?",   answer: "12", options: ["9","10","11","12"], color: "bg-indigo-100",  emoji: "🔼", hint: "12 больше 9 — двузначные числа больше однозначных одинаковой длины, и 12 > 9!" },
  { id: 59, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число меньше: 15 или 11?",  answer: "11", options: ["11","12","13","15"],color: "bg-lime-100",    emoji: "🔽", hint: "11 меньше 15 — оба двузначные, но 11 стоит раньше на числовой линейке!" },
  { id: 60, level: 5, type: "compare", title: "Найди наибольшее", question: "Какое число самое большое: 10, 5, 8, 3?", answer: "10", options: ["3","5","8","10"], color: "bg-cyan-100", emoji: "🥇", hint: "Сравниваем: 3 < 5 < 8 < 10. Самое большое — 10!" },
  { id: 61, level: 5, type: "compare", title: "Между числами",   question: "Какое число стоит между 6 и 8?",  answer: "7",  options: ["5","6","7","9"],    color: "bg-pink-100",    emoji: "🎯", hint: "Между 6 и 8 стоит 7: …5, 6, 7, 8, 9… Это ровно посередине!" },
  { id: 62, level: 5, type: "compare", title: "Между числами",   question: "Какое число стоит между 9 и 11?", answer: "10", options: ["8","9","10","12"],  color: "bg-yellow-100",  emoji: "🎯", hint: "Между 9 и 11 стоит 10: …8, 9, 10, 11, 12… Ответ: 10!" },
  { id: 63, level: 5, type: "compare", title: "Найди наименьшее", question: "Какое число самое маленькое: 12, 7, 15, 9?", answer: "7", options: ["7","9","12","15"], color: "bg-fuchsia-100", emoji: "🐛", hint: "Сравниваем: 7 < 9 < 12 < 15. Самое маленькое — 7!" },
  { id: 64, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число больше: 20 или 15?",  answer: "20", options: ["15","16","18","20"], color: "bg-purple-100",  emoji: "🔼", hint: "20 больше 15 — считай: 15, 16, 17, 18, 19, 20. Двадцать стоит дальше!" },
  { id: 65, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число меньше: 13 или 17?",  answer: "13", options: ["13","14","15","17"], color: "bg-blue-100",    emoji: "🔽", hint: "13 меньше 17 — 13 стоит раньше на числовой линейке!" },
  { id: 66, level: 5, type: "compare", title: "Между числами",   question: "Какое число стоит между 14 и 16?", answer: "15", options: ["13","14","15","17"], color: "bg-emerald-100", emoji: "🎯", hint: "Между 14 и 16 стоит 15: …13, 14, 15, 16, 17… Ответ: 15!" },
  { id: 67, level: 5, type: "compare", title: "Найди наибольшее", question: "Какое число самое большое: 6, 14, 9, 11?", answer: "14", options: ["6","9","11","14"], color: "bg-red-100",  emoji: "🥇", hint: "Сравниваем: 6 < 9 < 11 < 14. Самое большое — 14!" },
  { id: 68, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число меньше: 4 или 4?",    answer: "равны", options: ["4","равны","нет ответа","больше"], color: "bg-sky-100", emoji: "🟰", hint: "Это одинаковые числа! 4 = 4. Когда числа одинаковы, они равны — ни одно не меньше!" },
  { id: 69, level: 5, type: "compare", title: "Сравни числа",    question: "Какое число больше: 18 или 13?",  answer: "18", options: ["13","15","16","18"], color: "bg-orange-100",  emoji: "🔼", hint: "18 больше 13 — оба двузначные, но 18 стоит дальше на числовой линейке!" },
  { id: 70, level: 5, type: "compare", title: "Найди наименьшее", question: "Какое число самое маленькое: 20, 11, 17, 5?", answer: "5", options: ["5","11","17","20"], color: "bg-violet-100", emoji: "🐜", hint: "Сравниваем: 5 < 11 < 17 < 20. Пятёрка — однозначное число, оно меньше всех!" },
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
          { emoji: "📚", value: "70", label: "заданий" },
          { emoji: "🎯", value: "5", label: "уровней" },
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

function TasksSection({ answered, setAnswered }: { answered: Record<number, string>; setAnswered: React.Dispatch<React.SetStateAction<Record<number, string>>> }) {
  const [filter, setFilter] = useState<"all" | "count" | "compose" | "logic" | "compare">("all");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  let filtered = filter === "all" ? TASKS : TASKS.filter(t => t.type === filter);
  if (levelFilter !== null) filtered = filtered.filter(t => t.level === levelFilter);

  const handleAnswer = useCallback((taskId: number, option: string) => {
    if (answered[taskId]) return;
    const task = TASKS.find(t => t.id === taskId);
    playSound(task?.answer === option ? "correct" : "wrong");
    setAnswered(prev => ({ ...prev, [taskId]: option }));
  }, [answered, setAnswered]);

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
    { key: "compare", label: "Сравнение ⚖️" },
  ] as const;

  const levelBtns = [
    { l: null, label: "Все уровни" },
    { l: 1, label: "🌱 Ур. 1" },
    { l: 2, label: "🌿 Ур. 2" },
    { l: 3, label: "🌳 Ур. 3" },
    { l: 4, label: "🚀 Ур. 4" },
    { l: 5, label: "⚖️ Ур. 5" },
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
                  {task.level === 1 ? "🌱" : task.level === 2 ? "🌿" : task.level === 3 ? "🌳" : task.level === 4 ? "🚀" : "⚖️"} Ур. {task.level}
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
                  <div className="py-3 px-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex gap-2 items-start">
                      <span className="text-lg leading-none mt-0.5">💡</span>
                      <p className="text-xs text-amber-700 leading-relaxed font-display">{task.hint}</p>
                    </div>
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

function ProgressSection({ totalAnswered, totalCorrect, accuracy, earnedRewards }: { totalAnswered: number; totalCorrect: number; accuracy: number; earnedRewards: number }) {
  const total = TASKS.length;
  const pct = Math.round((totalAnswered / total) * 100);
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
              {totalAnswered} <span className="text-xl text-gray-300">/ {total}</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">Правильно: {totalCorrect}</p>
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
          { emoji: "🎯", value: String(totalCorrect), label: "правильных" },
          { emoji: "⭐", value: String(earnedRewards), label: "наград" },
          { emoji: "💯", value: `${accuracy}%`, label: "точность" },
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

function RewardsSection({ rewards }: { rewards: typeof REWARDS }) {
  const earned = rewards.filter(r => r.earned);
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h2 className="font-display text-3xl font-extrabold text-[#3A3A5C] mb-1">Награды</h2>
        <p className="text-gray-400">Собрано {earned.length} из {rewards.length}</p>
      </div>

      <div className="card-soft p-5 mb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-[#3A3A5C] text-sm">Коллекция значков</span>
          <span className="text-sm text-gray-400">{earned.length} / {rewards.length}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="h-2.5 rounded-full" style={{ width: `${(earned.length / rewards.length) * 100}%`, background: "linear-gradient(90deg, #EDBA45, #F4A261)" }} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rewards.map((r, i) => (
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
              Умняша — интерактивная платформа для детей дошкольного возраста. 70 заданий построены по принципу
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
            { l: 1, icon: "🌱", text: "Счёт до 10, распознавание количества (14 заданий)" },
            { l: 2, icon: "🌿", text: "Состав числа, простые примеры (12 заданий)" },
            { l: 3, icon: "🌳", text: "Логика, закономерности (12 заданий)" },
            { l: 4, icon: "🚀", text: "Сложение и вычитание до 20 (12 заданий)" },
            { l: 5, icon: "⚖️", text: "Сравнение чисел, больше/меньше (20 заданий)" },
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
  const [answered, setAnswered] = useState<Record<number, string>>({});

  const totalAnswered = Object.keys(answered).length;
  const totalCorrect = Object.entries(answered).filter(([id, ans]) => {
    const task = TASKS.find(t => t.id === Number(id));
    return task?.answer === ans;
  }).length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const correctByType = (type: string) =>
    Object.entries(answered).filter(([id, ans]) => {
      const task = TASKS.find(t => t.id === Number(id));
      return task?.type === type && task?.answer === ans;
    }).length;

  const computedRewards = REWARDS.map(r => {
    switch (r.id) {
      case 1: return { ...r, earned: totalAnswered >= 1 };
      case 2: return { ...r, earned: correctByType("count") >= 5 };
      case 3: return { ...r, earned: correctByType("compose") >= 3 };
      case 4: return { ...r, earned: correctByType("logic") >= 3 };
      case 5: return { ...r, earned: totalCorrect >= 10 };
      case 6: return { ...r, earned: false };
      case 7: return { ...r, earned: totalAnswered >= TASKS.length };
      case 8: return { ...r, earned: totalAnswered >= 10 && accuracy === 100 };
      default: return r;
    }
  });

  const renderSection = () => {
    switch (active) {
      case "home": return <HomeSection onStart={() => setActive("tasks")} />;
      case "tasks": return <TasksSection answered={answered} setAnswered={setAnswered} />;
      case "progress": return <ProgressSection totalAnswered={totalAnswered} totalCorrect={totalCorrect} accuracy={accuracy} earnedRewards={computedRewards.filter(r => r.earned).length} />;
      case "rewards": return <RewardsSection rewards={computedRewards} />;
      case "parents": return <ParentsSection />;
      case "contacts": return <ContactsSection />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #F7F4FF 0%, #EEF6FD 50%, #FFF8F0 100%)" }}>

      {/* Мобильный хедер */}
      <header className="md:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => setActive("home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🦉</span>
            <span className="font-display font-extrabold text-xl text-[#3A3A5C]">Умняша</span>
          </button>
        </div>
      </header>

      {/* Десктоп: сайдбар + контент */}
      <div className="hidden md:flex min-h-screen">

        {/* Сайдбар */}
        <aside className="w-60 shrink-0 sticky top-0 h-screen flex flex-col bg-white/80 backdrop-blur-md border-r border-gray-100 px-4 py-6">
          <button onClick={() => setActive("home")} className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity px-2">
            <span className="text-3xl">🦉</span>
            <span className="font-display font-extrabold text-xl text-[#3A3A5C]">Умняша</span>
          </button>

          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActive(item.id as Section)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-display font-semibold text-sm transition-all text-left ${
                  active === item.id
                    ? "bg-[#5BAADC] text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#3A3A5C]"
                }`}
              >
                <span className="text-lg">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="px-4 py-3 bg-sky-50 rounded-2xl">
              <p className="text-xs text-gray-400 font-display font-semibold mb-1">Прогресс</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${Math.round((totalAnswered / TASKS.length) * 100)}%`, background: "linear-gradient(90deg, #5BAADC, #A78BDB)" }} />
                </div>
                <span className="text-xs font-display font-bold text-[#5BAADC]">{totalAnswered}/{TASKS.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 min-w-0 px-8 py-8 overflow-y-auto">
          <div className="max-w-4xl">
            {renderSection()}
          </div>
        </main>
      </div>

      {/* Мобильный контент */}
      <main className="md:hidden px-4 py-6">
        {renderSection()}
      </main>

      {/* Мобильная нижняя навигация */}
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