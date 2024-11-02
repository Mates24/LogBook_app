import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, TouchableOpacity, View, Text, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pocketbase from 'pocketbase';

interface Props {
    navigation: NavigationProp<any>;
    onSignOut: () => void;
}

const Profile = ({ navigation, onSignOut }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [userLastName, setUserLastName] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [editable, setEditable] = useState<boolean>(false);
    const textInputRef = useRef<TextInput>(null);

    // Get users avatar
    const getUserAvatar = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');
        const user = await AsyncStorage.getItem('user');
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);
            const userAvatar = pb.files.getUrl(userData.record, userData.record.avatar, {'thumb': '100x250'});
            setUrl(userAvatar);
        }
    }

    // Fetch user name
    const fetchUserName = async () => {
        setLoading(true);
        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');
        const user = await AsyncStorage.getItem('user');

        if (user) {
            await pb.collection('users').authWithPassword(JSON.parse(user).email, JSON.parse(user).password);
            const userPb = await pb.collection('users').getOne(JSON.parse(user).record.id);
            setUserName(userPb.full_name.split(' ')[0]);
            setUserLastName(userPb.full_name.split(' ')[1]);
            setLoading(false);
        }
    };

    // Enable editing
    const enableEditing = () => {
        setEditable(true);

        setTimeout(() => {
            textInputRef.current?.focus();
        }, 0);
    };

    // Save changes
    const saveChanges = async () => {
        setEditable(false); // Disable editing

        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');
        const userFullName = `${userName} ${userLastName}`;
        
        const user = await AsyncStorage.getItem('user');
        
        if (user){
            try{
                const parsedUser = JSON.parse(user);
                parsedUser.record.full_name = userFullName; // Update user full name

                await AsyncStorage.setItem('user', JSON.stringify(parsedUser)); // Save user data to async storage

                await pb.collection('users').authWithPassword(parsedUser.email, parsedUser.password);

                // Update user full name in database
                await pb.collection('users').update(parsedUser.record.id, {
                    'full_name': userFullName,
                });

                Alert.alert('Zmeny boli úspešne uložené');
            } catch (error){
                Alert.alert('Nepodarilo sa uložiť zmeny');
            }
        }
    };

    // Log out
    const handleLogOut = async () => {
        await AsyncStorage.removeItem('user');
        onSignOut();
        Alert.alert('Boli ste úspešne odhlásený');
    };

    useEffect(() => {
        getUserAvatar();
        fetchUserName();
    }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
            { loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) :(
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 10}}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10}} onPress={() => navigation.navigate('Home')}>
                            <Ionicons name='arrow-back' size={18} color='#084575' />
                            <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                        </TouchableOpacity>
                        <View style={{gap: 5}}>
                            <TouchableOpacity onPress={handleLogOut}>
                                <Text style={{fontSize: 16, fontWeight: 500, color: '#F62F2F', textAlign: 'right'}}>Odhlásiť sa</Text>
                            </TouchableOpacity>
                            {!editable ? (
                                <TouchableOpacity onPress={enableEditing}>
                                    <Text style={{fontSize: 16, fontWeight: 500, color: '#084575', textAlign: 'right'}}>Upraviť</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={saveChanges}>
                                    <Text style={{fontSize: 16, fontWeight: 500, color: '#084575', textAlign: 'right'}}>Uložiť</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 30, borderRadius: 20, shadowColor: '#808080', shadowOffset: {width: 0, height: 5}, shadowOpacity: .5, shadowRadius: 3, backgroundColor: '#F0F0F0'}}>
                        <TouchableOpacity>
                            <Image 
                                source={url ? { uri: url } : require('../assets/images/avatar.png')}
                                style={{width: 75, height: 75, borderRadius: 50, marginRight: 15}}
                            />
                        </TouchableOpacity>
                        <View>
                            <TextInput
                              ref={textInputRef}
                              value={userName}
                              onChangeText={setUserName}
                              editable={editable}
                              style={{fontSize: 28, fontWeight: '700', marginBottom: -3}}
                            />
                            <TextInput
                              value={userLastName.toUpperCase()}
                              onChangeText={setUserLastName}
                              editable={editable}
                              style={{fontSize: 28, fontWeight: '700', color: '#808080', textTransform: 'uppercase'}}
                            />
                        </View>
                    </View>
                    <View></View>
                </View>
            )}
        </SafeAreaView>
    )
};

export default Profile;