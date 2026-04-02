import { useState } from 'react';
import { View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
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
    <View style={{ flex: 1, padding: 16, justifyContent: 'center', gap: 12 }}>
      <Text variant="headlineMedium">Login</Text>
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <TextInput testID="login-email-input" label="E-mail" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => (
          <TextInput testID="login-password-input" label="Senha" value={value} onChangeText={onChange} secureTextEntry />
        )}
      />
      {error ? <HelperText testID="login-error-message" type="error">{error}</HelperText> : null}
      <Button testID="login-submit-button" mode="contained" onPress={onSubmit} loading={isSubmitting} disabled={isSubmitting}>Entrar</Button>
      <Button mode="text" onPress={() => navigation.navigate('Register')}>Criar conta</Button>
    </View>
  );
}
