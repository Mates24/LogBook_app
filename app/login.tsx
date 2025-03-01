import React, { useState } from 'react';
import { Button, SafeAreaView, TextInput, Text, View, TouchableOpacity, Alert } from "react-native";
import { NavigationProp } from '@react-navigation/native';
import Pocketbase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props{
  navigation: NavigationProp<any>;
  onSignIn: () => void;
}

const Login = ({ navigation, onSignIn }: Props) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const pb = new Pocketbase('https://mathiasdb.em1t.me/');

    if (!email || !password) {
      Alert.alert("Prosím vyplňte všetky polia!");
    };

    try{
      const user = await pb.collection('users').authWithPassword(email, password);

      const userInfo = {
        ...user,
        email,
        password
      };
      await AsyncStorage.setItem('user', JSON.stringify(userInfo));
      
      onSignIn();
    } catch (err: any){
      if (err.data.message === 'Failed to authenticate.') {
        Alert.alert('Nesprávne prihlasovacie údaje!');
      } else {
        Alert.alert('Nastala chyba pri prihlasovaní! Skúste to znova neskôr.');
        console.log(err);
      };
    };
  };

  /* const passwordReset = async () => {
    const pb = new Pocketbase('https://mathiasdb.em1t.me/');
    try{
      await pb.collection('users').requestPasswordReset(email);
      Alert.alert('Na váš e-mail bol odoslaný link na obnovenie hesla.');
    } catch(err){
      console.log(err);
    };
  }; */

  return (
    <SafeAreaView style={{flex: 1, justifyContent: "center", alignItems: "center", gap: 15, backgroundColor: '#F3EFD5'}}>
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
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10, marginBottom: 10}}>Heslo:</Text>
          <TextInput
              placeholder="Heslo"
              placeholderTextColor={'#808080'}
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#000', borderWidth: 1, borderRadius: 10, borderColor: '#808080', backgroundColor: '#fff'}}
          />
          {/* <TouchableOpacity onPress={passwordReset} style={{alignSelf: 'flex-end', paddingRight: 5, paddingTop: 5, }}>
            <Text style={{color: '#084575', fontSize: 13, fontWeight: 500}}>Zabudli ste heslo?</Text>
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={{color: '#084575', fontSize: 19, fontWeight: 600}}>Prihlásiť sa</Text>
        </TouchableOpacity>
        <View style={{alignItems: 'center', position: 'absolute', bottom: 0, flexDirection: 'row', gap: 5, marginBottom: 20}}>
          <Text style={{textAlign: 'center'}}>Ešte nemáte účet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={{color: '#F62F2F', paddingBottom: 0,}}>Registrovať sa</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

export default Login;