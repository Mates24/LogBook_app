import { NavigationProp } from "@react-navigation/native";
import { Button, SafeAreaView, TextInput, Text, View, TouchableOpacity, Alert } from "react-native";
import Pocketbase from 'pocketbase';
import { useState } from "react";

interface Props{
  navigation: NavigationProp<any>;
};

const SignUp = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');

  const handleSignup = async () => {
    if (!username || !email || !password || !passwordConfirm) {
      Alert.alert('Prosím vyplňte všetky polia!');
      return;
    } else if (password.length < 8) {
      Alert.alert('Heslo musí mať aspoň 8 znakov!');
      return;
    } else if (password !== passwordConfirm) {
      Alert.alert('Heslá sa nezhodujú!');
      return;
    };

    try {
      const data = {
        "username": username,
        "email": email,
        "password": password,
        "passwordConfirm": passwordConfirm
      };
      const newUser = await pb.collection('users').create(data);
      
      Alert.alert('Registrácia prebehla úspešne!');
      navigation.navigate('Login');
    } catch (err: any) {
      if (err?.data?.data?.email?.message === 'The email is invalid or already in use.') {
        Alert.alert('Užívateľ s týmto e-mailom už existuje!');
      } else {
        Alert.alert('Nastala chyba pri registrácii! Skúste to znova neskôr.');
        console.log(err);
      };
    };
  };

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
        <Text style={{fontSize: 32, textTransform: 'uppercase', fontWeight: 700}}>Registrovať sa</Text>
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10}}>Userame:</Text>
          <TextInput
              placeholder="Username"
              placeholderTextColor={'#808080'}
              autoCapitalize="none"
              inputMode="text"
              value={username}
              onChangeText={setUsername}
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#000', borderWidth: 1, borderRadius: 10, borderColor: '#808080', backgroundColor: '#fff'}}
          />
        </View>
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
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10}}>Confirm password:</Text>
          <TextInput
              placeholder="Confirm password"
              placeholderTextColor={'#808080'}
              secureTextEntry={true}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#000', borderWidth: 1, borderRadius: 10, borderColor: '#808080', backgroundColor: '#fff'}}
          />
        </View>
        <Button 
            title="Registrovať sa"
            color={'#F62F2F'}
            onPress={handleSignup}
        />
        <View style={{alignItems: 'center', position: 'absolute', bottom: 0, flexDirection: 'row', gap: 5, marginBottom: 20}}>
          <Text style={{textAlign: 'center'}}>Už máte účet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{color: '#084575', paddingBottom: 0,}}>Prihlásiť sa</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

export default SignUp;