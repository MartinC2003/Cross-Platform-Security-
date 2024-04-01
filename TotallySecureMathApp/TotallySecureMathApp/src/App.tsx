import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import Notes from './Notes';
import Login, { IUser } from './Login';
import SignUp from './SignUp';
import { Button } from 'react-native';

export type TRootStackParamList = {
    Login: undefined;
    SignUp: undefined;
    Notes: {
        user: IUser;
    };
};

function App() {
    const [signedInAs, setSignedInAs] = React.useState<IUser | false>(false);

    const Stack = createNativeStackNavigator<TRootStackParamList>();
    
    // handleLogout method ends the session and returns the user back to the login page
    const handleLogout = () => {
        setSignedInAs(false);
    };

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!signedInAs ? (
                    <>
                        <Stack.Screen name="Login">
                            {(props) => <Login {...props} onLogin={(user) => setSignedInAs(user)} />}
                        </Stack.Screen>
                        <Stack.Screen name="SignUp" component={SignUp} /> 
                    </>
                ) : (
                    <Stack.Screen
                        name="Notes"
                        component={Notes}
                        initialParams={{ user: signedInAs }}
                        options={{
                            headerRight: () => (
                                <Button
                                    onPress={handleLogout}
                                    title="Logout"
                                />
                            ),
                        }}
                    />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
