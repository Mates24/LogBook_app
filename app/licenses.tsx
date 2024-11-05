import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Pocketbase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const License = ({ navigation }: any) => {
    const [loading, setLoading] = useState(false);
    const [captainLicense, setCaptainLicense] = useState<any>();
    const [vhfLicense, setVhfLicense] = useState('');

    // Set captain license
    const handleCaptainLicense = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');

        if (status !== 'granted') {
            Alert.alert('Chyba', 'Nemáte povolenie na prístup k galérii');
            return;
        }
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        
        if (!result.canceled) {
            const uri = result.assets[0].uri;

            try{
                const user = await AsyncStorage.getItem('user');

                const formData = new FormData();
                formData.append('captain_license', {
                    uri: uri,
                    name: 'captain_license',
                    type: 'image/jpeg'
                } as any);

                setCaptainLicense(uri);

                if(user){
                    const userData = JSON.parse(user);
                    const userEmail = userData.email;
                    const userPassword = userData.password;
                    userData.captain_license = uri;

                    await AsyncStorage.setItem('user', JSON.stringify(userData));

                    await pb.collection('users').authWithPassword(userEmail, userPassword);

                    await pb.collection('users').update(userData.record.id, formData);
                    
                    Alert.alert('Úspešne', 'Preukaz bol úspešne nahratý');
                }
            }catch(error) {
                console.log(error);
                Alert.alert('Chyba', 'Nepodarilo sa nahrať kapitánsky preukaz');
            }
        }
    };




    return (
        <SafeAreaView style={{flex: 1}}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) : (
                <View style={{flex: 1, paddingHorizontal: 10}}>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10}} onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name='arrow-back' size={18} color='#084575' />
                        <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                    </TouchableOpacity>
                    <View style={{}}>
                        <View style={{marginBottom: 20}}>
                            <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 10, textAlign: 'center', textTransform: 'uppercase'}}>Kapitánsky preukaz</Text>
                            {captainLicense ? (
                                <View style={styles.input}>
                                    <Image source={{uri: captainLicense}} style={{width: '100%', height: '100%', borderRadius: 15, resizeMode: 'cover'}} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleCaptainLicense}>
                                    <View style={styles.input}>
                                        <Ionicons name='add-outline' size={40} color='#bbb' />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={{}}>
                            <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 10, textAlign: 'center', textTransform: 'uppercase'}}>VHF preukaz</Text>
                            {vhfLicense ? (
                                <View style={styles.input}></View>
                            ) : (
                                <TouchableOpacity>
                                    <View style={styles.input}>
                                        <Ionicons name='add-outline' size={40} color='#bbb' />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

export default License;

const styles = StyleSheet.create({
    input: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 200,
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 15,
    }
});