import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <span style={{ fontSize: 24 }}>🏠</span>
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Main',
          tabBarIcon: ({ color }) => (
            <span style={{ fontSize: 24 }}>🎮</span>
          ),
        }}
      />
      <Tabs.Screen
        name="achievement"
        options={{
          title: 'Achievement',
          tabBarIcon: ({ color }) => (
            <span style={{ fontSize: 24 }}>🏆</span>
          ),
        }}
      />
    </Tabs>
  );
}