import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TRootStackParamList } from './App';

export interface IUser {
  username: string;
  password: string;
}

// Define the props interface for the Login component
interface IProps {
  onLogin: (user: IUser) => void;
  navigation: NativeStackScreenProps<TRootStackParamList, 'Login'>['navigation'];
}

type TProps = NativeStackScreenProps<TRootStackParamList, 'Login'> & IProps;

const Login: React.FC<TProps> = ({ navigation, onLogin }) => {
  
  // State variables for username, password, and authentication status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useState(false); 

  
  // Effect hook to check authentication status
  useEffect(() => {
    checkAuth();
  }, [auth]); 
  const login = async () => {
    try {
      // Retrieve stored users from encrypted storage 
      const storedUsers = await EncryptedStorage.getItem('users');
      if (storedUsers) {
        const users: IUser[] = JSON.parse(storedUsers);
        // Find the user with matching username and password
        const foundUser = users.find((user) => user.username === username && user.password === password);
        if (foundUser) {
          // Store user credentials securely using Keychain API. Keychain stores the data to be used to validate the user later. 
          await Keychain.setGenericPassword(username, password);
          
          setUsername('');
          setPassword('');
          // Invoke onLogin callback with found user
          onLogin(foundUser);
          // Log success message
          console.log('Keychain API works properly.');

          return;
        }
      }
      // Display error message for invalid credentials
      Alert.alert('Error', 'Username or password is invalid.');
    } catch (error) {
      // Log and display unexpected errors
      console.error('Error retrieving user credentials:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  // Function to navigate to sign up screen
  const signUp = () => {
    navigation.navigate('SignUp');
  };

  // Function to check authentication status
  const checkAuth = async () => { 
    try {
      // Check if credentials exist in Keychain, if authenticated it redirects user to notes component 
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        return;
      }
      
    } catch (error) {
      console.error('Error checking if signed in:', error);
    } finally {
      // Set auth state to true after checking authentication
      setAuth(true); 
    }
  };
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <Button title="Login" onPress={login} />
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
  }
});

export default Login;
