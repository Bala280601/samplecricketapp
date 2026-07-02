import React from 'react';
import { View } from 'react-native';

export const PlayIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <View style={{
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: size * 0.8,
    borderRightWidth: 0,
    borderBottomWidth: size * 0.5,
    borderTopWidth: size * 0.5,
    borderLeftColor: color,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  }} />
);

export const PauseIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: size * 0.8, height: size }}>
    <View style={{ width: size * 0.25, height: size, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ width: size * 0.25, height: size, backgroundColor: color, borderRadius: 2 }} />
  </View>
);

export const FastForwardIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <PlayIcon size={size * 0.8} color={color} />
    <View style={{ marginLeft: -size * 0.2 }}>
      <PlayIcon size={size * 0.8} color={color} />
    </View>
  </View>
);

export const TrophyIcon = ({ size = 24, color = '#FFD700' }: { size?: number; color?: string }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
    {/* Cup top */}
    <View style={{ width: size * 0.6, height: size * 0.45, backgroundColor: color, borderBottomLeftRadius: size * 0.25, borderBottomRightRadius: size * 0.25, borderTopLeftRadius: size * 0.08, borderTopRightRadius: size * 0.08, position: 'relative' }}>
      {/* Handles */}
      <View style={{ position: 'absolute', left: -size * 0.12, top: size * 0.05, width: size * 0.15, height: size * 0.25, borderWidth: size * 0.04, borderColor: color, borderRadius: size * 0.08, backgroundColor: 'transparent' }} />
      <View style={{ position: 'absolute', right: -size * 0.12, top: size * 0.05, width: size * 0.15, height: size * 0.25, borderWidth: size * 0.04, borderColor: color, borderRadius: size * 0.08, backgroundColor: 'transparent' }} />
    </View>
    {/* Stem */}
    <View style={{ width: size * 0.12, height: size * 0.18, backgroundColor: color }} />
    {/* Base */}
    <View style={{ width: size * 0.5, height: size * 0.12, backgroundColor: color, borderRadius: size * 0.02 }} />
  </View>
);

export const BatIcon = ({ size = 24, color = '#E69A65' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center' }}>
    {/* Grip */}
    <View style={{ width: size * 0.12, height: size * 0.35, backgroundColor: '#2C3E50', borderRadius: size * 0.05 }} />
    {/* Blade */}
    <View style={{ width: size * 0.24, height: size * 0.65, backgroundColor: color, borderBottomLeftRadius: size * 0.06, borderBottomRightRadius: size * 0.06, borderTopLeftRadius: size * 0.02, borderTopRightRadius: size * 0.02, borderWidth: 1, borderColor: '#B87333' }} />
  </View>
);

export const BallIcon = ({ size = 24, color = '#E74C3C' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, borderWidth: 1.5, borderColor: '#ECF0F1', justifyContent: 'center', alignItems: 'center' }}>
    {/* Seam line */}
    <View style={{ width: size, height: 1, backgroundColor: '#fff', opacity: 0.8, transform: [{ rotate: '45deg' }] }} />
  </View>
);

export const BackIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: size * 0.65, height: size * 0.08, backgroundColor: color, position: 'absolute' }} />
    <View style={{
      width: size * 0.32,
      height: size * 0.32,
      borderLeftWidth: size * 0.08,
      borderTopWidth: size * 0.08,
      borderColor: color,
      transform: [{ rotate: '-45deg' }],
      position: 'absolute',
      left: size * 0.18,
    }} />
  </View>
);

export const WicketIcon = ({ size = 24, color = '#D35400' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, justifyContent: 'flex-end', alignItems: 'center' }}>
    {/* Bails */}
    <View style={{ flexDirection: 'row', width: size * 0.85, height: size * 0.08, justifyContent: 'space-between', marginBottom: size * 0.04 }}>
      <View style={{ width: size * 0.38, height: '100%', backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: size * 0.38, height: '100%', backgroundColor: color, borderRadius: 1 }} />
    </View>
    {/* Stumps */}
    <View style={{ flexDirection: 'row', width: size * 0.75, height: size * 0.8, justifyContent: 'space-between' }}>
      <View style={{ width: size * 0.11, height: '100%', backgroundColor: color, borderTopLeftRadius: 1, borderTopRightRadius: 1 }} />
      <View style={{ width: size * 0.11, height: '100%', backgroundColor: color, borderTopLeftRadius: 1, borderTopRightRadius: 1 }} />
      <View style={{ width: size * 0.11, height: '100%', backgroundColor: color, borderTopLeftRadius: 1, borderTopRightRadius: 1 }} />
    </View>
  </View>
);

export const UndoIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    {/* Circular Arrow */}
    <View style={{
      width: size * 0.65,
      height: size * 0.65,
      borderRadius: (size * 0.65) / 2,
      borderWidth: size * 0.08,
      borderColor: color,
      borderTopColor: 'transparent',
      transform: [{ rotate: '-45deg' }],
      justifyContent: 'center',
      alignItems: 'center'
    }} />
    {/* Arrow Head */}
    <View style={{
      position: 'absolute',
      top: size * 0.12,
      left: size * 0.08,
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: size * 0.2,
      borderRightWidth: size * 0.2,
      borderBottomWidth: size * 0.3,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: color,
      transform: [{ rotate: '-90deg' }]
    }} />
  </View>
);
