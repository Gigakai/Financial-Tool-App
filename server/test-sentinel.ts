/**
 * Script de prueba para el Sistema Sentinela
 * Ejecutar: tsx test-sentinel.ts
 */

import { runSentinelAnalysis, sendWhatsAppAlert } from './sentinel.js';

async function testSentinel() {
    console.log('🔍 Iniciando prueba del Sistema Sentinela...\n');

    const empresaId = 'E001'; // Cambiar según tu empresa

    try {
        // 1. Ejecutar análisis completo
        console.log('1️⃣ Ejecutando análisis...');
        const alerts = await runSentinelAnalysis(empresaId);

        console.log(`\n✅ Análisis completado: ${alerts.length} alertas generadas\n`);

        // 2. Mostrar resumen
        const critical = alerts.filter(a => a.severity === 'Crítico').length;
        const high = alerts.filter(a => a.severity === 'Alto').length;
        const medium = alerts.filter(a => a.severity === 'Medio').length;
        const low = alerts.filter(a => a.severity === 'Bajo').length;

        console.log('📊 Resumen de Alertas:');
        console.log(`   🔴 Críticas: ${critical}`);
        console.log(`   🟠 Altas: ${high}`);
        console.log(`   🟡 Medias: ${medium}`);
        console.log(`   🟢 Bajas: ${low}`);
        console.log('');

        // 3. Mostrar detalles de cada alerta
        if (alerts.length > 0) {
            console.log('📋 Detalles de alertas:\n');
            alerts.forEach((alert, index) => {
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`Alerta #${index + 1}`);
                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`🏷️  Tipo: ${alert.type}`);
                console.log(`📌 Categoría: ${alert.category}`);
                console.log(`⚠️  Severidad: ${alert.severity}`);
                console.log(`📝 Título: ${alert.title}`);
                console.log(`📄 Descripción: ${alert.description}`);
                if (alert.recommendation) {
                    console.log(`💡 Recomendación: ${alert.recommendation}`);
                }
                if (alert.metadata && Object.keys(alert.metadata).length > 0) {
                    console.log(`📊 Metadata:`, JSON.stringify(alert.metadata, null, 2));
                }
                console.log('');
            });
        } else {
            console.log('✅ No se detectaron problemas. Tu salud financiera está en buen estado.\n');
        }

        // 4. Probar envío de WhatsApp (solo para alertas críticas)
        const criticalAlerts = alerts.filter(a => a.severity === 'Crítico');
        if (criticalAlerts.length > 0) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📱 Probando envío de WhatsApp para alertas críticas...');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            for (const alert of criticalAlerts) {
                const success = await sendWhatsAppAlert(alert);
                if (success) {
                    console.log(`✅ WhatsApp enviado para: ${alert.title}`);
                } else {
                    console.log(`❌ Error enviando WhatsApp para: ${alert.title}`);
                }
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Prueba completada exitosamente');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error: any) {
        console.error('❌ Error en la prueba:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar prueba
testSentinel();
