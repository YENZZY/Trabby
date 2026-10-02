import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';

const icon = (e: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{e}</Text>
);

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F26B1D',
        tabBarInactiveTintColor: '#A89B8E',
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarStyle: { height: 66, paddingBottom: 8, paddingTop: 6, backgroundColor: '#FFF8EF', borderTopWidth: 0 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: icon('🏠') }} />
      <Tabs.Screen name="lines" options={{ title: '노선도', tabBarIcon: icon('🗺️') }} />
      <Tabs.Screen name="dex" options={{ title: '도감', tabBarIcon: icon('📖') }} />
      <Tabs.Screen name="settings" options={{ title: '설정', tabBarIcon: icon('⚙️') }} />
          <Tabs.Screen name="line" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
