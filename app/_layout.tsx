import React, { useState } from 'react';
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./login";
import SignUp from "./signup";
import Home from "./home";
import AddCruise from "./addCruise";
import Profile from "./profile";
import Licenses from "./licenses";
import Cruise from "./cruise";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    setIsSignedIn(true);
  };
  const handleSignOut = () => {
    setIsSignedIn(false);
  };

  return (
    <NavigationContainer independent={true}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen name="Home" component={Home} options={{headerShown: false}}/>
            <Stack.Screen name="AddCruise" component={AddCruise} options={{headerShown: false}}/>
            <Stack.Screen name="Profile" options={{headerShown: false}}>{props => <Profile {...props} onSignOut={handleSignOut} />}</Stack.Screen>
            <Stack.Screen name="Licenses" component={Licenses} options={{headerShown: false}}/>
            <Stack.Screen name="Cruise" component={Cruise} options={{headerShown: false}}/>
          </>
        ) : (
          <>
            <Stack.Screen name="Login" options={{headerShown: false}}>{props => <Login {...props} onSignIn={handleSignIn} />}</Stack.Screen>
            <Stack.Screen name="Signup" component={SignUp} options={{headerShown: false}}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
