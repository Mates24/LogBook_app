import { Button, SafeAreaView, TextInput, Text, View, TouchableOpacity } from "react-native";

const Login = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
        <Text style={{fontSize: 32}}>Prihláste sa</Text>
        <View style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Text>E-mail:</Text>
          <TextInput
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
              style={{paddingLeft: 20, width: '90%', height: 40, color: '#fff', borderRadius: 10, backgroundColor: 'black'}}
          />
        </View>
        <View style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <Text>Password:</Text>
          <TextInput
              placeholder="Password"
              secureTextEntry={true}
              style={{paddingLeft: 20, width: '90%', height: 40, color: '#fff', borderRadius: 10, backgroundColor: 'black'}}
          />
        </View>
        <Button 
            title="Prihlásiť sa"
            onPress={() => console.log('Prihlásený')}
        />
        <View style={{width: '100%', display: 'flex', alignItems: 'center'}}>
          <Text>Ešte nemáte účet?</Text>
          <TouchableOpacity onPress={() => console.log('Registrovať sa')}>
            <Text style={{color: 'red', paddingBottom: 0,}}>Registrovať sa</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

export default Login;