import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { evaluate } from 'mathjs';
interface IProps {
    title: string;
    text: string;
	onDelete: () => void; 

}

function Note(props: IProps) {
    //replaced eval() with evaluateEquation() from math.js 
    function evaluateEquation() {
        const result = evaluate(props.text);
        Alert.alert('Result', 'Result: ' + result);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {props.title}
            </Text>
            <Text style={styles.text}>
                {props.text}
            </Text>

            <View style={styles.evaluateContainer}>
                <Button title='Evaluate' onPress={evaluateEquation} />
            </View>

            <View style={styles.deleteContainer}>
                <Button title='Delete' onPress={props.onDelete}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginTop: 5,
        marginBottom: 5,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    text: {
        fontSize: 16,
    },
    evaluateContainer: {
        marginTop: 10,
        marginBottom: 10
    },
    deleteContainer: { 
        marginTop: 10,
        marginBottom: 10
    }
});

export default Note;
