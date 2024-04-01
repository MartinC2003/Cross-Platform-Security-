import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Note from './components/Note';
import * as Keychain from 'react-native-keychain';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TRootStackParamList } from './App';

export interface INote {
    title: string;
    text: string;
}

interface IProps { }

interface IState {
    notes: INote[];
    newNoteTitle: string;
    newNoteEquation: string;
}

type TProps = NativeStackScreenProps<TRootStackParamList, 'Notes'> & IProps;

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
    titleInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
    },
    notes: {
        marginTop: 15
    },
});

export default class Notes extends React.Component<TProps, IState> {
    constructor(props: Readonly<TProps>) {
        super(props);

        this.state = {
            notes: [],
            newNoteTitle: '',
            newNoteEquation: ''
        };

        this.onNoteTitleChange = this.onNoteTitleChange.bind(this);
        this.onNoteEquationChange = this.onNoteEquationChange.bind(this);
        this.addNote = this.addNote.bind(this);
        this.deleteNote = this.deleteNote.bind(this); 

    }
    /**
     * Lifecycle method called after the component has mounted.
     * Checks authentication status and retrieves stored notes.
     */
    public async componentDidMount() {
        try {

         // checkAuthentication is run to validate user credentials 
            const isAuthenticated = await this.checkAuthentication();
            // If not authenticated, return error message 
            if (!isAuthenticated) {
                return (
                    <View>
                        <Text>You are not authenticated. Please Log In</Text>
                        <Button title="Log In" onPress={() => this.props.navigation.navigate('Login')} />
                    </View>
                );            
            }
            // Retrieve existing notes from encrypted storage
            const existing = await this.getStoredNotes();
            // Log existing notes
            console.log("Existing notes:", existing); 
            // Update component state with retrieved notes
            this.setState({ notes: existing });
        } catch (error) {
            // Handle errors fetching notes
            console.error("Error fetching notes:", error); 
        }
    }
    /**
     * Lifecycle method called before the component is unmounted.
     * Stores notes in encrypted storage if there are any.
     */
    public async componentWillUnmount() {
        // Check if there are notes to store
        if (this.state.notes.length > 0) {
            // Store notes in encrypted storage
            await this.storeNotes(this.state.notes);
        }
    }

    private async checkAuthentication(): Promise<boolean> {
        try {
            // Keychain is used to further validate credentials 
            const credentials = await Keychain.getGenericPassword();
            return !!credentials; // Return true if credentials exist, indicating the user is authenticated
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }

    //Retrieves stored notees from EncryptedStorage. A promise is used to convert data to array
    private async getStoredNotes(): Promise<INote[]> {
        // retrieve user information from route params
        const user = this.props.route.params.user;
        // Generate a suffix based on user's username and password
        const suffix = `${user.username}-${user.password}`;
        // Retrieve data from EncryptedStorage using the generated suffix.
        // The data is dependent on whoever is signed in, and notes data is saved under the user object.
        const value = await EncryptedStorage.getItem(`notes-${suffix}`);
        // Parse the retrieved value as JSON if it's not null
        if (value !== null) {
            return JSON.parse(value);
        } else {
            // Return an empty array if no notes are found
            return [];
        }
    }

    //Stores the notes in Encrypted Storage. 
    private async storeNotes(notes: INote[]) {
        try {
            // Retrieve user information from route params
            const user = this.props.route.params.user;
            // Generate a suffix based on the user's username and password
            const suffix = `${user.username}-${user.password}`;
            // Convert notes array to JSON string
            const jsonValue = JSON.stringify(notes);
            // Store notes in Encrypted Storage with a key based on the generated suffix
            await EncryptedStorage.setItem(`notes-${suffix}`, jsonValue);
        } catch (error) {
            // Handle errors storing notes
            console.error('Error storing notes:', error);
        }
    }

    //Deletes a note at the specfied index. 
    private async deleteNote(index: number) { 
        try {
        // Create a copy of the current notes array
        const updatedNotes = [...this.state.notes];
        // Remove the note at the specified index
        updatedNotes.splice(index, 1); 
        // Update component state with the updated notes array
        this.setState({ notes: updatedNotes }); 
        // Store the updated notes array in encrypted storage
        await this.storeNotes(updatedNotes); 
        } catch (error) {
        // Handle errors deleting note
        console.error('Error deleting note:', error);
        }
    }


    private onNoteTitleChange(value: string) {
        this.setState({ newNoteTitle: value });
    }

    private onNoteEquationChange(value: string) {
        try {
            // Regular expression to match allowed characters (digits, operators, parentheses, etc.)
            const allowedCharactersRegex = /^[0-9+\-*/().\s]*$/;
    
            // Check if the input text matches the allowed characters regex
            if (allowedCharactersRegex.test(value)) {
                // If input is valid, update the state with the new equation
                this.setState({ newNoteEquation: value });
            } else {
                // If input does not match the allowed characters regex, handle the error 
                throw new Error('Invalid input: only digits, operators, parentheses, and spaces are allowed.');
            }
        } catch (error) {
            console.error('Error storing notes:', error);
        }
    }
    

    private addNote() {
        // Create a new note object with title and text from component state
        const note: INote = {
            title: this.state.newNoteTitle,
            text: this.state.newNoteEquation
        };
  
        // Check if the title or text of the note is empty to prevent errors for database storage 
        if (note.title === '' || note.text === '') {
            // Display an error alert if either title or text is empty
            Alert.alert('Error', 'Title and equation cannot be empty.');
            return;
        }

        // Update the state with the new note and then call storeNotes to store notes in EncryptedStorage database
        this.setState(
            {
                notes: this.state.notes.concat(note),
                newNoteTitle: '',
                newNoteEquation: ''
            },
            () => {
                // Callback function called after state is updated
                //Store the updated notes in Encrypted Storage
                this.storeNotes(this.state.notes);
            }
        );
    }

    public render() {
        //checkAuthentication is used again to validate credentials. If returned true, Note's page content is rendered
        const isAuthenticated = this.checkAuthentication();

        // If not authenticated, return error message
        if (!isAuthenticated) {
            return (
                <View>
                    <Text>You are not authenticated. Please Log In</Text>
                    <Button title="Log In" onPress={() => this.props.navigation.navigate('Login')} />
                </View>
            );
        }

        return (
            <SafeAreaView>
                <ScrollView contentInsetAdjustmentBehavior="automatic">
                    <View style={styles.container}>
                        <Text style={styles.title}>
                            {'Math Notes: ' + this.props.route.params.user.username}
                        </Text>
                        <TextInput
                            style={styles.titleInput}
                            value={this.state.newNoteTitle}
                            onChangeText={this.onNoteTitleChange}
                            placeholder="Enter your title"
                        />
                        <TextInput
                            style={styles.textInput}
                            value={this.state.newNoteEquation}
                            onChangeText={this.onNoteEquationChange}
                            placeholder="Enter your math equation"
                        />
                        <Button title="Add Note" onPress={this.addNote} />

                        <View style={styles.notes}>
                            {this.state.notes.map((note, index) => (
                                <Note key={index} title={note.title} text={note.text} onDelete={() => this.deleteNote(index)}/>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}
