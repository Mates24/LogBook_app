import React, { useState } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./login";
import SignUp from "./signup";
import Home from "./home";
import Cruise from "./addCruise";
import Profile from "./profile";

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen name="Home" component={Home} options={{headerShown: false}}/>
            <Stack.Screen name="Cruise" component={Cruise} options={{headerShown: false}}/>
            <Stack.Screen name="Profile" component={Profile} options={{headerShown: false}}/>

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
