import React from 'react';
import { View, StyleSheet, Dimensions, Text} from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');



export default function Loading() {

    return (
        <View style={styles.container}>
            <LottieView
                source={require('@/assets/images/animation.json')}
                autoPlay
                loop
                style={styles.animation}
            />
            <Text style={styles.logo}>HAMBROSIA</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E74C3C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: width * 0.6,
        height: width * 0.6,
    },
    logo: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#fff',
    },
});
