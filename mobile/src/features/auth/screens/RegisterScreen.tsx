import { View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { register } from '../services/auth.api';
import { getErrorMessage } from '@/shared/utils/error';

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  cpf: string;
}

export function RegisterScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      cpf: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setMessage(null);
    try {
      await register({ ...values, person_type: 'PF' });
      setMessage('Cadastro realizado com sucesso. Faça login.');
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível cadastrar. Verifique os dados.'));
    }
  });

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text variant="headlineSmall">Cadastro</Text>
      <Controller
        control={control}
        name="first_name"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => <TextInput label="Nome" value={value} onChangeText={onChange} />}
      />
      <Controller
        control={control}
        name="last_name"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => <TextInput label="Sobrenome" value={value} onChangeText={onChange} />}
      />
      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => <TextInput label="E-mail" value={value} onChangeText={onChange} autoCapitalize="none" />}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => <TextInput label="Senha" value={value} onChangeText={onChange} secureTextEntry />}
      />
      <Controller
        control={control}
        name="cpf"
        render={({ field: { value, onChange } }) => <TextInput label="CPF" value={value} onChangeText={onChange} keyboardType="number-pad" />}
      />
      {message ? <HelperText type="info">{message}</HelperText> : null}
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <Button mode="contained" onPress={onSubmit} loading={isSubmitting} disabled={isSubmitting}>Cadastrar</Button>
    </View>
  );
}
