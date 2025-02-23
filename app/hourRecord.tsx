import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Alert, FlatList, Dimensions } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pocketbase from 'pocketbase';

const HourRecord = ({ route, navigation }: any) => {
    const { cruise, dayCruise, hourRecord } = route.params;
    
    const [loading, setLoading] = useState(true);
    const [updatedRecord, setUpdatedRecord] = useState<any[]>([]);
    
    // Show info
    const [showInfo, setShowInfo] = useState(false);

    // Pages for info
    const [pageOne, setPageOne] = useState(true);
    const [pageTwo, setPageTwo] = useState(false);

    // Beaufortova stupnica
    const data = [
        ['0', 'pod 1', '-', 'bezvetrie'],
        ['1', '1 - 3', '0,1', 'vánok'],
        ['2', '4 - 6', '0,2', 'slabý vietor'],
        ['3', '7 - 10', '0,6', 'mierny vietor'],
        ['4', '11 - 16', '1', 'dosť čerstvý vietor'],
        ['5', '17 - 21', '2', 'čerstvý vietor'],
        ['6', '22 - 27', '3', 'silný vietor'],
        ['7', '28 - 33', '4', 'prudký vietor'],
        ['8', '34 - 40', '5,5', 'búrlivý vietor'],
        ['9', '41 - 47', '7', 'víchrica'],
        ['10', '48 - 55', '9', 'silná víchrica'],
        ['11', '56 - 63', '11,5', 'mohutná víchria'],
        ['12', '64 a viac', '14', 'orkán'],
    ];
    const tableHead = ['Stupeň', 'Rýchlosť vetra (uzly)', 'Výška vĺn (metre)', 'Slovné označenie'];
    const screenWidth = Dimensions.get('window').width;

    const handleInfo = () => {
        setPageOne(true);
        setPageTwo(false);
        setShowInfo(!showInfo);
    };

    // Inputs for navigation
    const [lat, setLat] = useState('');
    const [long, setLong] = useState('');
    const [compassCourse, setCompassCourse] = useState('');
    const [bottomCourse, setBottomCourse] = useState('');
    const [deviation, setDeviation] = useState('');
    const [speed, setSpeed] = useState('');
    const [sails, setSails] = useState('');
    const [engine, setEngine] = useState('');

    // Inputs for weather
    const [wind, setWind] = useState('');
    const [cloudiness, setCloudiness] = useState('');
    const [visibility, setVisibility] = useState('');
    const [temperature, setTemperature] = useState('');

    // Inputs for notes
    const [notes, setNotes] = useState('');

    // Get data
    const getData = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');

        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try {
                const record = await pb.collection('day_cruise').getOne(dayCruise.id);
                const hourData = record.hour_record.find((hr: any) => hr.hour === hourRecord.hour);
                if (hourData) {
                    const data = {
                        lat: hourData.lat,
                        long: hourData.long,
                        compassCourse: hourData.compass_course,
                        bottomCourse: hourData.bottom_course,
                        deviation: hourData.deviation,
                        speed: hourData.speed,
                        sails: hourData.sails,
                        engine: hourData.engine,
                        wind: hourData.wind,
                        cloudiness: hourData.cloudiness,
                        visibility: hourData.visibility,
                        temperature: hourData.temperature,
                        notes: hourData.notes
                    };
                    setLat(data.lat);
                    setLong(data.long);
                    setCompassCourse(data.compassCourse);
                    setBottomCourse(data.bottomCourse);
                    setDeviation(data.deviation);
                    setSpeed(data.speed);
                    setSails(data.sails);
                    setEngine(data.engine);
                    setWind(data.wind);
                    setCloudiness(data.cloudiness);
                    setVisibility(data.visibility);
                    setTemperature(data.temperature);
                    setNotes(data.notes);
                    setInitialData(data);
                }
            } catch (err) {
                console.log(err);
            }
        }
        setLoading(false);
    };

    // Store initial data to compare changes
    const [initialData, setInitialData] = useState({});
    const [showButtons, setShowButtons] = useState(false);

    // Update database
    const updateRecord = async() => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');

        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try{
                // Získanie aktuálnych údajov o DayCruise
                const existingDayCruise = await pb.collection('day_cruise').getOne(dayCruise.id);
                
                // Skopírovanie existujúcich záznamov
                const updatedHourRecords = existingDayCruise.hour_record.map((record: any) => 
                    record.hour === hourRecord.hour 
                        ? { 
                            ...record,
                            lat,
                            long,
                            compass_course: compassCourse,
                            bottom_course: bottomCourse,
                            deviation,
                            speed,
                            sails,
                            engine,
                            wind,
                            cloudiness,
                            visibility,
                            temperature,
                            notes
                        } 
                        : record
                );

                setUpdatedRecord(updatedHourRecords);

                await pb.collection('day_cruise').update(dayCruise.id, {
                    "hour_record": updatedHourRecords,
                });

                setShowButtons(false);
                Alert.alert('Záznam bol úspešne upravený');
            }catch(err){
                console.log(err);
            };
        };
    };

    const cancel = () => {
        getData();
    };

    useEffect(() => {
        const hasChanges = JSON.stringify(initialData) !== JSON.stringify({
            lat, long, compassCourse, bottomCourse, deviation, speed, sails, engine, wind, cloudiness, visibility, temperature, notes
        });
        setShowButtons(hasChanges);
    }, [lat, long, compassCourse, bottomCourse, deviation, speed, sails, engine, wind, cloudiness, visibility, temperature, notes]);

    useEffect(() => {
        getData();
    }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
            { loading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) : (
                <View style={{flex: 1}}>
                    { showInfo && (
                        <View style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#151718', justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                            <View style={{backgroundColor: '#fff', padding: 20, borderRadius: 10}}>
                                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                                    <Text style={{fontSize: 20, fontWeight: 600, textTransform: 'uppercase'}}>Zápis</Text>
                                    <TouchableOpacity onPress={handleInfo}>
                                        <Ionicons name='close' size={30} color='#F62F2F' />
                                    </TouchableOpacity>
                                </View>
                                { pageOne && (
                                    <View style={{width: '100%'}}>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>1. LAT</Text> - Zemepisná šírka polohy</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>2. LONG</Text> - Zemepisná dĺžka polohy</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>3. KK</Text> - Kurz kompasový, vypisuje sa v stupňoch od 0° do 360°</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>4. KD</Text> - Kurz dnový, vypisuje sa v stupňoch od 0° do 360° </Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>5. Deviácia</Text> - Odchýlka od kurzu</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>6. Rýchlosť</Text> - Rýchlosť plavby voči dnu v uzloch</Text>
                                        <Text style={{fontSize: 16, marginBottom: 5}}><Text style={styles.boldText}>7. Plachty</Text> - Uvádzajú sa skratky plachiet: {'\n'}         HP - hlavná plachta {'\n'}         K - kosatka {'\n'}         G - genua {'\n'}         S - spinaker</Text>
                                        <Text style={styles.infoText}>    Refovanie sa uvádza podľa plochy plachiet v %</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>8. Motor</Text> - Pri plavbe na motor sa uvádzajú otáčky motora</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>9. Vietor</Text> - Smer vetra sa zapisuje skratkou, sila vetra podľa Beaufortovej stupnice napr. SW 5</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>10. Oblačnosť</Text> - Stupeň oblačnosti sa zapisuje následovne: {'\n'}          0 - jasno (bez oblakov) {'\n'}          1 - oblaky pokrývajú 1/3 oblohy {'\n'}          2 - oblaky pokrývajú 1/2 oblohy {'\n'}          3 - oblaky pokrývajú 3/4 oblohy {'\n'}          4 - obloha úplne zatiahnutá {'\n'}          X - oblohu nie je vidno, hmla</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>11. Teplota</Text> - Zapisuje sa v stupňoch Celzia</Text>
                                        <Text style={styles.infoText}><Text style={styles.boldText}>12. Viditeľnosť</Text> - Zapiseuje sa v Nm</Text>
                                    </View>
                                )}
                                { pageTwo && (
                                    <View style={{width: screenWidth * 0.89, marginBottom: 10}}>
                                        <Text style={{fontSize: 16, fontWeight: 500, marginBottom: 5}}>Beaufortova stupnica</Text>
                                        <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                                          <Row data={tableHead} style={styles.head} textStyle={styles.text} />
                                          {data.map((rowData, index) => (
                                            <Row key={index} data={rowData} style={styles.row} textStyle={styles.text} />
                                          ))}
                                        </Table>
                                  </View>
                                )}
                                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                                    <TouchableOpacity onPress={() => { setPageOne(true); setPageTwo(false); }}>
                                        <Ionicons name={pageOne ? 'radio-button-on' : 'radio-button-off'} size={18} color='#808080' />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setPageOne(false); setPageTwo(true); }}>
                                        <Ionicons name={pageTwo ? 'radio-button-on' : 'radio-button-off'} size={18} color='#808080' />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={{paddingBottom: 15}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingInline: 10, marginBottom: 5}}>
                            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2}} onPress={() => navigation.navigate('DayCruise', { cruise, dayCruise: { ...dayCruise, hour_record: updatedRecord } })}>
                                <Ionicons name='arrow-back' size={18} color='#084575' />
                                <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleInfo}>
                                <Ionicons name='information-circle-outline' size={20} color='#084575' />
                            </TouchableOpacity>   
                        </View>
                        <View style={{flexDirection: 'row', paddingRight: 10, paddingBottom: 15, paddingTop: 5, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}}>
                            <View style={{paddingInline: 10}}>
                                <Text style={{width: '100%', fontSize: 26, fontWeight: 700, textTransform: 'uppercase'}}>{dayCruise.day}</Text>
                                <Text style={{fontWeight: 500, color: '#808080'}}>{dayCruise.date}</Text>
                            </View>
                            <View>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                    <Text style={{fontSize: 16, fontWeight: 500}}>Z prístavu:</Text>
                                    <Text style={{fontSize: 16}}>{dayCruise.from_port}</Text>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                    <Text style={{fontSize: 16, fontWeight: 500}}>Do prístavu:</Text>
                                    <Text style={{fontSize: 16}}>{dayCruise.to_port}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 10, paddingBottom: 15}}>
                        <Text style={styles.labels}>Navigácia</Text>
                        <View style={styles.inputs}>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Lat:</Text>
                                <TextInput 
                                  placeholder='Zemepisná šírka' 
                                  placeholderTextColor={'#808080'} 
                                  value={lat}
                                  onChangeText={setLat}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Long:</Text>
                                <TextInput 
                                  placeholder='Zemepisná dĺžka' 
                                  placeholderTextColor={'#808080'} 
                                  value={long}
                                  onChangeText={setLong}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>KK:</Text>
                                <TextInput 
                                  placeholder='Kurz kompasový' 
                                  placeholderTextColor={'#808080'} 
                                  value={compassCourse}
                                  onChangeText={setCompassCourse}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>KD:</Text>
                                <TextInput 
                                  placeholder='Kurz dnový' 
                                  placeholderTextColor={'#808080'} 
                                  value={bottomCourse}
                                  onChangeText={setBottomCourse}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Deviace:</Text>
                                <TextInput 
                                  placeholder='Deviace' 
                                  placeholderTextColor={'#808080'} 
                                  value={deviation}
                                  onChangeText={setDeviation}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Rýchlosť:</Text>
                                <TextInput 
                                  placeholder='Rýchlosť' 
                                  placeholderTextColor={'#808080'} 
                                  value={speed}
                                  onChangeText={setSpeed}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Plachty:</Text>
                                <TextInput 
                                  placeholder='Plachty' 
                                  placeholderTextColor={'#808080'} 
                                  value={sails}
                                  onChangeText={setSails}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Motor:</Text>
                                <TextInput 
                                  placeholder='Motor' 
                                  placeholderTextColor={'#808080'} 
                                  value={engine}
                                  onChangeText={setEngine}
                                  style={{fontSize: 16}}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 10, paddingBottom: 15}}>
                        <Text style={styles.labels}>Počasie</Text>
                        <View style={styles.inputs}>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Vietor:</Text>
                                <TextInput 
                                  placeholder='Vietor' 
                                  placeholderTextColor={'#808080'} 
                                  value={wind}
                                  onChangeText={setWind}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Oblačnosť:</Text>
                                <TextInput 
                                  placeholder='Oblačnosť' 
                                  placeholderTextColor={'#808080'} 
                                  value={cloudiness}
                                  onChangeText={setCloudiness}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Viditeľnosť:</Text>
                                <TextInput 
                                  placeholder='Viditeľnosť' 
                                  placeholderTextColor={'#808080'} 
                                  value={visibility}
                                  onChangeText={setVisibility}
                                  style={{fontSize: 16}}
                                />
                            </View>
                            <View style={styles.input}>
                                <Text style={{fontSize: 16, fontWeight: 500}}>Teplota:</Text>
                                <TextInput 
                                  placeholder='Teplota' 
                                  placeholderTextColor={'#808080'} 
                                  value={temperature}
                                  onChangeText={setTemperature}
                                  style={{fontSize: 16}}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 10}}>
                        <Text style={styles.labels}>Poznámky</Text>
                        <View style={styles.inputs}>
                            <TextInput 
                              placeholder='Poznámky...' 
                              placeholderTextColor={'#808080'}
                              multiline
                              value={notes}
                              onChangeText={setNotes}
                              style={styles.inputArea}
                            />
                        </View>
                    </View>
                    { showButtons && (
                        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 0, left: 0, marginBottom: 10, gap: 10}}>
                            <TouchableOpacity onPress={cancel}>
                                <Text style={{fontSize: 16, fontWeight: 500, color: '#F62F2F'}}>Zrušiť</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={updateRecord}>
                                <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Uložiť</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

export default HourRecord;

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
        flexDirection: 'row',
        gap: 5,
        width: '45%',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderColor: '#808080',
    },

    inputArea: {
        width: '100%',
        height: 164,
        padding: 10,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#808080',
    },

    infoText: {
        fontSize: 16,
        marginBottom: 5
    },

    boldText: {
        fontWeight: '600'
    },

    head: {
        height: 40,
        backgroundColor: '#dcdcdc',
    },
    row: {
        height: 40,
    },
    text: {
        textAlign: 'center',
        fontSize: 13,
    },
});