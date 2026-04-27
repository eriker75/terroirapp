import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';
import { RangeSlider } from './RangeSlider';

interface PriceFilterInputProps {
  globalMin: number;
  globalMax: number;
  lowValue: string;
  highValue: string;
  onValuesChange: (low: string, high: string) => void;
  prefix?: string;
  suffix?: string;
}

export const PriceFilterInput: React.FC<PriceFilterInputProps> = ({
  globalMin,
  globalMax,
  lowValue,
  highValue,
  onValuesChange,
  prefix = '',
  suffix = '',
}) => {
  const [internalLow, setInternalLow] = useState(lowValue);
  const [internalHigh, setInternalHigh] = useState(highValue);

  useEffect(() => {
    setInternalLow(lowValue);
    setInternalHigh(highValue);
  }, [lowValue, highValue]);

  const handleSliderChange = (newLow: number, newHigh: number) => {
    // Round to 2 decimals max
    const lowStr = (Math.round(newLow * 100) / 100).toString();
    const highStr = (Math.round(newHigh * 100) / 100).toString();
    setInternalLow(lowStr);
    setInternalHigh(highStr);
  };

  const handleSlidingComplete = (newLow: number, newHigh: number) => {
    const lowStr = (Math.round(newLow * 100) / 100).toString();
    const highStr = (Math.round(newHigh * 100) / 100).toString();
    onValuesChange(lowStr, highStr);
  };

  const handleBlur = () => {
    let l = Number(internalLow);
    let h = Number(internalHigh);

    if (!internalLow) l = globalMin;
    if (!internalHigh) h = globalMax;

    if (l > h) {
      const temp = l;
      l = h;
      h = temp;
    }

    l = Math.max(globalMin, Math.min(globalMax, l));
    h = Math.max(globalMin, Math.min(globalMax, h));

    const format = (n: number) => (Math.round(n * 100) / 100).toString();
    const lStr = format(l);
    const hStr = format(h);

    setInternalLow(lStr);
    setInternalHigh(hStr);
    onValuesChange(lStr, hStr);
  };

  const currentLowNum = Number(internalLow) || globalMin;
  const currentHighNum = Number(internalHigh) || globalMax;

  return (
    <View style={styles.container}>
      <View style={styles.rangeRow}>
        <TextInput
          style={styles.rangeInput}
          placeholder={`Mínimo ${suffix}`}
          placeholderTextColor={COLORS.muted}
          keyboardType="numeric"
          value={internalLow}
          onChangeText={(val) => {
            setInternalLow(val);
            onValuesChange(val, internalHigh);
          }}
          onBlur={handleBlur}
        />
        <Text style={styles.rangeDivider}>-</Text>
        <TextInput
          style={styles.rangeInput}
          placeholder={`Máximo ${suffix}`}
          placeholderTextColor={COLORS.muted}
          keyboardType="numeric"
          value={internalHigh}
          onChangeText={(val) => {
            setInternalHigh(val);
            onValuesChange(internalLow, val);
          }}
          onBlur={handleBlur}
        />
      </View>
      <View style={styles.sliderWrapper}>
        <RangeSlider
          min={globalMin}
          max={globalMax}
          low={Math.max(globalMin, Math.min(globalMax, currentLowNum))}
          high={Math.max(globalMin, Math.min(globalMax, currentHighNum))}
          onValueChanged={handleSliderChange}
          onSlidingComplete={handleSlidingComplete}
        />
        <View style={styles.labelsRow}>
          <Text style={styles.sliderLabel}>{prefix}{globalMin}{suffix}</Text>
          <Text style={styles.sliderLabel}>{prefix}{globalMax}{suffix}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', gap: 8 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rangeInput: {
    flex: 1, height: 44, borderRadius: 12, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16,
    color: COLORS.darkBrown, fontSize: 14,
  },
  rangeDivider: { fontSize: 16, color: COLORS.muted, fontWeight: '500' },
  sliderWrapper: { paddingHorizontal: 10, marginTop: 4 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  sliderLabel: { fontSize: 12, color: COLORS.muted },
});
