import React, { useState } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert, SafeAreaView, View, Text, TextInput, TouchableOpacity, Platform, StyleSheet, Switch, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pocketbase from 'pocketbase';

interface CrewMembersObject {
    [key: string]: any;
}

const AddCruise = ({ navigation }: { navigation: NavigationProp<any> }) => {
    const [isFocus, setIsFocus] = useState(false); // Dropdown focus

    // Inputy pre plavbu
    const [country, setCountry] = useState<any>(null); // Country input
    const [region, setRegion] = useState<string>(''); // Region input
    const [cruiseDateFrom, setCruiseDateFrom] = useState<Date | null>(null); // Cruise from date input
    const [cruiseDateTo, setCruiseDateTo] = useState<Date | null>(null); // Cruise to date input
    const [mode, setMode] = useState<'date' | 'time'>('date'); // Cruise date input mode
    const [showDateFrom, setShowDateFrom] = useState(false); // Cruise from date input show
    const [showDateTo, setShowDateTo] = useState(false); // Cruise to date input show

    // Inputy pre plavidlo
    const [boatName, setBoatName] = useState<string>(''); // Boat name input
    const [boatType, setBoatType] = useState<any>(null); // Boat type input
    const [registerNumber, setRegisterNumber] = useState<string>(''); // Boat register number input
    const [boatOwner, setBoatOwner] = useState<string>(''); // Boat owner input
    const [boatLength, setBoatLength] = useState<any>(null); // Boat length input
    const [boatWidth, setBoatWidth] = useState<any>(null); // Boat width input

    // Inputy pre skippera
    const [isEnabled, setIsEnabled] = useState(false); // Skipper switch input
    const toggleSwitch = async () => {
        setIsEnabled(previousState => !previousState);
        const user = await AsyncStorage.getItem('user');
        
        // Set user as skipper
        if(user && !isEnabled) {
            const userObj = JSON.parse(user);
            setSkipperName(userObj.record.full_name);
            setSkipperAddress(userObj.record.address);
        } else {
            setSkipperName('');
            setSkipperAddress('');
        };
    };
    const [skipperName, setSkipperName] = useState<string>(''); // Skipper name input
    const [skipperAddress, setSkipperAddress] = useState<string>(''); // Skipper name input

    // Inputy pre posádku
    const [crewMembers, setCrewMembers] = useState<string[]>(['', '']); // Crew name input
    const addCrewMember = () => {
        setCrewMembers([...crewMembers, '']);
    };
    
    // Dáta pre dropdown krajiny
    const countryData = [
        { label: 'Albánsko', value: 'Albánsko' },
        { label: 'Americké Panenské ostrovy', value: 'Americké Panenské ostrovy' },
        { label: 'Antigua a Barbuda', value: 'Antigua a Barbuda' },
        { label: 'Austrália', value: 'Austrália' },
        { label: 'Bahamy', value: 'Bahamy' },
        { label: 'Belgicko', value: 'Belgicko' },
        { label: 'Britské Panenské ostrovy', value: 'Britské Panenské ostrovy' },
        { label: 'Bulharsko', value: 'Bulharsko' },
        { label: 'Cyprus', value: 'Cyprus' },
        { label: 'Čierna Hora', value: 'Čierna Hora' },
        { label: 'Dánsko', value: 'Dánsko' },
        { label: 'Estónsko', value: 'Estónsko' },
        { label: 'Fínsko', value: 'Fínsko' },
        { label: 'Francúzsko', value: 'Francúzsko' },
        { label: 'Grécko', value: 'Grécko' },
        { label: 'Grenada', value: 'Grenada' },
        { label: 'Guadeloupe', value: 'Guadeloupe' },
        { label: 'Holandsko', value: 'Holandsko' },
        { label: 'Chorvátsko', value: 'Chorvátsko' },
        { label: 'Juhoafrická republika', value: 'Juhoafrická republika' },
        { label: 'Litva', value: 'Litva' },
        { label: 'Lotyšsko', value: 'Lotyšsko' },
        { label: 'Maldivy', value: 'Maldivy' },
        { label: 'Malta', value: 'Malta' },
        { label: 'Martinik', value: 'Martinik' },
        { label: 'Nemecko', value: 'Nemecko' },
        { label: 'Nórsko', value: 'Nórsko' },
        { label: 'Nový Zéland', value: 'Nový Zéland' },
        { label: 'Poľsko', value: 'Poľsko' },
        { label: 'Portugalsko', value: 'Portugalsko' },
        { label: 'Rumunsko', value: 'Rumunsko' },
        { label: 'Seychely', value: 'Seychely' },
        { label: 'Slovinsko', value: 'Slovinsko' },
        { label: 'St. Barthélemy', value: 'St. Barthélemy' },
        { label: 'St. Martin', value: 'St. Martin' },
        { label: 'Španielsko', value: 'Španielsko' },
        { label: 'Švédsko', value: 'Švédsko' },
        { label: 'Taliansko', value: 'Taliansko' },
        { label: 'Thajsko', value: 'Thajsko' },
        { label: 'Turecko', value: 'Turecko' },
    ];

    // Funkcie pre dátumový picker "Od"
    const onChangeFrom = ({ type }: any, selectedDate: any) => {
        if(type === 'set') {
            const currentDate = selectedDate;
            setCruiseDateFrom(currentDate);
            setShowDateFrom(false);
        } else {
            setShowDateFrom(false);
        };
    };
    const showModeFrom = (currentMode: any) => {
        setShowDateFrom(true);
        setMode(currentMode);
    };
    const showDateFromPicker = () => {
        showModeFrom('date');
    };

    // Funkcia pre dátumový picker "Do"
    const onChangeTo = ({ type }: any, selectedDate: any) => {
        if(type === 'set') {
            const currentDate = selectedDate;
            setCruiseDateTo(currentDate);
            setShowDateTo(false);
        } else {
            setShowDateFrom(false);
        };
    };
    const showModeTo = (currentMode: any) => {
        setShowDateTo(true);
        setMode(currentMode);
    };
    const showDateToPicker = () => {
        showModeTo('date');
    };

    // Dáta pre dropdown typu lode
    const boatData = [
        { label: 'Motorová loď', value: 'Motorová loď' },
        { label: 'Plachetnica', value: 'Plachetnica' },
        { label: 'Katamaran', value: 'Katamaran' },
    ];

    // Pridanie plavby
    const pb = new Pocketbase('https://mathiasdb.em1t.me/');

    const transformedCrewMembers = crewMembers.reduce((acc: CrewMembersObject, member, index) => {
        acc[`member_${index}`] = member;
        return acc;
    }, {} as CrewMembersObject);

    const addCruise = async () => {
        const user = await AsyncStorage.getItem('user');
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try{
                const data = {
                    'country': country.value,
                    'area': region,
                    'boat_info': {
                        'name': boatName,
                        'type': boatType.value,
                        'register_number': registerNumber,
                        'owner': boatOwner,
                        'length': boatLength,
                        'width': boatWidth
                    },
                    'skipper_info': {
                        'name': skipperName,
                        'address': skipperAddress
                    },
                    'crew': transformedCrewMembers,
                    'from': cruiseDateFrom,
                    'to': cruiseDateTo,
                    'user': userData.record.id
                };

                await pb.collection('cruises').create(data);
                navigation.navigate('Home');
            } catch (err: any) {
                Alert.alert('Nastala chyba pri pridávaní plavby! Skúste to znova neskôr.');
            };
        };
    };

    // Zrušenie pridávania plavby
    const cancelCruise = () => {
        setCountry(null);
        setRegion('');
        setCruiseDateFrom(null);
        setCruiseDateTo(null);
        setBoatName('');
        setBoatType(null);
        setRegisterNumber('');
        setBoatOwner('');
        setBoatLength('');
        setBoatWidth('');
        setIsEnabled(false);
        setSkipperName('');
        setSkipperAddress('');
        setCrewMembers(['', '']);

        navigation.navigate('Home');
    };
    

    return(
        <SafeAreaView>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 5}}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10}} onPress={() => navigation.navigate('Home')}>
                    <Ionicons name='arrow-back' size={18} color='#084575' />
                    <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, gap: 10}}>
                    <TouchableOpacity onPress={cancelCruise}>
                        <Text style={{fontSize: 16, fontWeight: 500, color: '#F62F2F'}}>Zrušiť</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={addCruise}>
                        <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Pridať</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView>
                <View style={{paddingHorizontal: 10}}>
                    <Text style={styles.labels}>Plavba</Text>
                    <View style={styles.inputs}>
                        <Dropdown
                          style={styles.input}
                          placeholderStyle={{color: '#808080'}}
                          selectedTextStyle={{color: '#000'}}
                          inputSearchStyle={{color: '#000'}}
                          data={countryData}
                          search
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={!isFocus ? 'Krajina' : 'Krajina'}
                          searchPlaceholder="Hľadať"
                          value={country}
                          onFocus={() => setIsFocus(true)}
                          onBlur={() => setIsFocus(false)}
                          onChange={setCountry}
                        />
                        <TextInput 
                          placeholder='Oblasť' 
                          placeholderTextColor={'#808080'} 
                          value={region}
                          onChangeText={setRegion}
                          style={styles.input}
                        />
                        <TouchableOpacity onPress={showDateFromPicker} style={{width: '45%'}}>
                            <TextInput 
                                placeholder='Dátum od' 
                                placeholderTextColor={'#808080'} 
                                value={cruiseDateFrom ? cruiseDateFrom.toISOString().split('T')[0].split('-').reverse().join('.') : ''}
                                editable={false}
                                style={{width: '100%', marginBottom: 15, fontSize: 16, color: '#000', borderBottomWidth: 1, borderColor: '#808080'}}
                                onPressIn={showDateFromPicker}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={showDateToPicker} style={{width: '45%'}}>
                            <TextInput 
                                placeholder='Dátum do' 
                                placeholderTextColor={'#808080'} 
                                value={cruiseDateTo ? cruiseDateTo.toISOString().split('T')[0].split('-').reverse().join('.') : ''}
                                editable={false}
                                style={{width: '100%', marginBottom: 15, fontSize: 16, color: '#000', borderBottomWidth: 1, borderColor: '#808080'}}
                                onPressIn={showDateToPicker}
                            />
                        </TouchableOpacity>
                        {showDateFrom && (
                        <View style={{alignItems: 'center', width: '100%', marginBottom: 10}}>
                            <DateTimePicker
                              value={cruiseDateFrom || new Date()}
                              mode={mode}
                              display='default'
                              onChange={onChangeFrom}
                              textColor='#000'
                            />
                        </View>
                        )}
                        {showDateTo && (
                        <View style={{alignItems: 'center', width: '100%', marginBottom: 10}}>
                            <DateTimePicker
                              value={cruiseDateTo || new Date()}
                              mode={mode}
                              display='default'
                              onChange={onChangeTo}
                              textColor='#000'
                            />
                        </View>
                        )}
                    </View>
                </View>
                <View style={{paddingHorizontal: 10}}>
                    <Text style={styles.labels}>Plavidlo</Text>
                    <View style={styles.inputs}>
                        <TextInput 
                          placeholder='Názov lode' 
                          placeholderTextColor={'#808080'} 
                          value={boatName}
                          onChangeText={setBoatName}
                          style={styles.input}
                        />
                        <Dropdown
                          style={styles.input}
                          placeholderStyle={{color: '#808080'}}
                          selectedTextStyle={{color: '#000'}}
                          inputSearchStyle={{color: '#000'}}
                          data={boatData}
                          search
                          maxHeight={300}
                          labelField="label"
                          valueField="value"
                          placeholder={!isFocus ? 'Typ' : 'Typ'}
                          searchPlaceholder="Hľadať"
                          value={boatType}
                          onFocus={() => setIsFocus(true)}
                          onBlur={() => setIsFocus(false)}
                          onChange={setBoatType}
                        />
                        <TextInput 
                          placeholder='Registračné číslo' 
                          placeholderTextColor={'#808080'} 
                          value={registerNumber}
                          onChangeText={setRegisterNumber}
                          style={styles.input}
                        />
                        <TextInput 
                          placeholder='Vlastník lode' 
                          placeholderTextColor={'#808080'} 
                          value={boatOwner}
                          onChangeText={setBoatOwner}
                          style={styles.input}
                        />
                        <TextInput 
                          placeholder='Dĺžka lode' 
                          placeholderTextColor={'#808080'} 
                          value={boatLength}
                          onChangeText={setBoatLength}
                          style={styles.input}
                        />
                        <TextInput 
                          placeholder='Dĺžka lode' 
                          placeholderTextColor={'#808080'} 
                          value={boatWidth}
                          onChangeText={setBoatWidth}
                          style={styles.input}
                        />
                    </View>
                </View>
                <View style={{paddingHorizontal: 10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5}}>
                        <Text style={{fontSize: 18, fontWeight: 600, textTransform: 'uppercase'}}>Skipper</Text>
                        <Switch 
                          trackColor={{ false: '#767577', true: '#084575' }}
                          thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
                          ios_backgroundColor={'#909090'}
                          onValueChange={toggleSwitch}
                          value={isEnabled}
                          style={{transform: [{ scaleX: .55 }, { scaleY: .55 }]}}
                        />
                    </View>
                    <View style={styles.inputs}>
                        <TextInput 
                          placeholder='Meno a priezvisko' 
                          placeholderTextColor={'#808080'} 
                          value={skipperName}
                          onChangeText={setSkipperName}
                          style={styles.skipperInput}
                        />
                        <TextInput 
                          placeholder='Bydlisko'
                          placeholderTextColor={'#808080'}
                          value={skipperAddress}
                          onChangeText={setSkipperAddress}
                          style={styles.skipperInput}
                        />
                    </View>
                </View>
                <View style={{paddingHorizontal: 10}}>
                    <Text style={styles.labels}>Posádka</Text>
                    <>
                        {crewMembers.map((member, index) => (
                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                <TextInput
                                    placeholder='Meno a priezvisko; adresa'
                                    placeholderTextColor={'#808080'}
                                    value={member}
                                    onChangeText={(text) => {
                                        const newCrewMembers = [...crewMembers];
                                        newCrewMembers[index] = text;
                                        setCrewMembers(newCrewMembers);
                                    }}
                                    style={[styles.crewInput, { flex: 1 }]}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        const newCrewMembers = crewMembers.filter((_, i) => i !== index);
                                        setCrewMembers(newCrewMembers);
                                    }}
                                    style={{ marginLeft: 10 }}
                                >
                                    <Ionicons name="trash" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity onPress={addCrewMember} style={{alignItems: 'center'}}>
                            <Text style={{fontSize: 16, fontWeight: 600, textTransform: 'uppercase', color: '#808080'}}>Pridať člena</Text>
                        </TouchableOpacity>
                    </>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default AddCruise;

const styles = StyleSheet.create({
    labels: {
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 10
    },

    inputs:{
        flexWrap: 'wrap', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
    },

    input: {
        width: '45%',
        marginBottom: 15,
        fontSize: 16,
        color: '#000',
        borderBottomWidth: 1,
        borderColor: '#808080',
    },

    skipperInput: {
        width: '100%',
        marginBottom: 15,
        fontSize: 16,
        color: '#000',
        borderBottomWidth: 1,
        borderColor: '#808080',
    },

    crewInput: {
        width: '100%',
        padding: 10,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#808080',
    }
});