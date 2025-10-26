import { ElevenLabsClient } from 'elevenlabs';
import twilio from 'twilio';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import type { SentinelAlert } from './sentinel.js';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Genera audio con ElevenLabs y hace una llamada telefónica
 */
export async function makeVoiceCall(alert: SentinelAlert | any): Promise<boolean> {
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER || process.env.WHATSAPP_NUMBER;
    
    if (!phoneNumber) {
        console.error('[Voice] ❌ No hay número de teléfono configurado');
        return false;
    }

    console.log(`\n[Voice] 📞 Preparando llamada de alerta crítica...`);
    console.log(`[Voice] Alerta: ${alert.title || alert.message}`);
    
    try {
        // 1. Generar el mensaje de voz
        const voiceMessage = generateVoiceMessage(alert);
        console.log(`[Voice] 📝 Mensaje generado (${voiceMessage.length} caracteres)`);
        
        // 2. Generar audio con ElevenLabs
        const localAudioPath = await generateAudioWithElevenLabs(voiceMessage);
        
        if (!localAudioPath) {
            console.error('[Voice] ❌ No se pudo generar el audio');
            return false;
        }
        
        console.log(`[Voice] 🎵 Audio generado localmente: ${localAudioPath}`);
        
        // 3. Subir audio a Cloudinary para obtener URL pública
        const publicAudioUrl = await uploadAudioToCloudinary(localAudioPath);
        
        if (!publicAudioUrl) {
            console.error('[Voice] ❌ No se pudo obtener URL pública del audio');
            return false;
        }
        
        // 4. Hacer la llamada con Twilio usando la URL pública
        const callSid = await makePhoneCall(phoneNumber, publicAudioUrl);
        
        if (callSid) {
            console.log(`[Voice] ✅ Llamada iniciada exitosamente!`);
            console.log(`[Voice] 📱 Call SID: ${callSid}`);
            console.log(`[Voice] 📞 Llamando a: ${phoneNumber}\n`);
            return true;
        }
        
        return false;
        
    } catch (error: any) {
        console.error(`[Voice] ❌ Error en llamada de voz:`, error.message);
        return false;
    }
}

/**
 * Genera el mensaje de voz basado en la alerta
 */
function generateVoiceMessage(alert: SentinelAlert | any): string {
    const title = alert.title || `Alerta de ${alert.category}`;
    const description = alert.description || alert.message || '';
    const severity = alert.severity || 'Alto';
    
    // Mensaje urgente y directo
    let message = `Hola, soy tu asistente financiero virtual. Te llamo porque detecté una situación ${severity === 'Crítico' ? 'crítica' : 'importante'} en tus finanzas. `;
    
    // Agregar contexto específico
    if (description.includes('flujo de caja') || description.includes('saldo')) {
        message += `${description} `;
        message += `Por favor, revisa tu aplicación inmediatamente para ver las acciones recomendadas. `;
    } else if (description.includes('presupuesto')) {
        message += `${description} `;
        message += `Es importante que revises este gasto cuanto antes. `;
    } else if (description.includes('ingresos') && description.includes('disminuido')) {
        message += `Tus ingresos han caído significativamente. ${description} `;
        message += `Necesitas revisar tu estrategia financiera. `;
    } else {
        message += `${description} `;
    }
    
    // Llamado a la acción
    message += `Esta alerta requiere tu atención inmediata. Abre tu aplicación para ver los detalles completos y las recomendaciones específicas. Gracias.`;
    
    return message;
}

/**
 * Sube un archivo de audio a Cloudinary y devuelve la URL pública
 */
async function uploadAudioToCloudinary(audioPath: string): Promise<string | null> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
        console.log('[Voice] ⚠️ Cloudinary no configurado - usando archivo local');
        console.log('[Voice] 💡 Para llamadas reales, configura en .env:');
        console.log('[Voice]    CLOUDINARY_CLOUD_NAME=tu_cloud_name');
        console.log('[Voice]    CLOUDINARY_API_KEY=tu_api_key');
        console.log('[Voice]    CLOUDINARY_API_SECRET=tu_api_secret');
        return audioPath; // Devolver path local si no hay Cloudinary
    }
    
    try {
        console.log('[Voice] ☁️ Subiendo audio a Cloudinary...');
        
        const result = await cloudinary.uploader.upload(audioPath, {
            resource_type: 'video', // Cloudinary usa 'video' para archivos de audio
            folder: 'financial-alerts',
            public_id: `alert-${Date.now()}`,
            format: 'mp3'
        });
        
        console.log('[Voice] ✅ Audio subido a Cloudinary!');
        console.log('[Voice] 🔗 URL pública:', result.secure_url);
        
        return result.secure_url;
        
    } catch (error: any) {
        console.error('[Voice] ❌ Error subiendo a Cloudinary:', error.message);
        console.log('[Voice] 💡 Usando archivo local como respaldo');
        return audioPath;
    }
}

/**
 * Genera audio usando ElevenLabs
 */
