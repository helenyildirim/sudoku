import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Btn, Header } from '../ui';
import { useTheme } from '../theme';
import { UNITS, candidates, cellName, findHiddenSingles, findNakedSingles } from '../../sudoku';

// Dersler için sabit, kolay bir örnek bulmaca
const DEMO = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'
  .split('')
  .map(Number);

// Küçük, dokunulmaz örnek tahta
function MiniBoard({ values, area = [], focus = null, notes = null }) {
  const { c, boardColor } = useTheme();
  const { width } = useWindowDimensions();
  const cell = Math.floor(Math.min(width - 40, 380) / 9);
  const areaSet = new Set(area);
  return (
    <View
      style={{
        width: cell * 9 + 4,
        height: cell * 9 + 4,
        borderWidth: 2,
        borderColor: c.line,
        borderRadius: 8,
        overflow: 'hidden',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        backgroundColor: c.cell,
      }}
    >
      {values.map((v, i) => {
        const r = Math.floor(i / 9);
        const col = i % 9;
        let bg = c.cell;
        if (areaSet.has(i)) bg = '#F59E0B33';
        if (i === focus) bg = boardColor + '66';
        const thickR = col % 3 === 2 && col !== 8;
        const thickB = r % 3 === 2 && r !== 8;
        const showNotes = notes && i === focus && v === 0;
        return (
          <View
            key={i}
            style={{
              width: cell,
              height: cell,
              backgroundColor: bg,
              alignItems: 'center',
              justifyContent: 'center',
              borderRightWidth: col === 8 ? 0 : thickR ? 2 : 0.5,
              borderBottomWidth: r === 8 ? 0 : thickB ? 2 : 0.5,
              borderRightColor: thickR ? c.line : c.lineSoft,
              borderBottomColor: thickB ? c.line : c.lineSoft,
            }}
          >
            {v !== 0 ? (
              <Text style={{ fontSize: cell * 0.55, fontWeight: '700', color: c.text }}>{v}</Text>
            ) : showNotes ? (
              <View style={{ width: cell, height: cell, flexDirection: 'row', flexWrap: 'wrap', padding: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <View key={n} style={{ width: (cell - 2) / 3, height: (cell - 2) / 3, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: cell * 0.26, fontWeight: '700', color: boardColor }}>
                      {notes.includes(n) ? n : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

// Derslerin içeriği örnek bulmacadan otomatik hesaplanır
function buildLessons() {
  const naked = findNakedSingles(DEMO);
  const hidden = findHiddenSingles(DEMO).filter((h) => h.unit.kind === 'box');
  const hid = hidden[0] || findHiddenSingles(DEMO)[0];
  const n1 = naked[0];
  const n2 = naked[1] || naked[0];
  const cands = candidates(DEMO);
  const multi = DEMO.findIndex((v, i) => v === 0 && cands[i].length >= 3);

  // Yanlış şıklar: hücrenin komşularında zaten olan sayılar
  const options = (cell, answer, area) => {
    const wrong = [...new Set(area.map((a) => DEMO[a]).filter((x) => x && x !== answer))].slice(0, 3);
    const all = [answer, ...wrong].sort((a, b) => a - b);
    return all;
  };
  const row = (r) => [...Array(9).keys()].map((k) => r * 9 + k);
  const col = (k) => [...Array(9).keys()].map((r) => r * 9 + k);

  return [
    {
      id: 'rules',
      title: 'Sudoku Nasıl Oynanır?',
      sub: 'Temel kurallar',
      icon: 'book-outline',
      pages: [
        {
          title: 'Amaç',
          text: 'Sudoku 9×9 bir tahtadır. Boş hücrelere 1\'den 9\'a kadar sayılar yerleştirirsin. Kuralın tek cümlesi: aynı sayı bir satırda, bir sütunda ve bir kutuda iki kez olamaz.',
          board: { values: DEMO },
        },
        {
          title: 'Satırlar',
          text: 'Her yatay satırda 1\'den 9\'a kadar her sayı tam olarak bir kez bulunur. Turuncu satırda şu an 5, 3 ve 7 var; kalan sayılar boşluklara gelecek.',
          board: { values: DEMO, area: row(0) },
        },
        {
          title: 'Sütunlar',
          text: 'Aynı kural dikey sütunlar için de geçerli. Turuncu sütunda hiçbir sayı tekrar edemez.',
          board: { values: DEMO, area: col(4) },
        },
        {
          title: 'Kutular',
          text: 'Kalın çizgilerle ayrılan 3×3\'lük 9 kutu var. Her kutuda da 1-9 arası sayılar birer kez olmalı. Turuncu kutuda 5, 3, 6, 9 ve 8 var.',
          board: { values: DEMO, area: UNITS[0].cells },
        },
      ],
    },
    {
      id: 'naked',
      title: 'Tek Aday',
      sub: 'En kolay yöntem',
      icon: 'bulb-outline',
      pages: [
        {
          title: 'Bir hücreye bak',
          text: `Mavi hücre: ${cellName(n1.cell)}. Turuncu hücreler bu hücrenin satırı, sütunu ve kutusundaki dolu hücreler. Bu hücreye koyabileceğimiz sayılardan bunlar zaten elenir.`,
          board: { values: DEMO, area: n1.area, focus: n1.cell },
        },
        {
          title: 'Geriye tek sayı kalır',
          text: `Turuncu hücrelerde 1-9 arası sayılardan sekizi var; sadece ${n1.value} yok. Demek ki mavi hücreye ${n1.value} gelmeli. Buna "tek aday" denir.`,
          board: { values: DEMO, area: n1.area, focus: n1.cell },
        },
        {
          title: 'Şimdi sen dene',
          text: 'Mavi hücreye hangi sayı gelmeli? Turuncu hücrelere bakıp eksik olanı bul.',
          board: { values: DEMO, area: n2.area, focus: n2.cell },
          quiz: { answer: n2.value, options: options(n2.cell, n2.value, n2.area) },
        },
      ],
    },
    {
      id: 'hidden',
      title: 'Tek Yer',
      sub: 'Sayıya yer ara',
      icon: 'search-outline',
      pages: [
        {
          title: 'Bu sefer sayıyı seç',
          text: `Bir önceki yöntemde hücreye baktık. Şimdi tersini yapacağız: bir birimde (satır, sütun veya kutu) ${hid.value} sayısına bakalım. Turuncu alan: ${hid.unit.name}.`,
          board: { values: DEMO, area: hid.unit.cells },
        },
        {
          title: 'Sadece bir yere sığıyor',
          text: `${hid.unit.name} içinde ${hid.value} sayısı başka hiçbir boş hücreye sığmıyor (satır, sütun veya kutu çakışması var). Sığdığı tek hücre mavi olan: ${cellName(hid.cell)}. Bu yöntem "tek yer" diye geçer.`,
          board: { values: DEMO, area: hid.unit.cells, focus: hid.cell },
        },
        {
          title: 'Şimdi sen dene',
          text: `Turuncu alanda ${hid.value} sayısını mavi hücreye yazabilir miyiz?`,
          board: { values: DEMO, area: hid.unit.cells, focus: hid.cell },
          quiz: { question: 'Doğru mu?', answer: 1, options: [1, 0], labels: ['Evet', 'Hayır'] },
        },
      ],
    },
    {
      id: 'notes',
      title: 'Kalem Notları',
      sub: 'Adayları not al',
      icon: 'pencil-outline',
      pages: [
        {
          title: 'Not nedir?',
          text: 'Emin olmadığın hücrelere küçük notlarla olası sayıları yazabilirsin. Oyunda "Kalem" düğmesini aç, sonra bir sayıya bas.',
          board: { values: DEMO, focus: multi, notes: cands[multi] },
        },
        {
          title: 'Notlar nasıl yardım eder?',
          text: `Bu hücrede ${cands[multi].join(', ')} sayıları mümkün. Bir sayı yerleştirdiğinde aynı satır, sütun ve kutudaki notlar otomatik silinir. Bir hücrede tek not kalırsa o bir "tek aday"dır!`,
          board: { values: DEMO, focus: multi, notes: cands[multi] },
        },
        {
          title: 'Oto Not düğmesi',
          text: 'Oyunda ampulün yanındaki "Oto Not" düğmesi tüm boş hücrelerin olası sayılarını senin için doldurur. Önce kendin dene, takılırsan kullan.',
        },
      ],
    },
    {
      id: 'tips',
      title: 'Akıllı İpucu ve Strateji',
      sub: 'Takılınca ne yapmalı?',
      icon: 'rocket-outline',
      pages: [
        {
          title: 'Akıllı ipucu',
          text: 'Oyundaki ipucu düğmesi sadece sayıyı söylemez; nedenini de gösterir. Hangi hücreye ve hangi satır/sütun/kutuya bakman gerektiğini işaretler, tek aday ve tek yer gibi teknikleri adım adım anlatır.',
        },
        {
          title: 'Tarama stratejisi',
          text: 'En çok tekrar eden sayıdan başla. Bir sayı tahtada 7-8 kez geçiyorsa kalan yerleri kolayca bulunur. Sayı tuşlarındaki küçük kalan sayacı sana hangi sayının bittiğini söyler.',
        },
        {
          title: 'Hazırsın!',
          text: 'Kolay seviyede başla, ipucunu kullanmaktan çekinme. Zamanla ipuçlarına ihtiyacın azalacak. Başarılar!',
        },
      ],
    },
  ];
}

function Quiz({ quiz, onResult }) {
  const { c } = useTheme();
  const [picked, setPicked] = useState(null);
  const ok = picked === quiz.answer;
  return (
    <View style={{ marginTop: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {quiz.options.map((o, i) => {
          const isPicked = picked === o;
          const good = isPicked && o === quiz.answer;
          const bad = isPicked && o !== quiz.answer;
          return (
            <Pressable
              key={o}
              onPress={() => {
                setPicked(o);
                onResult(o === quiz.answer);
              }}
              disabled={picked === quiz.answer}
              style={{
                minWidth: 64,
                paddingHorizontal: 14,
                height: 54,
                marginHorizontal: 6,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: good ? c.success : bad ? c.wrong : c.border,
                backgroundColor: good ? c.success + '22' : bad ? c.wrongBg : c.card,
              }}
            >
              <Text style={{ fontSize: quiz.labels ? 17 : 24, fontWeight: '700', color: c.text }}>
                {quiz.labels ? quiz.labels[i] : o}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {picked != null ? (
        <Text style={{ textAlign: 'center', marginTop: 12, fontWeight: '700', color: ok ? c.success : c.wrong }}>
          {ok ? 'Doğru! 🎉' : 'Tekrar dene, turuncu hücrelere bak.'}
        </Text>
      ) : null}
    </View>
  );
}

export default function Tutorial({ done = {}, onComplete, onBack, onPlay }) {
  const { c } = useTheme();
  const lessons = useMemo(buildLessons, []);
  const [lessonId, setLessonId] = useState(null);
  const [page, setPage] = useState(0);
  const [solved, setSolved] = useState(false);

  const lesson = lessons.find((l) => l.id === lessonId);

  if (!lesson) {
    const doneCount = lessons.filter((l) => done[l.id]).length;
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Header title="Sudoku Okulu" onBack={onBack} />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
          <Text style={{ color: c.sub, fontSize: 14 }}>
            Yeni başlayanlar için adım adım dersler. {doneCount}/{lessons.length} ders tamamlandı.
          </Text>
          {lessons.map((l, i) => (
            <Pressable
              key={l.id}
              onPress={() => {
                setLessonId(l.id);
                setPage(0);
                setSolved(false);
              }}
              style={{
                marginTop: 14,
                backgroundColor: c.card,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: c.border,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: c.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={l.icon} size={26} color={c.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>
                  {i + 1}. {l.title}
                </Text>
                <Text style={{ fontSize: 13, color: c.sub, marginTop: 2 }}>{l.sub}</Text>
              </View>
              <Ionicons
                name={done[l.id] ? 'checkmark-circle' : 'chevron-forward'}
                size={24}
                color={done[l.id] ? c.success : c.sub}
              />
            </Pressable>
          ))}
          <Btn label="Oynamaya Başla" onPress={onPlay} style={{ marginTop: 22 }} />
        </ScrollView>
      </View>
    );
  }

  const p = lesson.pages[page];
  const last = page === lesson.pages.length - 1;
  const blocked = !!p.quiz && !solved;

  const next = () => {
    if (blocked) return;
    if (last) {
      onComplete(lesson.id);
      setLessonId(null);
      return;
    }
    setPage(page + 1);
    setSolved(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header
        title={lesson.title}
        onBack={() => {
          setLessonId(null);
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 14 }}>
          {lesson.pages.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === page ? 22 : 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 3,
                backgroundColor: i <= page ? c.primary : c.border,
              }}
            />
          ))}
        </View>
        {p.board ? <MiniBoard {...p.board} /> : null}
        <Text style={{ fontSize: 21, fontWeight: '800', color: c.text, marginTop: 18 }}>{p.title}</Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: c.text, marginTop: 8 }}>{p.text}</Text>
        {p.quiz ? <Quiz key={lesson.id + page} quiz={p.quiz} onResult={(ok) => ok && setSolved(true)} /> : null}
        <View style={{ flexDirection: 'row', marginTop: 22 }}>
          {page > 0 ? (
            <Btn
              label="Geri"
              variant="outline"
              onPress={() => {
                setPage(page - 1);
                setSolved(false);
              }}
              style={{ flex: 1, marginRight: 10 }}
            />
          ) : null}
          <Btn
            label={last ? 'Dersi Bitir' : 'Devam'}
            onPress={next}
            style={{ flex: 1, opacity: blocked ? 0.4 : 1 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
