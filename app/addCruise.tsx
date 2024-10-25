import React, { useState } from 'react';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

const Cruise = ({ formik, name, title, navigation }: { formik: any, name: string, title: string, navigation: NavigationProp<any> }) => {
    // Cruise inputs
    const [country, setCountry] = useState<any>(null); // Country input
    const [isFocus, setIsFocus] = useState(false); // Country input dropdown focus
    const [region, setRegion] = useState<string>(''); // Region input
    const [cruiseDateFrom, setCruiseDateFrom] = useState<Date | null>(null); // Cruise from date input
    const [cruiseDateTo, setCruiseDateTo] = useState<Date | null>(null); // Cruise to date input
    const [mode, setMode] = useState<'date' | 'time'>('date'); // Cruise date input mode
    const [showDateFrom, setShowDateFrom] = useState(false); // Cruise from date input show
    const [showDateTo, setShowDateTo] = useState(false); // Cruise to date input show
    
    // Data for country dropdown
    const data = [
        { label: 'Chorvátsko', value: 'Chorvátsko' },
        { label: 'Taliánsko', value: 'Taliánsko' },
        { label: 'Grécko', value: 'Grécko' },
        { label: 'Bosna a Hercegovina', value: 'Bosna a Hercegovina' },
        { label: 'Monako', value: 'Monako' },
        { label: 'Španielsko', value: 'Španielsko' },
        { label: 'Poľsko', value: 'Poľsko' },
        { label: 'Slovensko', value: 'Slovensko' },
    ];

    // Date From picker functions
    const onChangeFrom = ({ type }: any, selectedDate: any) => {
        if(type === 'set') {
            const currentDate = selectedDate;
            setCruiseDateFrom(currentDate);
            // setShow(false);
        } else {
            setShowDateFrom(false);
        }
    };
    const showModeFrom = (currentMode: any) => {
        setShowDateFrom(true);
        setMode(currentMode);
    };
    const showDateFromPicker = () => {
        showModeFrom('date');
    };
    const hideDateFromPicker = () => {
        setShowDateFrom(false);
    }

    // Date To picker functions
    const onChangeTo = ({ type }: any, selectedDate: any) => {
        if(type === 'set') {
            const currentDate = selectedDate;
            setCruiseDateTo(currentDate);
            // setShow(false);
        } else {
            setShowDateFrom(false);
        }
    };
    const showModeTo = (currentMode: any) => {
        setShowDateTo(true);
        setMode(currentMode);
    };
    const showDateToPicker = () => {
        showModeTo('date');
    };
    const hideDateToPicker = () => {
        setShowDateTo(false);
    }
    

    return(
        <SafeAreaView>
            <View style={{paddingHorizontal: 5, marginBottom: 5}}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10}} onPress={() => navigation.navigate('Home')}>
                    <Ionicons name='arrow-back' size={18} color='#084575' />
                    <Text style={{fontSize: 16, fontWeight: 600, color: '#084575'}}>Späť</Text>
                </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal: 10}}>
                <Text style={styles.labels}>Plavba</Text>
                <View style={{flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10}}>
                    <Dropdown
                      style={styles.input}
                      placeholderStyle={{color: '#808080'}}
                      selectedTextStyle={{color: '#000'}}
                      inputSearchStyle={{color: '#000'}}
                      data={data}
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
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={onChangeFrom}
                          textColor='#000'
                        />
                        <TouchableOpacity onPress={hideDateFromPicker} style={{backgroundColor: '#808080'}}>
                            <Text style={{fontWeight: 600, textTransform: 'uppercase'}}>Potvrdiť</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                    {showDateTo && (
                    <View style={{alignItems: 'center', width: '100%', marginBottom: 10}}>
                        <DateTimePicker
                          value={cruiseDateTo || new Date()}
                          mode={mode}
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={onChangeTo}
                          textColor='#000'
                        />
                        <TouchableOpacity onPress={hideDateToPicker} style={{backgroundColor: '#808080'}}>
                            <Text style={{fontWeight: 600, textTransform: 'uppercase'}}>Potvrdiť</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                </View>
            </View>
            <View style={{paddingHorizontal: 5}}>
                <Text style={styles.labels}>Plavidlo</Text>
                <TextInput />
                <TextInput />
                <TextInput />
                <TextInput />
                <TextInput />
                <TextInput />
            </View>
            <View style={{paddingHorizontal: 5}}>
                <Text style={styles.labels}>Skipper</Text>
                <TextInput />
                <TextInput />
            </View>
            <View style={{paddingHorizontal: 5}}>
                <Text style={styles.labels}>Posádka</Text>
                <TextInput />
                <TextInput />
                <TextInput />
                <TouchableOpacity>
                    <Text>Pridať člena</Text>
                </TouchableOpacity>
            </View>
            <View style={{paddingHorizontal: 5}}>
                <TouchableOpacity>
                    <Text>Zrušiť</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text>Pridať</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Cruise;

const styles = StyleSheet.create({
    labels: {
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 5
    },

    input: {
        width: '45%',
        marginBottom: 15,
        fontSize: 16,
        color: '#000',
        borderBottomWidth: 1,
        borderColor: '#808080',
    }
});