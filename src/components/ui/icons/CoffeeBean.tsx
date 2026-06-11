import Svg, { Ellipse, Path, G } from 'react-native-svg';

/**
 * Grano de café estilo lucide (24×24, trazo redondeado, hereda color/tamaño):
 * óvalo en diagonal con la hendidura central en S característica. Lucide no
 * trae un coffee-bean (su `Bean` es una legumbre), por eso es un icono propio
 * con la misma API que los de lucide-react-native (color / size / strokeWidth).
 */
export function CoffeeBean({
  color = 'currentColor',
  size = 24,
  strokeWidth = 2,
}: {
  color?: string;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(45 12 12)"
      >
        {/* Cuerpo del grano (óvalo) */}
        <Ellipse cx="12" cy="12" rx="6.5" ry="9" />
        {/* Hendidura central en S */}
        <Path d="M12 3.5c-2.5 4.5 2.5 12.5 0 17" />
      </G>
    </Svg>
  );
}
