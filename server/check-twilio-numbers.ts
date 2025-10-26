import 'dotenv/config';
import twilio from 'twilio';

async function checkTwilioNumbers() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
        console.error('❌ Credenciales de Twilio no configuradas');
        return;
    }
    
    const client = twilio(accountSid, authToken);
    
    console.log('\n📞 Verificando tu cuenta de Twilio...\n');
    
    try {
        // 1. Obtener información de la cuenta
        const account = await client.api.v2010.accounts(accountSid).fetch();
        console.log('✅ Cuenta:', account.friendlyName);
        console.log('   Status:', account.status);
        console.log('   Type:', account.type);
        console.log();
        
        // 2. Listar números verificados (OutgoingCallerIds)
        console.log('📋 Números verificados para llamadas salientes:');
        const verifiedNumbers = await client.outgoingCallerIds.list();
        
        if (verifiedNumbers.length === 0) {
            console.log('   ⚠️ No hay números verificados');
            console.log('   💡 Verifica tu número en: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        } else {
            verifiedNumbers.forEach((num, i) => {
                console.log(`   ${i + 1}. ${num.phoneNumber} (${num.friendlyName})`);
            });
        }
        console.log();
        
        // 3. Listar tus números de Twilio activos
        console.log('📱 Números de Twilio que posees:');
        const ownedNumbers = await client.incomingPhoneNumbers.list();
        
        if (ownedNumbers.length === 0) {
            console.log('   ⚠️ No tienes números propios de Twilio');
        } else {
            ownedNumbers.forEach((num, i) => {
                console.log(`   ${i + 1}. ${num.phoneNumber}`);
                console.log(`      - Capabilities: Voice=${num.capabilities.voice}, SMS=${num.capabilities.sms}`);
                console.log(`      - Status: ${num.status}`);
            });
        }
        console.log();
        
        // 4. Recomendaciones
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💡 Para hacer llamadas de voz en cuenta Trial:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Verifica el número al que quieres llamar:');
        console.log('   https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        console.log();
        console.log('2. Obtén un número de Twilio con capacidad de voz:');
        console.log('   https://console.twilio.com/us1/develop/phone-numbers/manage/search');
        console.log();
        console.log('3. Número actual en tu .env: +5218125996813');
        console.log('   Número Twilio en tu .env: +15706307919');
        console.log();
        
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code === 20003) {
            console.log('\n💡 Credenciales inválidas. Verifica:');
            console.log('   - TWILIO_ACCOUNT_SID');
            console.log('   - TWILIO_AUTH_TOKEN');
        }
    }
}

checkTwilioNumbers();
