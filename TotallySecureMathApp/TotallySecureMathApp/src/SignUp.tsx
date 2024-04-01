import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TRootStackParamList } from './App';

interface IAccount {
  username: string;
  password: string;
}

interface ISignUpProps {
  navigation: any; 
}

const SignUp: React.FC<ISignUpProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    try {
      // Retrieve existing user data from EncryptedStorage
      const existingUsersJSON = await EncryptedStorage.getItem("users");
      const existingUsers: IAccount[] = existingUsersJSON ? JSON.parse(existingUsersJSON) : [];

      // Check if the entered username already exists
      const userExists = existingUsers.some(user => user.username === username);
      if (userExists) {
        Alert.alert('Error', 'Username already exists.');
        return;
      }

      // Create new account object
      const newAccount: IAccount = { username, password };

      // Store the new account object in EncryptedStorage
      existingUsers.push(newAccount);
      await EncryptedStorage.setItem('users', JSON.stringify(existingUsers));

      // Navigate to login screen once account is successfully created 
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.username}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />
      <TextInput
        style={styles.password}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button title="Sign Up" onPress={signUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  username: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  password: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
});

export default SignUp;
