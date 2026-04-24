import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationsQuery } from '@/services';

interface Props {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: Props) {
  const router = useRouter();
  const { data: notifications } = useNotificationsQuery();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo/terroir-dark-coffe-text.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push('/notificaciones')}
        >
          <Bell size={22} color={COLORS.darkBrown} />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightBeige,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.lightBeige,
  },
  headerLogo: {
    width: 120,
    height: 36,
  },
  bellBtn: {
    position: 'relative',
    padding: 2,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: COLORS.darkBrown,
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
