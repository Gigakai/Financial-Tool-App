/**
 * Prueba RÁPIDA de WhatsApp
 * Solo envía un mensaje de prueba simple
 */

import { sendWhatsAppAlert } from './sentinel.js';
import type { SentinelAlert } from './sentinel.js';

async function testWhatsAppQuick() {
    console.log('📱 Prueba rápida de WhatsApp\n');

    // Crear una alerta de prueba
    const testAlert: SentinelAlert = {
        id: 'test-' + Date.now(),
        type: 'CRITICAL',
        category: 'test',
        title: '🧪 Prueba del Sistema Sentinela',
        description: 'Este es un mensaje de prueba para verificar que WhatsApp funciona correctamente. Si recibes esto, ¡todo está configurado! 🎉',
        severity: 'Crítico',
        timestamp: new Date().toISOString(),
        actionable: true,
        recommendation: 'Si recibes este mensaje, responde con un emoji para confirmar. ✅'
    };

    console.log('Enviando mensaje de prueba...\n');
    
    const success = await sendWhatsAppAlert(testAlert);

    if (success) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ¡ÉXITO! Revisa tu WhatsApp');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  No se pudo enviar. Lee las instrucciones arriba.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}

// Ejecutar
testWhatsAppQuick();
