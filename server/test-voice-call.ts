/**
 * Prueba rápida de llamada con voz AI
 */

import 'dotenv/config';
import { makeVoiceCall } from './voice-alert.js';
import type { SentinelAlert } from './sentinel.js';

async function testVoiceCall() {
    console.log('📞 Prueba de llamada con voz AI (ElevenLabs + Twilio)\n');

    // Crear una alerta crítica de prueba
    const testAlert: SentinelAlert = {
        id: 'test-voice-' + Date.now(),
        type: 'CRITICAL',
        category: 'cashflow',
        title: 'Alerta Crítica: Flujo de caja en riesgo',
        description: 'A este ritmo de gastos de $850 pesos diarios, tu saldo llegará a cero en aproximadamente 5 días. Esto es una situación crítica que requiere acción inmediata.',
        severity: 'Crítico',
        timestamp: new Date().toISOString(),
        actionable: true,
        recommendation: 'Reduce gastos no esenciales inmediatamente, acelera cobros pendientes y busca fuentes de financiamiento urgentes.',
        metadata: {
            dailyBurn: 850,
            daysUntilZero: 5,
            currentCash: 4250
        }
    };

    console.log('🚨 Alerta de prueba:');
    console.log(`   Título: ${testAlert.title}`);
    console.log(`   Severidad: ${testAlert.severity}`);
    console.log(`   Descripción: ${testAlert.description}\n`);

    console.log('Iniciando llamada...\n');
    
    const success = await makeVoiceCall(testAlert);

    if (success) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ¡Proceso completado!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📱 Si configuraste ElevenLabs:');
        console.log('   → Audio generado en carpeta temp-audio/');
        console.log('   → Reproduce el archivo para escuchar la alerta\n');
        console.log('📞 Para llamadas reales:');
        console.log('   → Necesitas un número de Twilio activo');
        console.log('   → Y subir el audio a un servidor público\n');
    } else {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  No se pudo completar');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('💡 Pasos para configurar:');
        console.log('   1. Obtén tu API key de ElevenLabs:');
        console.log('      https://elevenlabs.io/app/settings/api-keys');
        console.log('   2. Agrégala a tu .env:');
        console.log('      ELEVENLABS_API_KEY=tu_key_aqui\n');
    }
}

// Ejecutar
testVoiceCall();
