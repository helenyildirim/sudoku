import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cellName, isPeer, type Board as Cells } from '../game/sudoku';
import type { Colors } from '../theme';

type BoardProps = {
  values: Cells;
  notes: number[];
  puzzle: Cells;
  solution: Cells;
  selected: number | null;
  onSelect: (cell: number) => void;
  cell: number;
  c: Colors;
  boardColor: string;
  hintArea: number[] | null;
  hintCell: number | null;
};

// Tahta ayrı bir bileşen: süre her saniye değişse de tahta yeniden çizilmez
export const Board = React.memo(function Board({
  values,
  notes,
  puzzle,
  solution,
  selected,
  onSelect,
  cell,
  c,
  boardColor,
  hintArea,
  hintCell,
}: BoardProps) {
  const selVal = selected != null ? values[selected] : 0;
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
        const isGiven = puzzle[i] !== 0;
        const isWrong = v !== 0 && v !== solution[i];
        let bg = c.cell;
        if (selected != null) {
          if (isPeer(selected, i)) bg = boardColor + '14';
          if (selVal !== 0 && v === selVal) bg = boardColor + '30';
          if (i === selected) bg = boardColor + '45';
        }
        if (hintArea && hintArea.includes(i)) bg = '#F59E0B33';
        if (i === hintCell) bg = '#F59E0B77';
        if (isWrong) bg = c.wrongBg;
        const thickR = col % 3 === 2 && col !== 8;
        const thickB = r % 3 === 2 && r !== 8;
        return (
          <Pressable
            key={i}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={`${cellName(i)}: ${v || 'boş'}`}
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
              <Text
                style={{
                  fontSize: cell * 0.55,
                  fontWeight: isGiven ? '700' : '500',
                  color: isWrong ? c.wrong : isGiven ? c.text : boardColor,
                }}
              >
                {v}
              </Text>
            ) : notes[i] ? (
              <View style={{ width: cell, height: cell, flexDirection: 'row', flexWrap: 'wrap', padding: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <View
                    key={n}
                    style={{
                      width: (cell - 2) / 3,
                      height: (cell - 2) / 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: cell * 0.24, color: c.sub }}>{notes[i] & (1 << n) ? n : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
});
