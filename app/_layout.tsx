import { Tabs } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="signup"
        options={{
          title: 'Sign Up',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
