import FavoritosPage from '@/components/pages/FavoritosPage';
import HeaderLayout from '@/src/components/layouts/HeaderLayout';

export default function DeseosScreen() {
  return (
    <HeaderLayout>
      <FavoritosPage showBackButton={false} hideHeader={true} />
    </HeaderLayout>
  );
}
