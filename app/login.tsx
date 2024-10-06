import React, { useState } from 'react';
import { Button, SafeAreaView, TextInput, Text, View, TouchableOpacity, Alert } from "react-native";
import { NavigationProp } from '@react-navigation/native';
import Pocketbase from 'pocketbase';

interface Props{
  navigation: NavigationProp<any>;
}

const Login = ({ navigation }: Props) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const pb = new Pocketbase('http://127.0.0.1:8090');

    if (!email || !password) {
      Alert.alert("Prosím vyplňte všetky polia!");
    }

    try{
      const user = await pb.collection('users_logbook').authWithPassword(email, password);
    } catch (err: any){
      if (err.data.message === 'Failed to authenticate.') {
        Alert.alert('Nesprávne prihlasovacie údaje!');
      } else {
        Alert.alert('Nastala chyba pri prihlasovaní! Skúste to znova neskôr.');
        console.log(err);
      };
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 15,
        backgroundColor: '#F3EFD5'
      }}
    >
        <Text style={{fontSize: 32, textTransform: 'uppercase', fontWeight: 700}}>Prihláste sa</Text>
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10}}>E-mail:</Text>
          <TextInput
              placeholder="E-mail"
              placeholderTextColor={'#808080'}
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
              value={email}
              onChangeText={setEmail}
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#000', borderWidth: 1, borderRadius: 10, borderColor: '#808080', backgroundColor: '#fff'}}
          />
        </View>
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10}}>Password:</Text>
          <TextInput
              placeholder="Password"
              placeholderTextColor={'#808080'}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#000', borderWidth: 1, borderRadius: 10, borderColor: '#808080', backgroundColor: '#fff'}}
          />
        </View>
        <Button 
            title="Prihlásiť sa"
            color={'#084575'}
            onPress={handleLogin}
        />
        <View style={{alignItems: 'center', position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', gap: 5, marginBottom: 10}}>
          <Text>Ešte nemáte účet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={{color: '#F62F2F', paddingBottom: 0,}}>Registrovať sa</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

export default Login;