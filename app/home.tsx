import * as React from 'react';
import { NavigationProp } from '@react-navigation/native';
import { SafeAreaView, View, TouchableOpacity, Image, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

const Home = () => {
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
            <View style={{display: 'flex', position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10, marginBottom: 20}}>
                <View style={{position: 'absolute', left: 10, width: '86%', height: 60, borderWidth: 2, borderColor: '#555', borderRightWidth: 0, borderRadius: 15, padding: 5, justifyContent: 'center'}}>
                    <Text style={{fontSize: 16, fontWeight: 600}}>Liptovská Mikuláš</Text>
                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{fontSize: 16, fontWeight: 600, marginEnd: 10}}>35°C</Text>
                        <View style={{display: 'flex', flexDirection: 'row', gap: 5}}>
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
            <View>
                <Text></Text>
                <View></View>
            </View>
        </SafeAreaView>
    );
}

export default Home;