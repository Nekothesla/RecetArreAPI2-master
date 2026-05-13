/**
 * RaitingMedallas.stories.tsx
 * Documentación visual interactiva del sistema de valoración con medallas.
 * Compatible con Storybook (React Native Web) o como pantalla de demo standalone.
 *
 * Para correr como pantalla de demo standalone en Expo:
 *   Importa <RaitingDemo /> en tu App.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { RaitingMedallas, RaitingResumen } from './RaitingMedallas';

// ─── Datos de ejemplo ──────────────────────────────────────────────────────

const RESUMEN_DEMO: RaitingResumen = {
  recetaId: 1,
  promedioMedallas: 4.2,
  totalVotos: 38,
  distribucionMedallas: { 1: 2, 2: 3, 3: 6, 4: 12, 5: 15 },
};

// Demo JWT falso (el componente lo pasa al endpoint; en demo no hay backend real)
const TOKEN_DEMO = 'demo-jwt-token';

// ─── Pantalla de documentación / demo ─────────────────────────────────────

export const RaitingDemo: React.FC = () => {
  const [tieneToken, setTieneToken] = useState(true);
  const [recetaId, setRecetaId] = useState(1);
  const [ultimoResumen, setUltimoResumen] = useState<RaitingResumen | null>(null);

  const cambiarReceta = (id: number) => {
    setRecetaId(id);
    setUltimoResumen(null);
  };

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenedor}>

      {/* ── Encabezado de la demo ── */}
      <View style={estilos.header}>
        <Text style={estilos.headerEmoji}>🏅</Text>
        <Text style={estilos.headerTitulo}>Sistema Raiting — Medallas</Text>
        <Text style={estilos.headerSub}>
          Escala 1-5 · Bronce → Oro · RecetArre
        </Text>
      </View>

      {/* ── Controles ── */}
      <View style={estilos.controles}>
        <Text style={estilos.controlTitulo}>Configuración de la demo</Text>

        {/* Toggle autenticado */}
        <View style={estilos.filaControl}>
          <Text style={estilos.labelControl}>
            {tieneToken ? '🔓 Usuario autenticado' : '🔒 Sin sesión'}
          </Text>
          <Switch
            value={tieneToken}
            onValueChange={setTieneToken}
            trackColor={{ false: '#E0E0E0', true: '#FFD700' }}
            thumbColor={tieneToken ? '#FF8F00' : '#BDBDBD'}
          />
        </View>

        {/* Selector de receta */}
        <Text style={estilos.labelControl}>Receta de prueba:</Text>
        <View style={estilos.filaRecetas}>
          {[1, 2, 3].map((id) => (
            <TouchableOpacity
              key={id}
              style={[
                estilos.chipReceta,
                recetaId === id && estilos.chipRecetaActivo,
              ]}
              onPress={() => cambiarReceta(id)}
              accessibilityLabel={`Receta ${id}`}
              accessibilityState={{ selected: recetaId === id }}
            >
              <Text
                style={[
                  estilos.chipRecetaTexto,
                  recetaId === id && estilos.chipRecetaTextoActivo,
                ]}
              >
                Receta #{id}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Escala de medallas (referencia visual) ── */}
      <View style={estilos.seccionReferencia}>
        <Text style={estilos.seccionTitulo}>Escala de medallas</Text>
        {[
          { nivel: 1, emoji: '🥉', nombre: 'Bronce', color: '#CD7F32', desc: 'Aceptable' },
          { nivel: 2, emoji: '🎖️', nombre: 'Bronce+', color: '#B87333', desc: 'Buena' },
          { nivel: 3, emoji: '🥈', nombre: 'Plata', color: '#A8A9AD', desc: 'Muy buena' },
          { nivel: 4, emoji: '🌟', nombre: 'Plata+', color: '#FFC107', desc: 'Excelente' },
          { nivel: 5, emoji: '🥇', nombre: 'Oro', color: '#FFD700', desc: '¡Maestra!' },
        ].map((m) => (
          <View key={m.nivel} style={estilos.filaReferencia}>
            <Text style={estilos.referenciaEmoji}>{m.emoji}</Text>
            <Text style={[estilos.referenciaNombre, { color: m.color }]}>
              {m.nivel}. {m.nombre}
            </Text>
            <Text style={estilos.referenciaDesc}>{m.desc}</Text>
          </View>
        ))}
      </View>

      {/* ── Componente real ── */}
      <View style={estilos.seccionComponente}>
        <Text style={estilos.seccionTitulo}>
          Componente en vivo — Receta #{recetaId}
        </Text>
        <RaitingMedallas
          recetaId={recetaId}
          token={tieneToken ? TOKEN_DEMO : undefined}
          onRaitingCambiado={(r) => setUltimoResumen(r)}
        />
      </View>

      {/* ── Evento onRaitingCambiado ── */}
      {ultimoResumen && (
        <View style={estilos.seccionEvento}>
          <Text style={estilos.seccionTitulo}>
            📡 Último evento onRaitingCambiado
          </Text>
          <Text style={estilos.eventoJson}>
            {JSON.stringify(ultimoResumen, null, 2)}
          </Text>
        </View>
      )}

      {/* ── Notas de accesibilidad ── */}
      <View style={estilos.seccionNota}>
        <Text style={estilos.notaTitulo}>♿ Accesibilidad implementada</Text>
        <Text style={estilos.notaItem}>
          • <Text style={estilos.negrita}>accessibilityRole="radio"</Text> en cada medalla
        </Text>
        <Text style={estilos.notaItem}>
          • <Text style={estilos.negrita}>accessibilityRole="radiogroup"</Text> en la fila
        </Text>
        <Text style={estilos.notaItem}>
          • <Text style={estilos.negrita}>accessibilityState</Text>:{' '}
          selected / disabled por estado
        </Text>
        <Text style={estilos.notaItem}>
          • <Text style={estilos.negrita}>accessibilityHint</Text> descriptivo en cada medalla
        </Text>
        <Text style={estilos.notaItem}>
          • <Text style={estilos.negrita}>AccessibilityInfo.announceForAccessibility</Text>{' '}
          al guardar voto
        </Text>
        <Text style={estilos.notaItem}>
          • <Text style={estilos.negrita}>accessibilityLiveRegion="polite"</Text>{' '}
          en descripción seleccionada
        </Text>
        <Text style={estilos.notaItem}>
          • Contraste AA: colores de texto ≥ 4.5:1 sobre fondos pastel
        </Text>
      </View>

      {/* ── Integración con API ── */}
      <View style={estilos.seccionNota}>
        <Text style={estilos.notaTitulo}>🔌 Endpoints del backend</Text>
        {[
          ['GET', '/api/raiting/receta/{id}', 'Todas las valoraciones'],
          ['GET', '/api/raiting/receta/{id}/resumen', 'Promedio + distribución'],
          ['GET', '/api/raiting/mio/{id}', 'Mi voto (auth)'],
          ['POST', '/api/raiting', 'Crear voto (auth)'],
          ['PUT', '/api/raiting/{id}', 'Actualizar voto (auth)'],
          ['DELETE', '/api/raiting/{id}', 'Eliminar voto (auth)'],
        ].map(([method, route, desc]) => (
          <View key={route} style={estilos.filaEndpoint}>
            <Text
              style={[
                estilos.method,
                method === 'GET' && { color: '#1565C0' },
                method === 'POST' && { color: '#2E7D32' },
                method === 'PUT' && { color: '#E65100' },
                method === 'DELETE' && { color: '#B71C1C' },
              ]}
            >
              {method}
            </Text>
            <Text style={estilos.route}>{route}</Text>
            <Text style={estilos.endpointDesc}>{desc}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
};

// ─── Estilos ───────────────────────────────────────────────────────────────

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: '#F0F0F5',
  },
  contenedor: {
    padding: 16,
    paddingBottom: 48,
    gap: 16,
  },

  // Header
  header: {
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  headerEmoji: { fontSize: 48, marginBottom: 8 },
  headerTitulo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  headerSub: {
    marginTop: 4,
    fontSize: 13,
    color: '#B0B0CC',
    letterSpacing: 0.3,
  },

  // Controles
  controles: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  controlTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#424242',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  filaControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelControl: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '600',
  },
  filaRecetas: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chipReceta: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  chipRecetaActivo: {
    backgroundColor: '#FFD700',
    borderColor: '#FFB300',
  },
  chipRecetaTexto: { fontSize: 13, color: '#757575', fontWeight: '600' },
  chipRecetaTextoActivo: { color: '#3E2723', fontWeight: '800' },

  // Referencia de medallas
  seccionReferencia: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: '#424242',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  filaReferencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  referenciaEmoji: { fontSize: 22, width: 30 },
  referenciaNombre: { fontSize: 14, fontWeight: '700', flex: 1 },
  referenciaDesc: { fontSize: 13, color: '#9E9E9E' },

  // Componente en vivo
  seccionComponente: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },

  // Evento
  seccionEvento: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
  },
  eventoJson: {
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    fontSize: 11,
    color: '#1B5E20',
    lineHeight: 18,
  },

  // Notas
  seccionNota: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  notaTitulo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#212121',
    marginBottom: 10,
  },
  notaItem: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 22,
  },
  negrita: { fontWeight: '700' },

  // Endpoints
  filaEndpoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    flexWrap: 'wrap',
  },
  method: {
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    fontSize: 11,
    width: 52,
    paddingTop: 1,
  },
  route: {
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    fontSize: 11,
    color: '#444',
    flex: 1,
  },
  endpointDesc: {
    fontSize: 11,
    color: '#9E9E9E',
    width: '100%',
    paddingLeft: 60,
  },
});

export default RaitingDemo;
