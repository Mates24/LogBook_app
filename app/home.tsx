import React, { useState, useEffect} from 'react';
import { NavigationProp } from '@react-navigation/native';
import { SafeAreaView, ScrollView, View, TouchableOpacity, Image, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import Pocketbase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Cruise {
    id: string;
    country: string;
    date: string;
    sails: number;
    engine: number;
    time: number;
}

const Home = () => {    
    const [cruises, setCruises] = useState<Cruise[]>([]);
    const [userCruisesIds, setUserCruisesIds] = useState<string[]>([]);

    const getCruise = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');
        const user = await AsyncStorage.getItem('user');

        if(!user){
            console.log('User not found');
            return;
        }else{
            try{
                const userData = JSON.parse(user);
                const userEmail = userData.email;
                const userPassword = userData.password;
                const cruisesIds = userData.record.cruises;

                await pb.collection('users').authWithPassword(userEmail, userPassword);

                if (cruisesIds && cruisesIds.length > 0) {
                    setUserCruisesIds(cruisesIds);

                    const records = await pb.collection('cruises').getFullList(10000, {
                        filter: `user = '${userData.record.id}'`,
                        expand: 'country,day_cruise,image,from,to',
                        sort: '-from',
                    });


                    const formattedCruises = records.map(record => ({
                        id: record.id,
                        country: record.country,
                        date: record.from.split(' ')[0].split('-').reverse().join('.') + ' - ' + record.to.split(' ')[0].split('-').reverse().join('.'),
                        sails: record.day_cruise.sails,
                        engine: record.day_cruise.engine,
                        time: record.day_cruise.time,
                    }));

                    setCruises(formattedCruises);
                    console.log(userData.record.id);
                } else {
                    console.log('No cruises found for the user');
                }
            }catch(err){
                console.log(err);
            }
        }
    }
    
    useEffect(() => {
        getCruise();
    }, []);
    
    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
        backgroundGradientFrom: "#FFF",
        backgroundGradientTo: "#fff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(8,69,117,${opacity})`,
        fillShadowGradienFrom: "#084575",
        fillShadowGradientTo: "#084575",
        fillShadowGradientFromOpacity: 1,
        fillShadowGradientToOpacity: 1,
        labelColor: () => `#000`,
        barPercentage: 0.8,
        barRadius: 5,
        propsForBackgroundLines: {
            strokeWidth: 0,
        },
        propsForLabels: {
            fontSize: 16,
            fontWeight: '600',
        }
    };
    const data = {
        labels: ["Mon", "Tue", "Thu", "Fri", "Sun", "Sat"],
        datasets: [
          {
            data: [20, 45, 28, 80, 120, 43]
          }
        ]
      };

    
    return (
        <SafeAreaView>
            <View style={{position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10, marginBottom: 20}}>
                <View style={{position: 'absolute', left: 10, width: '86%', height: 60, borderWidth: 2, borderColor: '#555', borderRightWidth: 0, borderRadius: 15, padding: 5, justifyContent: 'center'}}>
                    <Text style={{fontSize: 16, fontWeight: 600}}>Liptovský Mikuláš</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{fontSize: 16, fontWeight: 600, marginEnd: 10}}>35°C</Text>
                        <View style={{flexDirection: 'row', gap: 5}}>
                            <MaterialCommunityIcons name="weather-cloudy" size={24} color="black" />
                            <MaterialCommunityIcons name="weather-sunny" size={24} color="black" />
                            <MaterialCommunityIcons name="weather-sunny" size={24} color="black" />
                            <MaterialCommunityIcons name="weather-cloudy" size={24} color="black" />
                            <MaterialCommunityIcons name="weather-rainy" size={24} color="black" />
                            <MaterialCommunityIcons name="weather-rainy" size={24} color="black" />
                            <MaterialCommunityIcons name="weather-cloudy" size={24} color="black" />
                        </View>
                    </View>
                </View>
                <TouchableOpacity>
                    <Image 
                        source={require('../assets/images/avatar.png')}
                        style={{width: 75, height: 75, borderRadius: 50}}
                    />
                </TouchableOpacity>
            </View>
            <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 18, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10}}>Sailed miles this week</Text>
                <BarChart 
                   style={{ borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 1 }}
                   data={data}
                   width={screenWidth - 20}
                   height={180}
                   yAxisLabel=''
                   yAxisSuffix=''
                   chartConfig={chartConfig}
                   showBarTops={false}
                   withHorizontalLabels={false}
                   fromZero={true}
                   showValuesOnTopOfBars={true}
                />
            </View>
            <View style={{marginTop: 20, paddingHorizontal: 10}}>
                <View style={{marginBottom: 10}}>
                    <Text style={{fontSize: 18, fontWeight: 600}}>Cruises</Text>
                </View>
                <ScrollView>
                    {cruises.length > 0 ?
                        cruises.map(cruise => (
                            <TouchableOpacity style={{width: '100%', height: 125, borderWidth: 2, borderRadius: 16, padding: 10, marginBottom: 10}} key={cruise.id}>
                                <View style={{flexDirection: 'row', flex: 1.5, gap: 10}}>
                                    <Image 
                                        source={require('../assets/images/imgage.png')}
                                        style={{height: '100%', width: 50}}    
                                    />
                                    <View style={{display: 'flex'}}>
                                        <Text style={{fontSize: 22, fontWeight: 600}}>{cruise.country}</Text>
                                        <Text style={{fontSize: 12, paddingLeft: 1}}>{cruise.date}</Text>
                                    </View>
                                </View>
                                <View style={{flexDirection: 'row', flex: 1, gap: 15, alignItems: 'flex-end'}}>
                                    <View>
                                        <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Plachty</Text>
                                        <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.sails} mi</Text>
                                    </View>
                                    <View>
                                        <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Motor</Text>
                                        <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.engine} mi</Text>
                                    </View>
                                    <View>
                                        <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Čas</Text>
                                        <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.time}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )) : (
                            <Text style={{fontSize: 16, fontWeight: 600, textAlign: 'center'}}>No cruises found</Text>
                        )
                    }    
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

export default Home;