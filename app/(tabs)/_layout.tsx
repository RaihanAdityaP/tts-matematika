import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

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
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Main',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🎮</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="achievement"
        options={{
          title: 'Achievement',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>🏆</Text>
          ),
        }}
      />
    </Tabs>
  );
}