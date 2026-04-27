import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { COLORS } from '@/constants/colors';

interface RangeSliderProps {
  min: number;
  max: number;
  low: number;
  high: number;
  onValueChanged: (low: number, high: number) => void;
  onSlidingComplete?: (low: number, high: number) => void;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, low, high, onValueChanged, onSlidingComplete }) => {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);

  // Use refs to keep track of current values during pan to avoid stale closures
  const lowRef = useRef(low);
  const highRef = useRef(high);

  useEffect(() => {
    lowRef.current = low;
    highRef.current = high;
  }, [low, high]);

  const getPosition = (val: number) => {
    if (max === min) return 0;
    return ((val - min) / (max - min)) * widthRef.current;
  };

  const getValueFromPosition = (pos: number) => {
    if (widthRef.current === 0) return min;
    let val = min + (pos / widthRef.current) * (max - min);
    return Math.max(min, Math.min(max, val));
  };

  const startPosLow = useRef(0);
  const startPosHigh = useRef(0);

  const panResponderLow = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startPosLow.current = getPosition(lowRef.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newPos = startPosLow.current + gestureState.dx;
        let newVal = getValueFromPosition(newPos);
        if (newVal > highRef.current) newVal = highRef.current;
        onValueChanged(newVal, highRef.current);
      },
      onPanResponderRelease: () => {
        onSlidingComplete?.(lowRef.current, highRef.current);
      }
    })
  ).current;

  const panResponderHigh = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startPosHigh.current = getPosition(highRef.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newPos = startPosHigh.current + gestureState.dx;
        let newVal = getValueFromPosition(newPos);
        if (newVal < lowRef.current) newVal = lowRef.current;
        onValueChanged(lowRef.current, newVal);
      },
      onPanResponderRelease: () => {
        onSlidingComplete?.(lowRef.current, highRef.current);
      }
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    widthRef.current = e.nativeEvent.layout.width;
  };

  // If width is 0, we still render the track so it can measure
  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={styles.track} />
      {width > 0 && (
        <View
          style={[
            styles.activeTrack,
            { left: getPosition(low), width: getPosition(high) - getPosition(low) },
          ]}
        />
      )}
      {width > 0 && (
        <>
          <View
            style={[styles.thumb, { left: getPosition(low) - 10 }]}
            {...panResponderLow.panHandlers}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
          <View
            style={[styles.thumb, { left: getPosition(high) - 10 }]}
            {...panResponderHigh.panHandlers}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 40, justifyContent: 'center', marginVertical: 10, width: '100%' },
  track: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, width: '100%' },
  activeTrack: { height: 4, backgroundColor: COLORS.accent, borderRadius: 2, position: 'absolute' },
  thumb: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white,
    position: 'absolute', top: 10, elevation: 3, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2,
    borderWidth: 4, borderColor: COLORS.accent,
  },
});
