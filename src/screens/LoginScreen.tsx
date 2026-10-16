import React from 'react';
import { ImageBackground, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

const LoginScreen = () => {
  return (
    <ImageBackground
      source={require('../../assets/bread-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>The Breadski Brothers</Text>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#fff"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#fff"
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
