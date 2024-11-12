import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';

const Cruise = ({ route }: any) => {
    const { cruise } = route.params;

    return (
        <SafeAreaView>
            <View>
                <Text></Text>
            </View>
        </SafeAreaView>
    );
}

export default Cruise;