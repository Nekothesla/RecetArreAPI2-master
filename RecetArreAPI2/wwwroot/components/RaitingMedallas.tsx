/**
 * RaitingMedallas.tsx
 * Sistema de valoración con medallas para RecetArre.
 * Escala: 1 = Bronce · 2 = Bronce-Plata · 3 = Plata · 4 = Plata-Oro · 5 = Oro
 *
 * Entrega: componente React Native autocontenido.
 * Usa: Animated, TouchableOpacity, AccessibilityInfo.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  AccessibilityInfo,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface RaitingResumen {
  recetaId: number;
  promedioMedallas: number;
  totalVotos: number;
  distribucionMedallas: Record<number, number>;
}

export interface RaitingDto {
  id: number;
  puntuacion: number;
  recetaId: number;
  usuarioId: string;
  nombreUsuario?: string;
  creadoUtc: string;
}

interface MedallaConfig {
  nivel: number;
  emoji: string;
  nombre: string;
  color: string;
  colorFondo: string;
  colorBorde: string;
  descripcion: string;
}

// ─── Configuración de medallas ───────────────────────────────────────────────

const MEDALLAS: MedallaConfig[] = [
  {
    nivel: 1,
    emoji: '🥉',
    nombre: 'Bronce',
    color: '#CD7F32',
    colorFondo: '#FFF3E0',
    colorBorde: '#CD7F32',
    descripcion: 'Aceptable',
  },
  {
    nivel: 2,
    emoji: '🎖️',
    nombre: 'Bronce+',
    color: '#B87333',
    colorFondo: '#FBE9E7',
    colorBorde: '#B87333',
    descripcion: 'Buena',
  },
  {
    nivel: 3,
    emoji: '🥈',
    nombre: 'Plata',
    color: '#A8A9AD',
    colorFondo: '#ECEFF1',
    colorBorde: '#A8A9AD',
    descripcion: 'Muy buena',
  },
  {
    nivel: 4,
    emoji: '🌟',
    nombre: 'Plata+',
    color: '#FFD700',
    colorFondo: '#FFFDE7',
    colorBorde: '#FFC107',
    descripcion: 'Excelente',
  },
  {
    nivel: 5,
    emoji: '🥇',
    nombre: 'Oro',
    color: '#FFD700',
    colorFondo: '#FFF9C4',
    colorBorde: '#FFD700',
    descripcion: '¡Maestra!',
  },
];

// ─── Constantes de API ───────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5000/api/raiting';

// ─── Componente Medalla individual ───────────────────────────────────────────

interface MedallaItemProps {
  config: MedallaConfig;
  seleccionada: boolean;
  hovering: boolean;
  onPress: (nivel: number) => void;
  onHover: (nivel: number | null) => void;
  disabled: boolean;
}

const MedallaItem: React.FC<MedallaItemProps> = ({
  config,
  seleccionada,
  hovering,
  onPress,
  onHover,
  disabled,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (seleccionada || hovering) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: seleccionada ? 1.25 : 1.1,
          friction: 4,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [seleccionada, hovering]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E0E0E0', config.colorBorde],
  });

  const backgroundColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F5F5F5', config.colorFondo],
  });

  return (
    <TouchableOpacity
      onPress={() => !disabled && onPress(config.nivel)}
      onPressIn={() => onHover(config.nivel)}
      onPressOut={() => onHover(null)}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={`Medalla ${config.nombre}: ${config.descripcion}`}
      accessibilityState={{ selected: seleccionada, disabled }}
      accessibilityHint={`Presiona para dar ${config.nivel} medalla${config.nivel > 1 ? 's' : ''} a esta receta`}
    >
      <Animated.View
        style={[
          styles.medallaContainer,
          {
            transform: [{ scale: scaleAnim }],
            borderColor,
            backgroundColor,
            borderWidth: seleccionada ? 2.5 : 1.5,
          },
        ]}
      >
        <Text style={styles.medallaEmoji}>{config.emoji}</Text>
        <Text style={[styles.medallaNombre, { color: config.color }]}>
          {config.nombre}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Barra de distribución ───────────────────────────────────────────────────

interface BarraDistribucionProps {
  nivel: number;
  cantidad: number;
  total: number;
}

const BarraDistribucion: React.FC<BarraDistribucionProps> = ({
  nivel,
  cantidad,
  total,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const porcentaje = total > 0 ? (cantidad / total) * 100 : 0;
  const config = MEDALLAS[nivel - 1];

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: porcentaje,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [porcentaje]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={styles.barraFila}
      accessible={true}
      accessibilityLabel={`${config.nombre}: ${cantidad} votos, ${Math.round(porcentaje)}%`}
    >
      <Text style={styles.barraEmoji}>{config.emoji}</Text>
      <View style={styles.barraTrack}>
        <Animated.View
          style={[
            styles.barraRelleno,
            { width, backgroundColor: config.colorBorde },
          ]}
        />
      </View>
      <Text style={styles.barraCantidad}>{cantidad}</Text>
    </View>
  );
};

// ─── Componente principal RaitingMedallas ────────────────────────────────────

interface RaitingMedallasProps {
  recetaId: number;
  token?: string; // JWT para acciones autenticadas
  onRaitingCambiado?: (resumen: RaitingResumen) => void;
}

export const RaitingMedallas: React.FC<RaitingMedallasProps> = ({
  recetaId,
  token,
  onRaitingCambiado,
}) => {
  // Estado
  const [resumen, setResumen] = useState<RaitingResumen | null>(null);
  const [miRaiting, setMiRaiting] = useState<RaitingDto | null>(null);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animación del promedio
  const promedioAnim = useRef(new Animated.Value(0)).current;
  const opacidadAnim = useRef(new Animated.Value(0)).current;

  // ── Carga inicial ──
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      // Resumen público
      const resRes = await fetch(`${API_BASE}/receta/${recetaId}/resumen`);
      if (!resRes.ok) throw new Error('No se pudo cargar el resumen.');
      const resData: RaitingResumen = await resRes.json();
      setResumen(resData);
      animarPromedio(resData.promedioMedallas);

      // Mi voto (solo si hay token)
      if (token) {
        const mioRes = await fetch(`${API_BASE}/mio/${recetaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mioRes.ok) {
          const mioData: RaitingDto = await mioRes.json();
          setMiRaiting(mioData);
          setSeleccion(mioData.puntuacion);
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar valoraciones.');
    } finally {
      setCargando(false);
    }
  }, [recetaId, token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ── Animación del número promedio ──
  const animarPromedio = (valor: number) => {
    Animated.parallel([
      Animated.timing(promedioAnim, {
        toValue: valor,
        duration: 900,
        useNativeDriver: false,
      }),
      Animated.timing(opacidadAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // ── Seleccionar/cambiar medalla ──
  const handleSeleccion = async (nivel: number) => {
    if (!token) {
      Alert.alert(
        'Inicia sesión',
        'Debes iniciar sesión para valorar una receta.',
      );
      return;
    }
    if (enviando) return;

    const esCambio = miRaiting !== null;
    const mismoNivel = seleccion === nivel;

    // Si el usuario presiona la misma medalla ya seleccionada → sin efecto
    if (mismoNivel) return;

    setEnviando(true);
    const prevSeleccion = seleccion;
    setSeleccion(nivel);

    try {
      let response: Response;

      if (esCambio) {
        // PUT – actualizar voto existente
        response = await fetch(`${API_BASE}/${miRaiting!.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ puntuacion: nivel }),
        });
      } else {
        // POST – crear voto nuevo
        response = await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recetaId, puntuacion: nivel }),
        });
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.mensaje ?? 'Error al guardar valoración.');
      }

      const data = await response.json();
      const raitingActualizado: RaitingDto = esCambio ? data.data : data;
      setMiRaiting(raitingActualizado);

      // Recargar resumen para actualizar promedio en tiempo real
      const resRes = await fetch(`${API_BASE}/receta/${recetaId}/resumen`);
      if (resRes.ok) {
        const resData: RaitingResumen = await resRes.json();
        setResumen(resData);
        animarPromedio(resData.promedioMedallas);
        onRaitingCambiado?.(resData);
      }

      // Anuncio de accesibilidad
      const config = MEDALLAS[nivel - 1];
      AccessibilityInfo.announceForAccessibility(
        `Has dado ${config.nivel} medalla${nivel > 1 ? 's' : ''} ${config.nombre} a esta receta.`,
      );
    } catch (e: any) {
      setSeleccion(prevSeleccion);
      Alert.alert('Error', e.message ?? 'No se pudo guardar la valoración.');
    } finally {
      setEnviando(false);
    }
  };

  // ── Renderizado ──
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.cargandoTexto}>Cargando valoraciones…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>{error}</Text>
        <TouchableOpacity style={styles.botonReintentar} onPress={cargarDatos}>
          <Text style={styles.botonReintentarTexto}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const promedioTexto = resumen
    ? resumen.promedioMedallas.toFixed(1)
    : '0.0';

  const medallaPromedio =
    resumen && resumen.promedioMedallas > 0
      ? MEDALLAS[Math.round(resumen.promedioMedallas) - 1]
      : null;

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
    >
      {/* Encabezado */}
      <Text style={styles.titulo} accessibilityRole="header">
        Valoración de la receta
      </Text>

      {/* Promedio grande */}
      <Animated.View
        style={[styles.promedioCard, { opacity: opacidadAnim }]}
        accessible={true}
        accessibilityLabel={`Promedio: ${promedioTexto} medallas de 5. Total de votos: ${resumen?.totalVotos ?? 0}`}
      >
        <Text style={styles.promedioEmoji}>
          {medallaPromedio ? medallaPromedio.emoji : '🏅'}
        </Text>
        <Text style={styles.promedioNumero}>{promedioTexto}</Text>
        <Text style={styles.promedioMax}>/5</Text>
        <Text style={styles.promedioNombre}>
          {medallaPromedio ? medallaPromedio.nombre : '—'}
        </Text>
        <Text style={styles.promedioVotos}>
          {resumen?.totalVotos ?? 0}{' '}
          {resumen?.totalVotos === 1 ? 'valoración' : 'valoraciones'}
        </Text>
      </Animated.View>

      {/* Selector de medallas */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>
          {miRaiting ? 'Tu valoración actual:' : 'Califica esta receta:'}
        </Text>
        <View
          style={styles.medallasRow}
          accessibilityRole="radiogroup"
          accessibilityLabel="Selector de medallas del 1 al 5"
        >
          {MEDALLAS.map((m) => (
            <MedallaItem
              key={m.nivel}
              config={m}
              seleccionada={
                hover !== null ? hover >= m.nivel : (seleccion ?? 0) >= m.nivel
              }
              hovering={hover !== null && hover >= m.nivel}
              onPress={handleSeleccion}
              onHover={setHover}
              disabled={enviando || !token}
            />
          ))}
        </View>

        {enviando && (
          <View style={styles.enviandoRow}>
            <ActivityIndicator size="small" color="#FFD700" />
            <Text style={styles.enviandoTexto}>Guardando tu medalla…</Text>
          </View>
        )}

        {seleccion !== null && (
          <Text
            style={[
              styles.descripcionSeleccionada,
              { color: MEDALLAS[seleccion - 1].color },
            ]}
            accessibilityLiveRegion="polite"
          >
            {MEDALLAS[seleccion - 1].emoji} {MEDALLAS[seleccion - 1].nombre} —{' '}
            {MEDALLAS[seleccion - 1].descripcion}
          </Text>
        )}

        {!token && (
          <Text style={styles.avisoLogin}>
            🔒 Inicia sesión para valorar esta receta
          </Text>
        )}
      </View>

      {/* Distribución */}
      {resumen && resumen.totalVotos > 0 && (
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Distribución de medallas</Text>
          {[5, 4, 3, 2, 1].map((nivel) => (
            <BarraDistribucion
              key={nivel}
              nivel={nivel}
              cantidad={resumen.distribucionMedallas[nivel] ?? 0}
              total={resumen.totalVotos}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  cargandoTexto: {
    marginTop: 12,
    fontSize: 14,
    color: '#9E9E9E',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  errorTexto: {
    fontSize: 14,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  botonReintentar: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#FFD700',
    borderRadius: 24,
  },
  botonReintentarTexto: {
    fontWeight: '700',
    color: '#333',
  },

  // Título
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Tarjeta promedio
  promedioCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 32,
    marginBottom: 28,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#FFE082',
  },
  promedioEmoji: {
    fontSize: 56,
    marginBottom: 6,
  },
  promedioNumero: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFB300',
    lineHeight: 60,
  },
  promedioMax: {
    fontSize: 18,
    color: '#9E9E9E',
    fontWeight: '600',
    marginBottom: 4,
  },
  promedioNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
    letterSpacing: 0.5,
  },
  promedioVotos: {
    marginTop: 6,
    fontSize: 13,
    color: '#9E9E9E',
  },

  // Secciones
  seccion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  seccionTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Fila de medallas
  medallasRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  medallaContainer: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    minWidth: 58,
  },
  medallaEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  medallaNombre: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Enviando
  enviandoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  enviandoTexto: {
    color: '#9E9E9E',
    fontSize: 13,
  },

  // Descripción seleccionada
  descripcionSeleccionada: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 10,
    letterSpacing: 0.3,
  },

  // Aviso login
  avisoLogin: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 13,
    marginTop: 10,
    fontStyle: 'italic',
  },

  // Barras de distribución
  barraFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  barraEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  barraTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: 6,
  },
  barraCantidad: {
    width: 28,
    textAlign: 'right',
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
});

export default RaitingMedallas;