async function generateAudioWithElevenLabs(text: string): Promise<string | null> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel (default)
    
    if (!apiKey) {
        console.error('[Voice] ⚠️ ElevenLabs API key no configurada');
        console.log('[Voice] 💡 Obtén tu API key en: https://elevenlabs.io/app/settings/api-keys');
        console.log('[Voice] 💡 Agrégala a tu .env como: ELEVENLABS_API_KEY=tu_key_aqui');
        return null;
    }
    
    try {
        const client = new ElevenLabsClient({ apiKey });
        
        console.log('[Voice] 🎤 Generando audio con ElevenLabs...');
        
        const audioStream = await client.textToSpeech.convert(voiceId, {
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.5,
                use_speaker_boost: true
            }
        });
        
        // Guardar el audio temporalmente
        const audioDir = path.join(process.cwd(), 'temp-audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }
        
        const audioPath = path.join(audioDir, `alert-${Date.now()}.mp3`);
        const fileStream = fs.createWriteStream(audioPath);
        
        // Escribir el stream de audio al archivo
        for await (const chunk of audioStream) {
            fileStream.write(chunk);
        }
        
        await new Promise((resolve, reject) => {
            fileStream.end();
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });
        
        console.log('[Voice] ✅ Audio guardado en:', audioPath);
        
        // Retornar la ruta del archivo (en producción usarías una URL pública)
        return audioPath;
        
    } catch (error: any) {
        console.error('[Voice] ❌ Error generando audio:', error.message);
        if (error.message.includes('401')) {
            console.log('[Voice] 💡 API key inválida. Verifica tu ELEVENLABS_API_KEY');
        }
        return null;
    }
}

/**
 * Hace la llamada telefónica usando Twilio
 */
async function makePhoneCall(toNumber: string, audioUrl: string): Promise<string | null> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER || '+18339262063';
    
    if (!accountSid || !authToken) {
        console.error('[Voice] ⚠️ Credenciales de Twilio no configuradas');
        return null;
    }
    
    try {
        const client = twilio(accountSid, authToken);
        
        console.log('[Voice] 📞 Iniciando llamada telefónica REAL...');
        console.log(`[Voice] De: ${fromNumber} → Para: ${toNumber}`);
        
        // Crear TwiML dinámico dependiendo si tenemos URL pública o no
        let twiml: string;
        
        if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
            // Si es URL pública (Cloudinary), reproducir el audio de ElevenLabs
            // Gather captura cualquier tecla presionada y continúa
            twiml = `<Response>
                <Gather numDigits="1" timeout="1" action="">
                    <Say voice="Polly.Mia" language="es-MX">Presiona cualquier tecla para escuchar tu alerta.</Say>
                </Gather>
                <Say voice="Polly.Mia" language="es-MX">Alerta crítica de tu asistente financiero.</Say>
                <Pause length="1"/>
                <Play>${audioUrl}</Play>
                <Pause length="1"/>
                <Say voice="Polly.Mia" language="es-MX">Revisa tu aplicación inmediatamente. Gracias.</Say>
            </Response>`;
        } else {
            // Si no hay URL pública, usar solo voz de Twilio
            twiml = `<Response>
                <Gather numDigits="1" timeout="1" action="">
                    <Say voice="Polly.Mia" language="es-MX">Presiona cualquier tecla para escuchar tu alerta.</Say>
                </Gather>
                <Say voice="Polly.Mia" language="es-MX">Alerta crítica de tu asistente financiero virtual.</Say>
                <Pause length="1"/>
                <Say voice="Polly.Mia" language="es-MX">Por favor, revisa tu aplicación inmediatamente.</Say>
            </Response>`;
        }
        
        const call = await client.calls.create({
            twiml,
            to: toNumber,
            from: fromNumber
        });
        
        console.log('[Voice] ✅ Llamada iniciada con éxito!');
        return call.sid;
        
    } catch (error: any) {
        console.error('[Voice] ❌ Error haciendo llamada:', error.message);
        
        if (error.code === 21608) {
            console.log('[Voice] 💡 El número no está verificado en tu cuenta Trial');
            console.log('[Voice] 💡 Ve a: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
            console.log('[Voice] 💡 Y agrega tu número: ' + toNumber);
        } else if (error.code === 21217) {
            console.log('[Voice] 💡 Tu número de Twilio no puede hacer llamadas de voz');
            console.log('[Voice] 💡 Opciones:');
            console.log('[Voice]    1. Compra un número con Voice capability (~$1/mes)');
            console.log('[Voice]    2. O usa el trial number que te asignaron');
        } else if (error.code === 20003) {
            console.log('[Voice] 💡 Credenciales inválidas. Verifica TWILIO_ACCOUNT_SID y AUTH_TOKEN');
        }
        
        return null;
    }
}

/**
 * Endpoint TwiML para Twilio (cuando tengas servidor público)
 */
export function generateTwiML(audioUrl: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Mia" language="es-MX">
        Hola, esta es una alerta de tu asistente financiero.
    </Say>
    <Play>${audioUrl}</Play>
    <Pause length="1"/>
    <Say voice="Polly.Mia" language="es-MX">
        Gracias por tu atención.
    </Say>
</Response>`;
}
