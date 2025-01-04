import React from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Cruise = ({ route, navigation }: any) => {
    const { cruise } = route.params;

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 1}}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, paddingInline: 10, marginBottom: 5}} onPress={() => navigation.navigate('Home')}>
                    <Ionicons name='arrow-back' size={18} color='#084575' />
                    <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', paddingRight: 10, paddingBottom: 10, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}}>
                    <View style={{paddingInline: 10}}>
                        <Text style={{width: '100%', fontSize: 24, fontWeight: 600, textTransform: 'uppercase'}}>{cruise.country}</Text>
                        <Text style={{fontWeight: 500, color: '#808080'}}>{cruise.date}</Text>
                    </View>
                    <Image 
                        source={require('../assets/images/imgage.png')}
                        style={{width: 55, aspectRatio: 1}}    
                    />
                </View>
                <ScrollView>
                    {cruise.day_cruise > [] ?
                        cruise.day_cruise.map((day: any) => (
                            <TouchableOpacity key={day.date} style={{flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}} onPress={() => navigation.navigate('Day', {day})}>
                                <View>
                                    <Text style={{fontSize: 16, fontWeight: 500, letterSpacing: 1}}>{day.day}</Text>
                                    <Text>{day.date}</Text>
                                </View>
                                <Ionicons 
                                  name='chevron-forward-outline'
                                  size={30}
                                  color='#808080'
                                />
                            </TouchableOpacity>
                        )) : (
                            <View style={{ padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}}>
                                <Text>No cruise data</Text>
                            </View>
                        )
                    }
                </ScrollView>
                <TouchableOpacity onPress={() => console.log('Pressed!')} style={{width: '100%', alignItems: 'center', position: 'absolute', bottom: 0, left: 0, marginBottom: 10}}>
                  <Text style={{width: '100%', textAlign: 'center', textTransform: 'uppercase', fontWeight: 600}}>Pridať denný záznam</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Cruise;