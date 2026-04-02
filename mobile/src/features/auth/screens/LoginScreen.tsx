import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { login } from '../services/auth.api';
import { useAuth } from '@/app/providers/AuthProvider';
import type { AuthStackParamList } from '@/app/navigation/types';
import { getErrorMessage } from '@/shared/utils/error';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface FormValues {
  email: string;
  password: string;
}

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const result = await login(values);
      await signIn(result.accessToken, result.user);
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao autenticar. Verifique suas credenciais.'));
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>amazon</Text>
      </View>

      <Text variant="headlineMedium" style={styles.title}>Fazer login</Text>

      <View style={styles.formContainer}>
        <Controller
          control={control}
          name="email"
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <TextInput
              testID="login-email-input"
              mode="outlined"
              label="E-mail ou número de telefone"
              value={value}
              onChangeText={onChange}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              activeOutlineColor="#007185"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <TextInput
              testID="login-password-input"
              mode="outlined"
              label="Senha"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              style={styles.input}
              activeOutlineColor="#007185"
            />
          )}
        />

        {error ? <HelperText testID="login-error-message" type="error" visible={true}>{error}</HelperText> : null}

        <Button
          testID="login-submit-button"
          mode="contained"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonText}
        >
          Continuar
        </Button>

        <Text style={styles.termsText}>
          Ao continuar, você concorda com as Condições de Uso e com a Política de Privacidade da Amazon.
        </Text>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Novo na Amazon?</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Register')}
        style={styles.secondaryButton}
        textColor="#111"
      >
        Criar sua conta da Amazon
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  title: {
    fontWeight: '400',
    marginBottom: 16,
    color: '#111',
  },
  formContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: '#FFD814',
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 4,
  },
  primaryButtonText: {
    color: '#111',
    fontWeight: '400',
  },
  termsText: {
    fontSize: 12,
    color: '#111',
    marginTop: 12,
    lineHeight: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7e7e7',
  },
  dividerText: {
    color: '#767676',
    paddingHorizontal: 12,
    fontSize: 12,
  },
  secondaryButton: {
    borderColor: '#d5d9d9',
    borderRadius: 8,
    backgroundColor: '#F7FAFA',
    paddingVertical: 4,
  },
});
