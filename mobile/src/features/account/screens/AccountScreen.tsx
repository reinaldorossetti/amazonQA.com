import { View } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import type { ShopTabsParamList } from '@/app/navigation/types';

export function AccountScreen({}: BottomTabScreenProps<ShopTabsParamList, 'Account'>) {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text variant="headlineSmall">Minha conta</Text>
      <Text>{user?.first_name} {user?.last_name}</Text>
      <Text>{user?.email}</Text>

      <Text variant="titleMedium">Idioma</Text>
      <SegmentedButtons
        value={language}
        onValueChange={(value) => setLanguage(value as 'pt-BR' | 'en-US')}
        buttons={[
          { value: 'pt-BR', label: 'Português' },
          { value: 'en-US', label: 'English' },
        ]}
      />

      <Button mode="contained-tonal" onPress={() => void signOut()}>Sair</Button>
    </View>
  );
}
