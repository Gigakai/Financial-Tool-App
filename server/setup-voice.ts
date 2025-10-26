/**
 * Guía rápida para configurar llamadas de voz
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         🎯 CONFIGURACIÓN DE LLAMADAS DE VOZ - 3 PASOS         ║
╚═══════════════════════════════════════════════════════════════╝

📱 PASO 1: Verificar tu número en Twilio
   ────────────────────────────────────────────────────────────
   1. Ve a: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
   2. Click en "Add a new number" (el botón rojo)
   3. Ingresa tu número: +52 81 2599 6813
   4. Recibirás un código por SMS
   5. Ingresa el código para verificar
   
   ✅ Una vez verificado, podrás recibir llamadas!

📞 PASO 2: Obtener un número de Twilio
   ────────────────────────────────────────────────────────────
   Opción A - GRATIS (Trial):
      → Twilio te asigna un número automáticamente
      → Ve a: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
      → Copia el número que aparece
      → Pégalo en tu .env como: TWILIO_FROM_NUMBER=+1XXXXXXXXXX
   
   Opción B - Comprar ($1 USD/mes):
      → Ve a: https://console.twilio.com/us1/develop/phone-numbers/manage/search
      → Busca un número con "Voice" capability
      → Cómpralo con tu crédito gratis
      → Agrégalo a tu .env

🚀 PASO 3: Probar la llamada
   ────────────────────────────────────────────────────────────
   1. Asegúrate de que tu servidor esté corriendo:
      npm run dev
   
   2. En otra terminal, ejecuta:
      npm run test-voice
   
   3. ¡Tu teléfono debería sonar! 📱

╔═══════════════════════════════════════════════════════════════╗
║                     💡 TIPS IMPORTANTES                       ║
╚═══════════════════════════════════════════════════════════════╝

• Con cuenta Trial solo puedes llamar a números verificados
• Las llamadas cuestan ~$0.02/minuto (tienes $15 gratis = 750 min)
• Si falla, revisa los logs - te dirán exactamente qué falta
• El audio de ElevenLabs ya está generándose correctamente

╔═══════════════════════════════════════════════════════════════╗
║                    🎉 ¿TODO LISTO?                            ║
╚═══════════════════════════════════════════════════════════════╝

Ejecuta: npm run test-voice

`);
