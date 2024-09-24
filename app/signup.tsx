import { NavigationProp } from "@react-navigation/native";
import { Button, SafeAreaView, TextInput, Text, View, TouchableOpacity } from "react-native";

interface Props{
  navigation: NavigationProp<any>;
}

const Login = ({ navigation }: Props) => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 15,
      }}
    >
        <Text style={{fontSize: 32, textTransform: 'uppercase', fontWeight: 700}}>Prihláste sa</Text>
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10}}>E-mail:</Text>
          <TextInput
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#fff', borderRadius: 10, backgroundColor: 'black'}}
          />
        </View>
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10}}>Password:</Text>
          <TextInput
              placeholder="Password"
              secureTextEntry={true}
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#fff', borderRadius: 10, backgroundColor: 'black'}}
          />
        </View>
        <View style={{width: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10}}>
          <Text style={{alignSelf: 'flex-start', paddingLeft: 10}}>Confirm password:</Text>
          <TextInput
              placeholder="Confirm password"
              secureTextEntry={true}
              style={{paddingLeft: 10, width: '100%', height: 40, color: '#fff', borderRadius: 10, backgroundColor: 'black'}}
          />
        </View>
        <Button 
            title="Prihlásiť sa"
            color={'#006cff'}
            onPress={() => console.log('Prihlásený')}
        />
        <View style={{width: '100%', display: 'flex', alignItems: 'center'}}>
          <Text>Už máte účet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={{color: 'red', paddingBottom: 0,}}>Prihlásiť sa</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

export default Login;