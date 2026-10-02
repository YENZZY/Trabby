import React from 'react';
import { G, Ellipse, Circle, Path } from 'react-native-svg';

// 통통한 거북이 트라비 (중심 기준 약 50px)
export function Turtle({ x, y, color }: { x: number; y: number; color: string }) {
  const skin = '#9BDB8E';
  return (
    <G transform={`translate(${x},${y})`}>
      <Ellipse cx={-13} cy={14} rx={7} ry={5} fill={skin} />
      <Ellipse cx={13} cy={14} rx={7} ry={5} fill={skin} />
      <Ellipse cx={0} cy={4} rx={21} ry={17} fill={color} stroke="#fff" strokeWidth={3} />
      <Path d="M-8 -2 L0 -8 L8 -2 L5 8 L-5 8 Z" fill="#fff" opacity={0.35} />
      <Circle cx={0} cy={-19} r={13} fill={skin} stroke="#fff" strokeWidth={3} />
      <Circle cx={-5} cy={-20} r={2.4} fill="#3A2F26" />
      <Circle cx={5} cy={-20} r={2.4} fill="#3A2F26" />
      <Circle cx={-4.4} cy={-20.8} r={0.8} fill="#fff" />
      <Circle cx={5.6} cy={-20.8} r={0.8} fill="#fff" />
      <Circle cx={-9} cy={-15} r={2.6} fill="#FFB3A7" opacity={0.8} />
      <Circle cx={9} cy={-15} r={2.6} fill="#FFB3A7" opacity={0.8} />
      <Path d="M-3 -14.5 Q0 -11.5 3 -14.5" stroke="#3A2F26" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Path d="M0 -32 Q-7 -40 -1 -42 Q4 -38 0 -32 Z" fill="#3DBE6B" />
    </G>
  );
}
